import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/reviews.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('product/:productId')
  getByProduct(@Param('productId') productId: string) {
    return this.reviewsService.getByProduct(productId);
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  @Get('eligibility/:productId')
  getEligibility(@Request() req: any, @Param('productId') productId: string) {
    return this.reviewsService.getEligibility(req.user.sub, productId);
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.sub, dto);
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/all')
  getAllAdmin() { return this.reviewsService.getAllAdmin(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/pending')
  getPending() { return this.reviewsService.getPending(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Put('admin/approve/:id')
  approve(@Param('id') id: string) { return this.reviewsService.approve(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete('admin/reject/:id')
  reject(@Param('id') id: string) { return this.reviewsService.reject(id); }
}
