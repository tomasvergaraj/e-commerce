import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/promotions.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateCouponDto) {
    const exists = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (exists) throw new BadRequestException('El código ya existe');
    return this.prisma.coupon.create({ data: { ...dto, code: dto.code.toUpperCase() } });
  }

  async update(id: string, dto: UpdateCouponDto) {
    return this.prisma.coupon.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Cupón eliminado' };
  }

  async validate(dto: ValidateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (!coupon || !coupon.isActive) throw new BadRequestException('Cupón inválido');
    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) throw new BadRequestException('Cupón aún no vigente');
    if (coupon.expiresAt && coupon.expiresAt < now) throw new BadRequestException('Cupón expirado');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Cupón agotado');
    if (coupon.minPurchase && dto.subtotal < coupon.minPurchase) throw new BadRequestException('Compra mínima no alcanzada');

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round(dto.subtotal * coupon.value / 100);
    } else {
      discount = coupon.value;
    }
    return { valid: true, coupon, discount };
  }
}
