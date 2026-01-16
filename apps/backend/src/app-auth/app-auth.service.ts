import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AppAuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 檢查 email 是否已存在
    const existingUser = await this.databaseService.appUser.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('此 Email 已被註冊');
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 建立用戶
    const appUser = await this.databaseService.appUser.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        phone: registerDto.phone,
        isActive: true,
      },
    });

    // 生成 JWT token
    const payload = { sub: appUser.id, email: appUser.email };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_APP_SECRET || 'app-secret-key-change-in-production',
      expiresIn: '7d',
    });

    return {
      access_token,
      user: {
        id: appUser.id,
        email: appUser.email,
        name: appUser.name,
        phone: appUser.phone,
        avatar: appUser.avatar,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const appUser = await this.databaseService.appUser.findUnique({
      where: { email },
    });

    if (!appUser || !appUser.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, appUser.password);
    if (!isPasswordValid) {
      return null;
    }

    return appUser;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_APP_SECRET || 'app-secret-key-change-in-production',
      expiresIn: '7d',
    });

    // 更新最後登入時間
    await this.databaseService.appUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
      },
    };
  }

  async getProfile(userId: string) {
    const appUser = await this.databaseService.appUser.findUnique({
      where: { id: userId },
      include: {
        tenantMemberships: {
          where: { status: 'APPROVED' },
          include: {
            tenant: {
              select: {
                id: true,
                code: true,
                name: true,
                address: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!appUser) {
      throw new NotFoundException('用戶不存在');
    }

    return {
      id: appUser.id,
      email: appUser.email,
      name: appUser.name,
      phone: appUser.phone,
      avatar: appUser.avatar,
      isActive: appUser.isActive,
      lastLoginAt: appUser.lastLoginAt,
      tenants: appUser.tenantMemberships.map(membership => ({
        ...membership.tenant,
        role: membership.role,
        joinedAt: membership.createdAt,
      })),
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const appUser = await this.databaseService.appUser.findUnique({
      where: { id: userId },
    });

    if (!appUser) {
      throw new NotFoundException('用戶不存在');
    }

    const updatedUser = await this.databaseService.appUser.update({
      where: { id: userId },
      data: updateProfileDto,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
    };
  }
}
