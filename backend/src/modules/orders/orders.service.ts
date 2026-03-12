import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/orders.dto';
import { paginate } from '../../common/dto/pagination.dto';
import { OrderStatus } from '@prisma/client';

function generateOrderNumber(): string {
  const prefix = 'NX';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private orderInclude = {
    items: {
      include: {
        product: { include: { images: { take: 1 } } },
        variant: true,
      },
    },
    payment: true,
    statusHistory: { orderBy: { createdAt: 'desc' as const } },
    user: { select: { id: true, email: true, firstName: true, lastName: true } },
    address: true,
    shippingMethod: true,
  };

  async create(dto: CreateOrderDto, userId?: string) {
    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.deletedAt || product.status !== 'ACTIVE') {
        throw new BadRequestException(`Producto no disponible: ${item.productId}`);
      }

      let variant = null;
      if (item.variantId) {
        variant = await this.prisma.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant || !variant.isActive) throw new BadRequestException('Variante no disponible');
      }

      const stock = variant ? variant.stock : product.stock;
      if (item.quantity > stock) {
        throw new BadRequestException(`Stock insuficiente para ${product.name}`);
      }

      const unitPrice = variant?.price ?? product.price;
      const total = unitPrice * item.quantity;
      subtotal += total;

      orderItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        variantName: variant?.name || null,
        sku: variant?.sku || product.sku,
        price: unitPrice,
        quantity: item.quantity,
        total,
      });
    }

    // Shipping cost
    let shippingCost = 0;
    if (dto.shippingMethodId) {
      const method = await this.prisma.shippingMethod.findUnique({
        where: { id: dto.shippingMethodId },
      });
      if (method) shippingCost = method.price;
    }

    // Coupon discount
    let discount = 0;
    let couponCode: string | null = null;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.couponCode } });
      if (coupon && coupon.isActive) {
        const now = new Date();
        const validDate = (!coupon.startsAt || coupon.startsAt <= now) && (!coupon.expiresAt || coupon.expiresAt >= now);
        const validUses = !coupon.maxUses || coupon.usedCount < coupon.maxUses;

        if (validDate && validUses && (!coupon.minPurchase || subtotal >= coupon.minPurchase)) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = Math.round(subtotal * coupon.value / 100);
          } else {
            discount = coupon.value;
          }
          couponCode = coupon.code;

          await this.prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: coupon.usedCount + 1 },
          });

          if (userId) {
            await this.prisma.couponUsage.create({
              data: { couponId: coupon.id, userId },
            });
          }
        }
      }
    }

    const total = subtotal - discount + shippingCost;

    // Snapshot address
    let addressData: any = {};
    if (dto.addressId && userId) {
      const addr = await this.prisma.address.findFirst({ where: { id: dto.addressId, userId } });
      if (addr) {
        addressData = {
          addressId: addr.id,
          shippingStreet: addr.street,
          shippingNumber: addr.number,
          shippingApartment: addr.apartment,
          shippingCommune: addr.commune,
          shippingCity: addr.city,
          shippingRegion: addr.region,
        };
      }
    } else {
      addressData = {
        shippingStreet: dto.shippingStreet,
        shippingNumber: dto.shippingNumber,
        shippingApartment: dto.shippingApartment,
        shippingCommune: dto.shippingCommune,
        shippingCity: dto.shippingCity,
        shippingRegion: dto.shippingRegion,
      };
    }

    // Create order
    const order = await this.prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: userId || null,
        guestEmail: dto.guestEmail,
        guestFirstName: dto.guestFirstName,
        guestLastName: dto.guestLastName,
        guestPhone: dto.guestPhone,
        ...addressData,
        shippingMethodId: dto.shippingMethodId,
        subtotal,
        discount,
        shippingCost,
        total,
        couponCode,
        notes: dto.notes,
        items: { create: orderItems },
        payment: {
          create: {
            method: (dto.paymentMethod as any) || 'MOCK_GATEWAY',
            status: 'PENDING',
            amount: total,
          },
        },
        statusHistory: {
          create: { status: 'PENDING', note: 'Pedido creado' },
        },
      },
      include: this.orderInclude,
    });

    // Deduct stock
    for (const item of dto.items) {
      if (item.variantId) {
        await this.prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });
      }
    }

    // Clear cart
    if (userId) {
      const cart = await this.prisma.cart.findUnique({ where: { userId } });
      if (cart) await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return order;
  }

  async findByUser(userId: string, query: OrderQueryDto) {
    const where: any = { userId };
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { include: { images: { take: 1 } } } } },
          payment: true,
          shippingMethod: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return paginate(items, total, query);
  }

  async findByOrderNumber(orderNumber: string, userId?: string) {
    const where: any = { orderNumber };
    if (userId) where.userId = userId;

    const order = await this.prisma.order.findFirst({
      where,
      include: this.orderInclude,
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  // ── Admin ──

  async findAll(query: OrderQueryDto) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { guestEmail: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payment: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return paginate(items, total, query);
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderInclude,
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, changedBy?: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    const updateData: any = { status: dto.status };
    if (dto.trackingCode) updateData.trackingCode = dto.trackingCode;

    // Update related timestamps
    if (dto.status === OrderStatus.CONFIRMED) {
      updateData.paymentStatus = 'APPROVED';
      updateData.paidAt = new Date();
    }
    if (dto.status === OrderStatus.SHIPPED) {
      updateData.shippingStatus = 'SHIPPED';
      updateData.shippedAt = new Date();
    }
    if (dto.status === OrderStatus.DELIVERED) {
      updateData.shippingStatus = 'DELIVERED';
      updateData.deliveredAt = new Date();
    }
    if (dto.status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
      // Restore stock
      const items = await this.prisma.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        if (item.variantId) {
          await this.prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await this.prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        statusHistory: {
          create: { status: dto.status, note: dto.note, changedBy },
        },
      },
      include: this.orderInclude,
    });

    // Update payment if confirmed
    if (dto.status === OrderStatus.CONFIRMED) {
      await this.prisma.payment.updateMany({
        where: { orderId: id },
        data: { status: 'APPROVED', paidAt: new Date() },
      });
    }

    return updated;
  }

  async addAdminNote(id: string, note: string) {
    return this.prisma.order.update({
      where: { id },
      data: { adminNotes: note },
    });
  }

  // ── Dashboard stats ──

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders, pendingOrders, todayOrders, monthRevenue,
      totalRevenue, totalCustomers, recentOrders,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: thisMonth }, paymentStatus: 'APPROVED' },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'APPROVED' },
        _sum: { total: true },
      }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      todayOrders,
      monthRevenue: monthRevenue._sum.total || 0,
      totalRevenue: totalRevenue._sum.total || 0,
      totalCustomers,
      recentOrders,
    };
  }
}
