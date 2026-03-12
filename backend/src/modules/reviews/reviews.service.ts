import { Injectable, BadRequestException } from '@nestjs/common';
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

  async create(userId: string, dto: CreateReviewDto) {
    const existing = await this.prisma.review.findUnique({
      where: { productId_userId: { productId: dto.productId, userId } },
    });
    if (existing) throw new BadRequestException('Ya dejaste una reseña para este producto');

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
