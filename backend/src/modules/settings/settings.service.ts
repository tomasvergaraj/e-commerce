import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePageDto, UpdatePageDto } from './dto/pages.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  private buildSlug(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  private preparePageData(data: CreatePageDto | UpdatePageDto) {
    const title = data.title.trim();
    const slug = this.buildSlug((data.slug || title).trim());
    const content = data.content.trim();

    if (!title) {
      throw new BadRequestException('El título de la página es obligatorio');
    }

    if (!slug) {
      throw new BadRequestException('El slug de la página es obligatorio');
    }

    if (!content) {
      throw new BadRequestException('El contenido de la página es obligatorio');
    }

    return {
      title,
      slug,
      content,
      metaTitle: data.metaTitle?.trim() || null,
      metaDesc: data.metaDesc?.trim() || null,
      isActive: data.isActive ?? true,
    };
  }

  async getAll() {
    const settings = await this.prisma.setting.findMany();
    const result: Record<string, any> = {};
    for (const s of settings) {
      if (s.type === 'json') {
        try { result[s.key] = JSON.parse(s.value); } catch { result[s.key] = s.value; }
      } else if (s.type === 'number') {
        result[s.key] = Number(s.value);
      } else if (s.type === 'boolean') {
        result[s.key] = s.value === 'true';
      } else {
        result[s.key] = s.value;
      }
    }
    return result;
  }

  async get(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    return setting?.value || null;
  }

  async set(key: string, value: string, type = 'string') {
    return this.prisma.setting.upsert({
      where: { key },
      create: { key, value, type },
      update: { value, type },
    });
  }

  async bulkUpdate(settings: Record<string, any>) {
    const ops = Object.entries(settings).map(([key, value]) => {
      const type = typeof value === 'object' ? 'json' : typeof value;
      const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return this.prisma.setting.upsert({
        where: { key },
        create: { key, value: val, type },
        update: { value: val, type },
      });
    });
    await this.prisma.$transaction(ops);
    return this.getAll();
  }

  // Pages
  async getPublicPages() {
    return this.prisma.page.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        metaTitle: true,
        metaDesc: true,
        updatedAt: true,
      },
    });
  }

  async getPages() {
    return this.prisma.page.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async getPageBySlug(slug: string) {
    return this.prisma.page.findFirst({
      where: {
        slug,
        isActive: true,
      },
    });
  }

  async createPage(data: CreatePageDto) {
    return this.prisma.page.create({ data: this.preparePageData(data) });
  }

  async updatePage(id: string, data: UpdatePageDto) {
    return this.prisma.page.update({ where: { id }, data: this.preparePageData(data) });
  }

  async deletePage(id: string) {
    await this.prisma.page.delete({ where: { id } });
    return { message: 'Página eliminada' };
  }
}
