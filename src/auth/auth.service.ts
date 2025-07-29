import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { JwtUtils, JwtPayload, TokenPair } from './jwt.utils';
import { User } from '@prisma/client';

interface RegisterDto {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

interface ClerkSyncDto {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
}

interface LoginResult {
  user: Omit<User, 'passwordHash'>;
  tokens: TokenPair;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtUtils: JwtUtils,
  ) {}

  async register(registerDto: RegisterDto): Promise<LoginResult> {
    // 检查邮箱是否已存在
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 检查用户名是否已存在
    if (registerDto.username) {
      const existingUsername = await this.userService.findByUsername(registerDto.username);
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    // 加密密码
    const passwordHash = await this.jwtUtils.hashPassword(registerDto.password);

    // 创建用户
    const user = await this.userService.create({
      ...registerDto,
      passwordHash,
    });

    // 生成 tokens
    const tokens = await this.jwtUtils.generateTokens({
      sub: user.id,
      email: user.email,
      clerkId: user.clerkId,
      role: user.role,
    });

    // 保存 session
    await this.createSession(user.id, tokens.refreshToken);

    // 移除密码哈希
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async login(email: string, password: string): Promise<LoginResult> {
    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 检查用户状态
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // 验证密码
    if (!user.passwordHash) {
      throw new UnauthorizedException('Password not set. Please use social login.');
    }

    const isPasswordValid = await this.jwtUtils.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 生成 tokens
    const tokens = await this.jwtUtils.generateTokens({
      sub: user.id,
      email: user.email,
      clerkId: user.clerkId,
      role: user.role,
    });

    // 保存 session
    await this.createSession(user.id, tokens.refreshToken);

    // 移除密码哈希
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async syncWithClerk(clerkSyncDto: ClerkSyncDto): Promise<LoginResult> {
    // 使用 UserService 的 syncWithClerk 方法
    const user = await this.userService.syncWithClerk({
      id: clerkSyncDto.clerkId,
      email: clerkSyncDto.email,
      firstName: clerkSyncDto.firstName,
      lastName: clerkSyncDto.lastName,
      imageUrl: clerkSyncDto.imageUrl,
      username: clerkSyncDto.username,
    });

    // 生成 tokens
    const tokens = await this.jwtUtils.generateTokens({
      sub: user.id,
      email: user.email,
      clerkId: user.clerkId,
      role: user.role,
    });

    // 保存 session
    await this.createSession(user.id, tokens.refreshToken);

    // 移除密码哈希
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // 验证 refresh token
      const payload = await this.jwtUtils.verifyToken(refreshToken);

      // 检查 session 是否存在
      const session = await this.prisma.session.findFirst({
        where: {
          token: refreshToken,
          userId: payload.sub,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 检查用户状态
      const user = await this.userService.findOne(payload.sub);
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Account is not active');
      }

      // 生成新的 access token
      const accessToken = await this.jwtUtils.refreshAccessToken(refreshToken);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: number): Promise<User> {
    return this.userService.findOne(userId);
  }

  async logout(userId: number): Promise<void> {
    // 删除用户的所有 sessions
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async verifyToken(token: string): Promise<{ valid: boolean; payload?: JwtPayload }> {
    try {
      const payload = await this.jwtUtils.verifyToken(token);
      
      // 检查用户是否存在且状态正常
      const user = await this.userService.findOne(payload.sub);
      if (user.status !== 'ACTIVE') {
        return { valid: false };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
  }

  private async createSession(userId: number, refreshToken: string): Promise<void> {
    // 删除过期的 sessions
    await this.prisma.session.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // 创建新的 session
    await this.prisma.session.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 天
      },
    });
  }
}
