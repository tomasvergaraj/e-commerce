import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/orders.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // ── Public / Customer ──

  @UseGuards(OptionalAuthGuard)
  @Post('checkout')
  checkout(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto, req.user?.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  myOrders(@Request() req: any, @Query() query: OrderQueryDto) {
    return this.ordersService.findByUser(req.user.sub, query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-orders/:orderNumber')
  myOrderDetail(@Request() req: any, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber, req.user.sub);
  }

  @Get('track/:orderNumber')
  trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  // ── Admin ──

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/stats')
  getStats() {
    return this.ordersService.getStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/list')
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/:id')
  findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Put('admin/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @Request() req: any) {
    return this.ordersService.updateStatus(id, dto, req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Put('admin/:id/notes')
  addNote(@Param('id') id: string, @Body('notes') notes: string) {
    return this.ordersService.addAdminNote(id, notes);
  }
}
