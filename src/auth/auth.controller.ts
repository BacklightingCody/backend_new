import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, AuthGuard } from './auth.guard';
import { ApiResponse } from '../types';
import { User } from '@prisma/client';

interface LoginDto {
  email: string;
  password: string;
}

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

interface RefreshTokenDto {
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<any>> {
    try {
      const result = await this.authService.register(registerDto);
      return {
        success: true,
        data: result,
        message: 'User registered successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<any>> {
    try {
      const result = await this.authService.login(loginDto.email, loginDto.password);
      return {
        success: true,
        data: result,
        message: 'Login successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Public()
  @Post('clerk-sync')
  async clerkSync(@Body() clerkSyncDto: ClerkSyncDto): Promise<ApiResponse<any>> {
    try {
      const result = await this.authService.syncWithClerk(clerkSyncDto);
      return {
        success: true,
        data: result,
        message: 'Clerk sync successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<ApiResponse<any>> {
    try {
      const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
      return {
        success: true,
        data: result,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req): Promise<ApiResponse<User>> {
    try {
      const user = await this.authService.getProfile(req.user.id);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Request() req): Promise<ApiResponse<any>> {
    try {
      await this.authService.logout(req.user.id);
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Public()
  @Post('verify-token')
  async verifyToken(@Body() body: { token: string }): Promise<ApiResponse<any>> {
    try {
      const result = await this.authService.verifyToken(body.token);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
