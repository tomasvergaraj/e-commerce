import { IsString, IsOptional, IsEmail, IsEnum, IsBoolean } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() phone?: string;
}

export class CreateAddressDto {
  @IsOptional() @IsString() label?: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() street: string;
  @IsOptional() @IsString() number?: string;
  @IsOptional() @IsString() apartment?: string;
  @IsString() commune: string;
  @IsString() city: string;
  @IsString() region: string;
  @IsOptional() @IsString() zipCode?: string;
  @IsOptional() @IsString() instructions?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class UpdateAddressDto extends CreateAddressDto {}

export class AdminUpdateUserDto {
  @IsOptional() @IsEnum(UserStatus) status?: UserStatus;
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
}
