import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/carts.dto';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  private cartInclude = {
    items: {
      include: {
        product: {
          include: { images: { orderBy: { position: 'asc' as const }, take: 1 } },
        },
        variant: true,
      },
    },
  };

  async getOrCreateCart(userId?: string, sessionId?: string) {
    const cart = await this.resolveCart(userId, sessionId);
    return this.calculateTotals(cart);
  }

  private async resolveCart(userId?: string, sessionId?: string) {
    if (userId && sessionId) {
      const [userCart, sessionCart] = await Promise.all([
        this.findCartByUserId(userId),
        this.findCartBySessionId(sessionId),
      ]);

      if (userCart && sessionCart && userCart.id !== sessionCart.id) {
        await this.mergeCartItems(sessionCart.id, userCart.id);
        await this.prisma.cart.delete({ where: { id: sessionCart.id } });
        return this.findCartById(userCart.id);
      }

      if (userCart) return userCart;
      if (sessionCart) return this.attachSessionCartToUser(sessionCart.id, userId);
    }

    if (userId) {
      const userCart = await this.findCartByUserId(userId);
      if (userCart) return userCart;
      return this.createCart({ userId });
    }

    if (sessionId) {
      const sessionCart = await this.findCartBySessionId(sessionId);
      if (sessionCart) return sessionCart;
      return this.createCart({ sessionId });
    }

    return this.createCart({});
  }

  private async findCartById(id: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: this.cartInclude,
    });

    if (!cart) throw new NotFoundException('Carrito no encontrado');
    return cart;
  }

  private findCartByUserId(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: this.cartInclude,
    });
  }

  private findCartBySessionId(sessionId: string) {
    return this.prisma.cart.findUnique({
      where: { sessionId },
      include: this.cartInclude,
    });
  }

  private async createCart(data: { userId?: string; sessionId?: string }) {
    try {
      return await this.prisma.cart.create({
        data,
        include: this.cartInclude,
      });
    } catch (error) {
      if (this.isPrismaError(error, 'P2002')) {
        const existingCart = data.userId
          ? await this.findCartByUserId(data.userId)
          : data.sessionId
            ? await this.findCartBySessionId(data.sessionId)
            : null;

        if (existingCart) return existingCart;
      }

      throw error;
    }
  }

  private async attachSessionCartToUser(cartId: string, userId: string) {
    try {
      return await this.prisma.cart.update({
        where: { id: cartId },
        data: { userId, sessionId: null },
        include: this.cartInclude,
      });
    } catch (error) {
      if (this.isPrismaError(error, 'P2002')) {
        const userCart = await this.findCartByUserId(userId);
        if (userCart) {
          await this.mergeCartItems(cartId, userCart.id);
          await this.deleteCartIfExists(cartId);
          return this.findCartById(userCart.id);
        }
      }

      throw error;
    }
  }

  private async mergeCartItems(sourceCartId: string, targetCartId: string) {
    if (sourceCartId === targetCartId) return;

    const items = await this.prisma.cartItem.findMany({
      where: { cartId: sourceCartId },
    });

    for (const item of items) {
      const existing = await this.prisma.cartItem.findFirst({
        where: {
          cartId: targetCartId,
          productId: item.productId,
          variantId: item.variantId,
        },
      });

      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: targetCartId,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
    }
  }

  private async deleteCartIfExists(cartId: string) {
    try {
      await this.prisma.cart.delete({ where: { id: cartId } });
    } catch (error) {
      if (!this.isPrismaError(error, 'P2025')) throw error;
    }
  }

  private isPrismaError(error: unknown, code: string) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
  }

  async addItem(userId: string | null, sessionId: string | null, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId || undefined, sessionId || undefined);

    // Validate product
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || product.deletedAt || product.status !== 'ACTIVE') {
      throw new NotFoundException('Producto no disponible');
    }

    // Validate variant
    let variant = null;
    if (dto.variantId) {
      variant = await this.prisma.productVariant.findUnique({ where: { id: dto.variantId } });
      if (!variant || !variant.isActive) throw new NotFoundException('Variante no disponible');
    }

    // Check stock
    const availableStock = variant ? variant.stock : product.stock;
    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: dto.productId, variantId: dto.variantId || null },
    });
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty + dto.quantity > availableStock) {
      throw new BadRequestException(`Stock insuficiente. Disponible: ${availableStock}`);
    }

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: dto.variantId,
          quantity: dto.quantity,
        },
      });
    }

    return this.getOrCreateCart(userId || undefined, sessionId || undefined);
  }

  async updateItem(cartItemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true, variant: true, cart: true },
    });
    if (!item) throw new NotFoundException('Item no encontrado');

    if (dto.quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      const stock = item.variant ? item.variant.stock : item.product.stock;
      if (dto.quantity > stock) {
        throw new BadRequestException(`Stock insuficiente. Disponible: ${stock}`);
      }
      await this.prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: dto.quantity },
      });
    }

    return this.getOrCreateCart(
      item.cart.userId || undefined,
      item.cart.sessionId || undefined,
    );
  }

  async removeItem(cartItemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });
    if (!item) throw new NotFoundException('Item no encontrado');

    await this.prisma.cartItem.delete({ where: { id: cartItemId } });

    return this.getOrCreateCart(
      item.cart.userId || undefined,
      item.cart.sessionId || undefined,
    );
  }

  async clearCart(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getOrCreateCart(userId, sessionId);
  }

  async mergeGuestCart(sessionId: string, userId: string) {
    const guestCart = await this.findCartBySessionId(sessionId);
    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await this.findCartByUserId(userId);
    if (!userCart) {
      await this.attachSessionCartToUser(guestCart.id, userId);
      return;
    }

    if (guestCart.id !== userCart.id) {
      await this.mergeCartItems(guestCart.id, userCart.id);
      await this.deleteCartIfExists(guestCart.id);
    }
  }

  private calculateTotals(cart: any) {
    let subtotal = 0;
    const items = cart.items.map((item: any) => {
      const unitPrice = item.variant?.price ?? item.product.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;
      return { ...item, unitPrice, itemTotal };
    });

    return {
      ...cart,
      items,
      subtotal,
      itemCount: items.reduce((acc: number, i: any) => acc + i.quantity, 0),
    };
  }
}
