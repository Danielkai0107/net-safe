import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppAuthService } from './app-auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { LocalAppAuthGuard } from './guards/local-app-auth.guard';
import { JwtAppAuthGuard } from './guards/jwt-app-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('app/auth')
export class AppAuthController {
  constructor(private readonly appAuthService: AppAuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.appAuthService.register(registerDto);
    return {
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('debug/env')
  async debugEnv() {
    return {
      hasJwtAppSecret: !!process.env.JWT_APP_SECRET,
      secretPrefix: process.env.JWT_APP_SECRET?.substring(0, 10),
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @UseGuards(LocalAppAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    const result = await this.appAuthService.login(req.user);
    return {
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAppAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const profile = await this.appAuthService.getProfile(req.user.userId);
    return {
      data: profile,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAppAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const result = await this.appAuthService.updateProfile(
      req.user.userId,
      updateProfileDto,
    );
    return {
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
