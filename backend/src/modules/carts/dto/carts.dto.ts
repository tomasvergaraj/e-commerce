import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsString() productId: string;
  @IsOptional() @IsString() variantId?: string;
  @Type(() => Number) @IsInt() @Min(1) quantity: number = 1;
}

export class UpdateCartItemDto {
  @Type(() => Number) @IsInt() @Min(0) quantity: number;
}
