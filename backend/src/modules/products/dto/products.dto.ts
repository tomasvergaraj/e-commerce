import { IsString, IsOptional, IsInt, IsBoolean, IsArray, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateProductDto {
  @IsString() name: string;
  @IsOptional() @IsString() slug?: string;
  @IsString() sku: string;
  @IsOptional() @IsString() shortDesc?: string;
  @IsOptional() @IsString() longDesc?: string;
  @Type(() => Number) @IsInt() @Min(0) price: number;
  @IsOptional() @Type(() => Number) @IsInt() comparePrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() costPrice?: number;
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @IsOptional() @IsBoolean() isVisible?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) stock?: number;
  @IsOptional() @Type(() => Number) @IsInt() lowStockAlert?: number;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsNumber() weight?: number;
  @IsOptional() @IsNumber() width?: number;
  @IsOptional() @IsNumber() height?: number;
  @IsOptional() @IsNumber() length?: number;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDesc?: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() @IsArray() categoryIds?: string[];
  @IsOptional() @IsString() primaryCategoryId?: string;
  @IsOptional() @IsArray() images?: { url: string; alt?: string; position?: number }[];
}

export class UpdateProductDto extends CreateProductDto {}

export class ProductQueryDto extends PaginationDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @Type(() => Number) @IsInt() minPrice?: number;
  @IsOptional() @Type(() => Number) @IsInt() maxPrice?: number;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() onSale?: boolean;
  @IsOptional() @IsBoolean() inStock?: boolean;
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
}

export class CreateVariantDto {
  @IsString() name: string;
  @IsString() sku: string;
  @IsOptional() @Type(() => Number) @IsInt() price?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() imageUrl?: string;
  options: Record<string, string>;
  @IsOptional() @Type(() => Number) @IsInt() position?: number;
}

export class UpdateVariantDto extends CreateVariantDto {}
