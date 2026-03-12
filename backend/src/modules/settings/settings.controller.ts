import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('public')
  getPublicSettings() { return this.settingsService.getAll(); }

  @Get('pages/:slug')
  getPage(@Param('slug') slug: string) { return this.settingsService.getPageBySlug(slug); }

  // Admin
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/all')
  getAll() { return this.settingsService.getAll(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Put('admin/bulk')
  bulkUpdate(@Body() settings: Record<string, any>) { return this.settingsService.bulkUpdate(settings); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/pages')
  getPages() { return this.settingsService.getPages(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('admin/pages')
  createPage(@Body() data: any) { return this.settingsService.createPage(data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Put('admin/pages/:id')
  updatePage(@Param('id') id: string, @Body() data: any) { return this.settingsService.updatePage(id, data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete('admin/pages/:id')
  deletePage(@Param('id') id: string) { return this.settingsService.deletePage(id); }
}
