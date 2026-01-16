import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    // 檢查 email 是否已存在
    const existing = await this.databaseService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    // 如果是 TENANT_ADMIN 或 STAFF，必須提供 tenantId
    if (
      (createUserDto.role === 'TENANT_ADMIN' || createUserDto.role === 'STAFF') &&
      !createUserDto.tenantId
    ) {
      throw new ConflictException('Tenant ID is required for TENANT_ADMIN and STAFF roles');
    }

    // 如果是 SUPER_ADMIN，不應該有 tenantId
    if (createUserDto.role === 'SUPER_ADMIN' && createUserDto.tenantId) {
      throw new ConflictException('SUPER_ADMIN should not have a tenant ID');
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.databaseService.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async findAll(paginationDto: PaginationDto, tenantId?: string): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const [users, total] = await Promise.all([
      this.databaseService.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      this.databaseService.user.count({ where }),
    ]);

    // 不返回密碼
    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return {
      data: usersWithoutPassword,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const user = await this.databaseService.user.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 不返回密碼
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    await this.findOne(id);

    // 如果更新 email，檢查是否重複
    if (updateUserDto.email) {
      const existing = await this.databaseService.user.findFirst({
        where: {
          email: updateUserDto.email,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: any = { ...updateUserDto };

    // 如果更新密碼，加密
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = await this.databaseService.user.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async remove(id: string): Promise<any> {
    await this.findOne(id);

    const deleted = await this.databaseService.user.delete({
      where: { id },
    });

    const { password, ...userWithoutPassword } = deleted;
    return userWithoutPassword;
  }

  async toggleActive(id: string): Promise<any> {
    const user = await this.findOne(id);
    
    const updated = await this.databaseService.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
    });

    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }
}
