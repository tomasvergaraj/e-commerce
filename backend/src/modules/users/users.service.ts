import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  UpdateProfileDto,
  CreateAddressDto,
  UpdateAddressDto,
  AdminUpdateUserDto,
  UserQueryDto,
} from './dto/users.dto';
import { paginate } from '../../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { addresses: true },
    });
    if (!user || user.deletedAt) throw new NotFoundException('Usuario no encontrado');
    const { password, ...rest } = user;
    return rest;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    const { password, ...rest } = user;
    return rest;
  }

  // ── Addresses ──

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: { ...dto, userId },
    });
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const addr = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!addr) throw new NotFoundException('Dirección no encontrada');

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const addr = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!addr) throw new NotFoundException('Dirección no encontrada');
    await this.prisma.address.delete({ where: { id: addressId } });
    return { message: 'Dirección eliminada' };
  }

  // ── Admin ──

  async findAll(query: UserQueryDto) {
    const where: any = {
      deletedAt: null,
      role: UserRole.CUSTOMER,
    };

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, role: true, status: true, createdAt: true,
          lastLoginAt: true, _count: { select: { orders: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginate(items, total, query);
  }

  async adminUpdateUser(userId: string, dto: AdminUpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, status: true,
      },
    });
  }
}
