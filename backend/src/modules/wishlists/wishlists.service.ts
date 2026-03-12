import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class WishlistsService {
  constructor(private prisma: PrismaService) {}

  async getByUser(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { images: { orderBy: { position: 'asc' }, take: 1 } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggle(userId: string, productId: string) {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { added: false, message: 'Eliminado de favoritos' };
    }

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new BadRequestException('Producto no encontrado');

    await this.prisma.wishlistItem.create({ data: { userId, productId } });
    return { added: true, message: 'Agregado a favoritos' };
  }

  async check(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return { isInWishlist: !!item };
  }

  async remove(userId: string, productId: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });
    return { message: 'Eliminado de favoritos' };
  }
}
