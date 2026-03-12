import { IsString, IsOptional, IsEnum, IsEmail, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CheckoutItemDto {
  @IsString() productId: string;
  @IsOptional() @IsString() variantId?: string;
  @Type(() => Number) @IsInt() @Min(1) quantity: number;
}

export class CreateOrderDto {
  // Guest fields
  @IsOptional() @IsEmail() guestEmail?: string;
  @IsOptional() @IsString() guestFirstName?: string;
  @IsOptional() @IsString() guestLastName?: string;
  @IsOptional() @IsString() guestPhone?: string;

  // Address
  @IsOptional() @IsString() addressId?: string;
  // Or inline address
  @IsOptional() @IsString() shippingStreet?: string;
  @IsOptional() @IsString() shippingNumber?: string;
  @IsOptional() @IsString() shippingApartment?: string;
  @IsOptional() @IsString() shippingCommune?: string;
  @IsOptional() @IsString() shippingCity?: string;
  @IsOptional() @IsString() shippingRegion?: string;

  // Shipping
  @IsOptional() @IsString() shippingMethodId?: string;

  // Payment
  @IsOptional() @IsString() paymentMethod?: string;

  // Cart items
  @IsArray() items: CheckoutItemDto[];

  // Coupon
  @IsOptional() @IsString() couponCode?: string;

  @IsOptional() @IsString() notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus) status: OrderStatus;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsString() trackingCode?: string;
}

export class OrderQueryDto extends PaginationDto {
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @IsString() search?: string;
}
