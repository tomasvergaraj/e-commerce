import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateShippingMethodDto, UpdateShippingMethodDto } from './dto/shipping.dto';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async findAll(activeOnly = false) {
    const where: any = {};
    if (activeOnly) where.isActive = true;
    return this.prisma.shippingMethod.findMany({ where, orderBy: { price: 'asc' } });
  }

  async findById(id: string) {
    const method = await this.prisma.shippingMethod.findUnique({ where: { id } });
    if (!method) throw new NotFoundException('Método de envío no encontrado');
    return method;
  }

  async create(dto: CreateShippingMethodDto) {
    return this.prisma.shippingMethod.create({ data: dto });
  }

  async update(id: string, dto: UpdateShippingMethodDto) {
    return this.prisma.shippingMethod.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.shippingMethod.delete({ where: { id } });
    return { message: 'Método de envío eliminado' };
  }
}
