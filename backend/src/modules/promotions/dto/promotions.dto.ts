import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '@prisma/client';

export class CreateCouponDto {
  @IsString() code: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(DiscountType) discountType: DiscountType;
  @Type(() => Number) @IsInt() @Min(1) value: number;
  @IsOptional() @Type(() => Number) @IsInt() minPurchase?: number;
  @IsOptional() @Type(() => Number) @IsInt() maxUses?: number;
  @IsOptional() @Type(() => Number) @IsInt() maxPerUser?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
}

export class UpdateCouponDto extends CreateCouponDto {}

export class ValidateCouponDto {
  @IsString() code: string;
  @Type(() => Number) @IsInt() @Min(0) subtotal: number;
}
