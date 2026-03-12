import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: { userId?: string; action: string; entity: string; entityId?: string; details?: any; ip?: string }) {
    return this.prisma.auditLog.create({ data });
  }

  async findAll(dto: PaginationDto, entity?: string) {
    const where: any = {};
    if (entity) where.entity = entity;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: dto.skip,
        take: dto.limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return paginate(items, total, dto);
  }
}
