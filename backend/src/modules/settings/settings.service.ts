import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

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
  async getPages() {
    return this.prisma.page.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getPageBySlug(slug: string) {
    return this.prisma.page.findUnique({ where: { slug } });
  }

  async createPage(data: { title: string; slug: string; content: string; metaTitle?: string; metaDesc?: string }) {
    return this.prisma.page.create({ data });
  }

  async updatePage(id: string, data: any) {
    return this.prisma.page.update({ where: { id }, data });
  }

  async deletePage(id: string) {
    await this.prisma.page.delete({ where: { id } });
    return { message: 'Página eliminada' };
  }
}
