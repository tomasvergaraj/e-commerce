import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findByOrderId(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }

  /**
   * Mock gateway: simulates payment processing.
   * In production, replace with Webpay/MercadoPago/Stripe integration.
   */
  async processPayment(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Pago no encontrado');

    // Simulate gateway response - always approves in mock mode
    const transactionId = `MOCK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const updated = await this.prisma.payment.update({
      where: { orderId },
      data: {
        status: PaymentStatus.APPROVED,
        transactionId,
        paidAt: new Date(),
        gatewayResponse: {
          gateway: 'mock',
          status: 'approved',
          transactionId,
          processedAt: new Date().toISOString(),
        },
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.APPROVED,
        status: 'CONFIRMED',
        paidAt: new Date(),
        statusHistory: {
          create: { status: 'CONFIRMED', note: 'Pago aprobado (Mock Gateway)' },
        },
      },
    });

    return updated;
  }

  async refund(orderId: string) {
    return this.prisma.payment.update({
      where: { orderId },
      data: { status: PaymentStatus.REFUNDED },
    });
  }
}
