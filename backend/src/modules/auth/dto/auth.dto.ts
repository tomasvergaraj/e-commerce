import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class RegisterDto {
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail({}, { message: 'Email invalido' })
  @MaxLength(254, { message: 'El email es demasiado largo' })
  email: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'La contrasena es demasiado larga' })
  @Matches(PASSWORD_COMPLEXITY_REGEX, {
    message: 'La contrasena debe incluir al menos una letra y un numero',
  })
  password: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1, { message: 'El nombre es obligatorio' })
  @MaxLength(80, { message: 'El nombre es demasiado largo' })
  firstName: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1, { message: 'El apellido es obligatorio' })
  @MaxLength(80, { message: 'El apellido es demasiado largo' })
  lastName: string;

  @Transform(({ value }) => trimString(value))
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: 'El telefono es demasiado largo' })
  phone?: string;
}

export class LoginDto {
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail({}, { message: 'Email invalido' })
  @MaxLength(254, { message: 'El email es demasiado largo' })
  email: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(72, { message: 'La contrasena es demasiado larga' })
  password: string;
}

export class ChangePasswordDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(72, { message: 'La contrasena actual es demasiado larga' })
  currentPassword: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(8, { message: 'La nueva contrasena debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'La nueva contrasena es demasiado larga' })
  @Matches(PASSWORD_COMPLEXITY_REGEX, {
    message: 'La nueva contrasena debe incluir al menos una letra y un numero',
  })
  newPassword: string;
}
