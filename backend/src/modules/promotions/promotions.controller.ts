import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/promotions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private promotionsService: PromotionsService) {}

  @Post('validate')
  validate(@Body() dto: ValidateCouponDto) { return this.promotionsService.validate(dto); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('coupons')
  findAll() { return this.promotionsService.findAll(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('coupons')
  create(@Body() dto: CreateCouponDto) { return this.promotionsService.create(dto); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Put('coupons/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) { return this.promotionsService.update(id, dto); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete('coupons/:id')
  remove(@Param('id') id: string) { return this.promotionsService.remove(id); }
}
