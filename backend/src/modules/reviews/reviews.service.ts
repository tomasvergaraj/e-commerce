import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateReviewDto } from './dto/reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEligibility(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { id: true, name: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const existingReview = await this.prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
      select: {
        id: true,
        isApproved: true,
        createdAt: true,
      },
    });

    if (existingReview) {
        return {
          canReview: false,
          hasDeliveredPurchase: true,
          reason: existingReview.isApproved
          ? 'Ya dejaste una reseña para este producto.'
          : 'Tu reseña ya fue enviada y está pendiente de aprobación.',
          existingReview,
        };
    }

    const deliveredOrderItem = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: 'DELIVERED',
        },
      },
      select: {
        id: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            deliveredAt: true,
          },
        },
      },
    });

    if (!deliveredOrderItem) {
      return {
        canReview: false,
        hasDeliveredPurchase: false,
        reason: 'Podrás dejar una reseña cuando alguno de tus pedidos de este producto figure como entregado.',
        existingReview: null,
      };
    }

    return {
      canReview: true,
      hasDeliveredPurchase: true,
      reason: 'Puedes dejar una reseña para este producto.',
      existingReview: null,
      deliveredOrder: deliveredOrderItem.order,
    };
  }

  async create(userId: string, dto: CreateReviewDto) {
    const eligibility = await this.getEligibility(userId, dto.productId);
    if (!eligibility.canReview) {
      throw new BadRequestException(eligibility.reason);
    }

    const review = await this.prisma.review.create({
      data: { ...dto, userId, isApproved: false },
    });

    return review;
  }

  async approve(id: string) {
    const review = await this.prisma.review.update({
      where: { id },
      data: { isApproved: true },
    });

    // Recalculate product rating
    const agg = await this.prisma.review.aggregate({
      where: { productId: review.productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.product.update({
      where: { id: review.productId },
      data: {
        avgRating: agg._avg.rating || 0,
        reviewCount: agg._count.rating,
      },
    });

    return review;
  }

  async reject(id: string) {
    await this.prisma.review.delete({ where: { id } });
    return { message: 'Reseña rechazada' };
  }

  async getPending() {
    return this.prisma.review.findMany({
      where: { isApproved: false },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllAdmin() {
    return this.prisma.review.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
