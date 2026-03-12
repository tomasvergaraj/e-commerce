import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @IsString() name: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsInt() position?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDesc?: string;
}

export class UpdateCategoryDto extends CreateCategoryDto {}
