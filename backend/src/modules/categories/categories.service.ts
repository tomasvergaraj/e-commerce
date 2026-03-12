import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    const where: any = { deletedAt: null };
    if (!includeInactive) where.isActive = true;

    return this.prisma.category.findMany({
      where,
      include: {
        children: { where: { deletedAt: null }, orderBy: { position: 'asc' } },
        _count: { select: { products: true } },
      },
      orderBy: { position: 'asc' },
    });
  }

  async findTree() {
    const all = await this.findAll();
    return all.filter(c => !c.parentId);
  }

  async findBySlug(slug: string) {
    const cat = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: { where: { deletedAt: null, isActive: true }, orderBy: { position: 'asc' } },
        parent: true,
      },
    });
    if (!cat || cat.deletedAt) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug || slugify(dto.name);
    const exists = await this.prisma.category.findUnique({ where: { slug } });
    if (exists) throw new ConflictException('El slug ya existe');

    return this.prisma.category.create({
      data: { ...dto, slug },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');

    if (dto.slug && dto.slug !== cat.slug) {
      const exists = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException('El slug ya existe');
    }

    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Categoría eliminada' };
  }
}
