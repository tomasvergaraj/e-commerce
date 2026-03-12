import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShippingMethodDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @Type(() => Number) @IsInt() @Min(0) price: number;
  @Type(() => Number) @IsInt() @Min(1) minDays: number;
  @Type(() => Number) @IsInt() @Min(1) maxDays: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsArray() regions?: string[];
}

export class UpdateShippingMethodDto extends CreateShippingMethodDto {}
