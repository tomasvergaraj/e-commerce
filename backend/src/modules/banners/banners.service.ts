import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { IsString, IsOptional, IsBoolean, IsInt, IsDateString } from 'class-validator';

export class CreateBannerDto {
  @IsString() title: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsString() imageUrl: string;
  @IsOptional() @IsString() linkUrl?: string;
  @IsOptional() @IsInt() position?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
}

export class UpdateBannerDto extends CreateBannerDto {}

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async findActive() {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null, expiresAt: null },
          { startsAt: { lte: now }, expiresAt: null },
          { startsAt: null, expiresAt: { gte: now } },
          { startsAt: { lte: now }, expiresAt: { gte: now } },
        ],
      },
      orderBy: { position: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.banner.findMany({ orderBy: { position: 'asc' } });
  }

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateBannerDto) {
    return this.prisma.banner.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.prisma.banner.delete({ where: { id } });
    return { message: 'Banner eliminado' };
  }
}
