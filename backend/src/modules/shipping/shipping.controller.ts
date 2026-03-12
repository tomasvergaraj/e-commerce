import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { CreateShippingMethodDto, UpdateShippingMethodDto } from './dto/shipping.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  @Get('methods')
  findAll() {
    return this.shippingService.findAll(true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/methods')
  findAllAdmin() {
    return this.shippingService.findAll(false);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('methods')
  create(@Body() dto: CreateShippingMethodDto) {
    return this.shippingService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Put('methods/:id')
  update(@Param('id') id: string, @Body() dto: UpdateShippingMethodDto) {
    return this.shippingService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete('methods/:id')
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }
}
