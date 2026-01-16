import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';

@Injectable()
export class AppUsersService {
  constructor(private databaseService: DatabaseService) {}

  async findAll(paginationDto: PaginationDto): Promise<any> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [appUsers, total] = await Promise.all([
      this.databaseService.appUser.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenantMemberships: {
            where: { status: 'APPROVED' },
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          _count: {
            select: {
              tenantMemberships: true,
              alertAssignments: true,
            },
          },
        },
      }),
      this.databaseService.appUser.count(),
    ]);

    // 不返回密碼
    const usersWithoutPassword = appUsers.map(({ password, ...user }) => user);

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
    const appUser = await this.databaseService.appUser.findUnique({
      where: { id },
      include: {
        tenantMemberships: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        _count: {
          select: {
            tenantMemberships: true,
            alertAssignments: true,
            pushTokens: true,
          },
        },
      },
    });

    if (!appUser) {
      throw new NotFoundException('App user not found');
    }

    const { password, ...userWithoutPassword } = appUser;
    return userWithoutPassword;
  }

  async update(id: string, updateAppUserDto: UpdateAppUserDto): Promise<any> {
    await this.findOne(id);

    const updated = await this.databaseService.appUser.update({
      where: { id },
      data: updateAppUserDto,
    });

    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async toggleActive(id: string): Promise<any> {
    const user = await this.findOne(id);
    
    const updated = await this.databaseService.appUser.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
    });

    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async remove(id: string): Promise<any> {
    await this.findOne(id);

    const deleted = await this.databaseService.appUser.delete({
      where: { id },
    });

    const { password, ...userWithoutPassword } = deleted;
    return userWithoutPassword;
  }

  async getAvailableForSelection(): Promise<any> {
    const users = await this.databaseService.appUser.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return users;
  }
}
