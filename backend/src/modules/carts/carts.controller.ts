import {
  Controller, Get, Post, Put, Delete, Body, Param, Headers, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/carts.dto';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';

@ApiTags('Cart')
@Controller('cart')
export class CartsController {
  constructor(private cartsService: CartsService) {}

  @UseGuards(OptionalAuthGuard)
  @Get()
  getCart(@Request() req: any, @Headers('x-session-id') sessionId?: string) {
    return this.cartsService.getOrCreateCart(req.user?.sub, sessionId);
  }

  @UseGuards(OptionalAuthGuard)
  @Post('items')
  addItem(
    @Request() req: any,
    @Headers('x-session-id') sessionId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartsService.addItem(req.user?.sub || null, sessionId || null, dto);
  }

  @Put('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.cartsService.updateItem(id, dto);
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string) {
    return this.cartsService.removeItem(id);
  }

  @UseGuards(OptionalAuthGuard)
  @Delete('clear')
  clearCart(@Request() req: any, @Headers('x-session-id') sessionId?: string) {
    return this.cartsService.clearCart(req.user?.sub, sessionId);
  }

  @UseGuards(OptionalAuthGuard)
  @Post('merge')
  mergeCart(@Request() req: any, @Headers('x-session-id') sessionId: string) {
    if (!req.user?.sub) return { message: 'No user' };
    return this.cartsService.mergeGuestCart(sessionId, req.user.sub);
  }
}
