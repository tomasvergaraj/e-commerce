import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistsService } from './wishlists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) {}

  @Get()
  getAll(@Request() req: any) { return this.wishlistsService.getByUser(req.user.sub); }

  @Post(':productId')
  toggle(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistsService.toggle(req.user.sub, productId);
  }

  @Get('check/:productId')
  check(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistsService.check(req.user.sub, productId);
  }

  @Delete(':productId')
  remove(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistsService.remove(req.user.sub, productId);
  }
}
