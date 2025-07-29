import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

export interface JwtPayload {
  sub: number; // user id
  email: string;
  clerkId?: string | null;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtUtils {
  constructor(private jwtService: JwtService) {}

  async generateTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // 15 分钟
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // 7 天
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async decodeToken(token: string): Promise<JwtPayload | null> {
    try {
      return this.jwtService.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = await this.verifyToken(refreshToken);

      // 创建新的 access token，移除时间戳
      const { iat, exp, ...tokenPayload } = payload;

      return this.jwtService.sign(tokenPayload, {
        expiresIn: '15m',
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
