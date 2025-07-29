import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtUtils, JwtPayload } from './jwt.utils';
import { PrismaService } from '../prisma/prisma.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtUtils: JwtUtils,
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = this.jwtUtils.extractTokenFromHeader(authHeader);
    if (!token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      const payload: JwtPayload = await this.jwtUtils.verifyToken(token);

      // 验证用户是否存在且状态正常
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          clerkId: true,
          role: true,
          status: true,
          username: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User account is not active');
      }

      // 检查角色权限
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (requiredRoles && !requiredRoles.includes(user.role)) {
        throw new UnauthorizedException('Insufficient permissions');
      }

      // 将用户信息添加到请求对象
      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// 可选的认证守卫，不会抛出错误，只是设置用户信息
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private jwtUtils: JwtUtils,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return true; // 没有认证头，继续执行
    }

    const token = this.jwtUtils.extractTokenFromHeader(authHeader);
    if (!token) {
      return true; // 无效的认证头格式，继续执行
    }

    try {
      const payload: JwtPayload = await this.jwtUtils.verifyToken(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          clerkId: true,
          role: true,
          status: true,
          username: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      });

      if (user && user.status === 'ACTIVE') {
        request.user = user;
      }
    } catch (error) {
      // 忽略错误，继续执行
    }

    return true;
  }
}
