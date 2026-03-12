import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, CreateVariantDto, UpdateVariantDto } from './dto/products.dto';
import { paginate } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search.toLowerCase() } },
      ];
    }
    if (query.status) where.status = query.status;
    else where.status = 'ACTIVE';

    if (query.categorySlug) {
      where.categories = { some: { category: { slug: query.categorySlug } } };
    }
    if (query.categoryId) {
      where.categories = { some: { categoryId: query.categoryId } };
    }
    if (query.minPrice !== undefined) where.price = { ...(where.price as any || {}), gte: query.minPrice };
    if (query.maxPrice !== undefined) where.price = { ...(where.price as any || {}), lte: query.maxPrice };
    if (query.brand) where.brand = { equals: query.brand, mode: 'insensitive' };
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
    if (query.onSale) where.comparePrice = { not: null, gt: 0 };
    if (query.inStock) where.stock = { gt: 0 };

    where.isVisible = true;

    let orderBy: any = { createdAt: 'desc' };
    if (query.sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (query.sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (query.sortBy === 'newest') orderBy = { createdAt: 'desc' };
    else if (query.sortBy === 'sales') orderBy = { salesCount: 'desc' };
    else if (query.sortBy === 'name') orderBy = { name: 'asc' };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy,
        include: {
          images: { orderBy: { position: 'asc' }, take: 2 },
          categories: { include: { category: true } },
          variants: { where: { isActive: true }, orderBy: { position: 'asc' } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(items, total, query);
  }

  async findAllAdmin(query: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { position: 'asc' }, take: 1 },
          categories: { include: { category: { select: { id: true, name: true } } } },
          _count: { select: { variants: true, reviews: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(items, total, query);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { position: 'asc' } },
        categories: { include: { category: true } },
        variants: { where: { isActive: true }, orderBy: { position: 'asc' } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!product || product.deletedAt) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: 'asc' } },
        categories: { include: { category: true } },
        variants: { orderBy: { position: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(dto: CreateProductDto) {
    const slug = dto.slug || slugify(dto.name);
    const existsSlug = await this.prisma.product.findUnique({ where: { slug } });
    if (existsSlug) throw new ConflictException('El slug ya existe');
    const existsSku = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
    if (existsSku) throw new ConflictException('El SKU ya existe');

    const { categoryIds, primaryCategoryId, images, ...data } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...data,
        slug,
        categories: categoryIds ? {
          create: categoryIds.map(catId => ({
            categoryId: catId,
            isPrimary: catId === primaryCategoryId,
          })),
        } : undefined,
        images: images ? {
          create: images.map((img, i) => ({
            url: img.url,
            alt: img.alt,
            position: img.position ?? i,
          })),
        } : undefined,
      },
      include: {
        images: true,
        categories: { include: { category: true } },
      },
    });

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Producto no encontrado');

    const { categoryIds, primaryCategoryId, images, ...data } = dto;

    // Update categories if provided
    if (categoryIds) {
      await this.prisma.productCategory.deleteMany({ where: { productId: id } });
      await this.prisma.productCategory.createMany({
        data: categoryIds.map(catId => ({
          productId: id,
          categoryId: catId,
          isPrimary: catId === primaryCategoryId,
        })),
      });
    }

    // Update images if provided
    if (images) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      await this.prisma.productImage.createMany({
        data: images.map((img, i) => ({
          productId: id,
          url: img.url,
          alt: img.alt,
          position: img.position ?? i,
        })),
      });
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        images: true,
        categories: { include: { category: true } },
        variants: true,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Producto eliminado' };
  }

  // ── Variants ──

  async createVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    return this.prisma.productVariant.create({
      data: { ...dto, productId },
    });
  }

  async updateVariant(variantId: string, dto: UpdateVariantDto) {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: dto,
    });
  }

  async removeVariant(variantId: string) {
    await this.prisma.productVariant.delete({ where: { id: variantId } });
    return { message: 'Variante eliminada' };
  }

  // ── Related products ──

  async findRelated(slug: string, limit = 4) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { categories: true },
    });
    if (!product) return [];

    const categoryIds = product.categories.map(c => c.categoryId);

    return this.prisma.product.findMany({
      where: {
        id: { not: product.id },
        deletedAt: null,
        status: 'ACTIVE',
        isVisible: true,
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      take: limit,
      include: {
        images: { orderBy: { position: 'asc' }, take: 1 },
      },
      orderBy: { salesCount: 'desc' },
    });
  }

  async getFeatured(limit = 8) {
    return this.prisma.product.findMany({
      where: { deletedAt: null, status: 'ACTIVE', isVisible: true, isFeatured: true },
      take: limit,
      include: { images: { orderBy: { position: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOnSale(limit = 8) {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null, status: 'ACTIVE', isVisible: true,
        comparePrice: { not: null, gt: 0 },
      },
      take: limit,
      include: { images: { orderBy: { position: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBrands() {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null, status: 'ACTIVE', brand: { not: null } },
      select: { brand: true },
      distinct: ['brand'],
    });
    return products.map(p => p.brand).filter(Boolean);
  }

  async getLowStock(threshold = 5) {
    return this.prisma.product.findMany({
      where: { deletedAt: null, stock: { lte: threshold, gt: 0 } },
      include: { images: { take: 1 } },
      orderBy: { stock: 'asc' },
      take: 20,
    });
  }
}
