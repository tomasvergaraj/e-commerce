import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { mkdirSync, readFileSync, unlinkSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { getUploadsDir } from '../../common/config/runtime.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const uploadsPath = getUploadsDir();
    mkdirSync(uploadsPath, { recursive: true });
    cb(null, uploadsPath);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const extension = extname(file.originalname).toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype) || !ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    cb(new BadRequestException('Solo se permiten imagenes JPG, PNG o WEBP'), false);
    return;
  }

  cb(null, true);
};

function isValidImageSignature(file: Express.Multer.File) {
  const buffer = readFileSync(file.path);

  if (file.mimetype === 'image/png') {
    return buffer.length >= 8
      && buffer[0] === 0x89
      && buffer[1] === 0x50
      && buffer[2] === 0x4e
      && buffer[3] === 0x47
      && buffer[4] === 0x0d
      && buffer[5] === 0x0a
      && buffer[6] === 0x1a
      && buffer[7] === 0x0a;
  }

  if (file.mimetype === 'image/jpeg') {
    return buffer.length >= 3
      && buffer[0] === 0xff
      && buffer[1] === 0xd8
      && buffer[2] === 0xff;
  }

  if (file.mimetype === 'image/webp') {
    return buffer.length >= 12
      && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
      && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }

  return false;
}

function assertTrustedImage(file: Express.Multer.File) {
  if (isValidImageSignature(file)) {
    return;
  }

  try {
    unlinkSync(file.path);
  } catch {}

  throw new BadRequestException('La imagen subida no paso la validacion de seguridad');
}

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('upload')
export class UploadController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: imageFilter,
      limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    assertTrustedImage(file);

    return {
      url: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
