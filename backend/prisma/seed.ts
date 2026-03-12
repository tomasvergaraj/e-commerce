import { PrismaClient, UserRole, ProductStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Settings ──
  const settings = [
    { key: 'store_name', value: 'Nexo Spa', type: 'string' },
    { key: 'store_description', value: 'Tu tienda de tecnología y desarrollo', type: 'string' },
    { key: 'store_email', value: 'contacto@nexo.cl', type: 'string' },
    { key: 'store_phone', value: '+56 9 1234 5678', type: 'string' },
    { key: 'store_address', value: 'Santiago, Chile', type: 'string' },
    { key: 'store_currency', value: 'CLP', type: 'string' },
    { key: 'store_locale', value: 'es-CL', type: 'string' },
    { key: 'store_logo', value: '/images/logo.svg', type: 'string' },
    { key: 'social_instagram', value: 'https://instagram.com/nexo', type: 'string' },
    { key: 'social_facebook', value: 'https://facebook.com/nexo', type: 'string' },
    { key: 'social_twitter', value: 'https://twitter.com/nexo', type: 'string' },
    { key: 'social_linkedin', value: 'https://linkedin.com/company/nexo', type: 'string' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, create: s, update: s });
  }
  console.log('✅ Settings');

  // ── Admin User ──
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexo.cl' },
    update: {},
    create: {
      email: 'admin@nexo.cl',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Nexo',
      role: UserRole.SUPER_ADMIN,
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ Admin user: admin@nexo.cl / admin123');

  // ── Test customers ──
  const custPassword = await bcrypt.hash('cliente123', 12);
  const customer1 = await prisma.user.upsert({
    where: { email: 'juan@test.cl' },
    update: {},
    create: {
      email: 'juan@test.cl',
      password: custPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+56912345678',
      role: UserRole.CUSTOMER,
      status: 'ACTIVE',
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'maria@test.cl' },
    update: {},
    create: {
      email: 'maria@test.cl',
      password: custPassword,
      firstName: 'María',
      lastName: 'González',
      phone: '+56987654321',
      role: UserRole.CUSTOMER,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Test customers');

  // ── Addresses ──
  await prisma.address.createMany({
    data: [
      {
        userId: customer1.id, label: 'Casa', firstName: 'Juan', lastName: 'Pérez',
        street: 'Av. Providencia', number: '1234', commune: 'Providencia',
        city: 'Santiago', region: 'Metropolitana', isDefault: true,
      },
      {
        userId: customer1.id, label: 'Oficina', firstName: 'Juan', lastName: 'Pérez',
        street: 'Av. Apoquindo', number: '5678', apartment: 'Piso 12',
        commune: 'Las Condes', city: 'Santiago', region: 'Metropolitana',
      },
      {
        userId: customer2.id, label: 'Casa', firstName: 'María', lastName: 'González',
        street: 'Calle Ñuñoa', number: '456', commune: 'Ñuñoa',
        city: 'Santiago', region: 'Metropolitana', isDefault: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Addresses');

  // ── Categories ──
  const catTech = await prisma.category.create({
    data: { name: 'Tecnología', slug: 'tecnologia', description: 'Productos tecnológicos', isActive: true, position: 1 },
  });
  const catDev = await prisma.category.create({
    data: { name: 'Desarrollo', slug: 'desarrollo', description: 'Herramientas para desarrolladores', isActive: true, position: 2 },
  });
  const catAccess = await prisma.category.create({
    data: { name: 'Accesorios', slug: 'accesorios', description: 'Accesorios y periféricos', isActive: true, position: 3 },
  });
  const catServices = await prisma.category.create({
    data: { name: 'Servicios', slug: 'servicios', description: 'Servicios de consultoría y desarrollo', isActive: true, position: 4 },
  });

  // Subcategories
  const catLaptops = await prisma.category.create({
    data: { name: 'Laptops', slug: 'laptops', parentId: catTech.id, position: 1, isActive: true },
  });
  const catMonitors = await prisma.category.create({
    data: { name: 'Monitores', slug: 'monitores', parentId: catTech.id, position: 2, isActive: true },
  });
  const catKeyboards = await prisma.category.create({
    data: { name: 'Teclados', slug: 'teclados', parentId: catAccess.id, position: 1, isActive: true },
  });
  const catMice = await prisma.category.create({
    data: { name: 'Mouse', slug: 'mouse', parentId: catAccess.id, position: 2, isActive: true },
  });
  console.log('✅ Categories');

  // ── Products ──
  const productsData = [
    {
      name: 'MacBook Pro 14" M3 Pro', slug: 'macbook-pro-14-m3-pro', sku: 'MBP14-M3P',
      shortDesc: 'Laptop profesional para desarrollo', longDesc: 'El MacBook Pro 14" con chip M3 Pro ofrece un rendimiento excepcional para desarrollo de software, compilación y virtualización.',
      price: 2499990, comparePrice: 2799990, status: ProductStatus.ACTIVE, isVisible: true, isFeatured: true,
      stock: 15, brand: 'Apple', weight: 1.6, tags: ['apple', 'macbook', 'laptop', 'pro'],
      metaTitle: 'MacBook Pro 14" M3 Pro | Nexo', metaDesc: 'Compra tu MacBook Pro 14" con chip M3 Pro en Nexo',
      categories: [catTech.id, catLaptops.id], primaryCategory: catLaptops.id,
      images: [
        'https://placehold.co/800x600/1a1a2e/06b6d4?text=MacBook+Pro+14',
        'https://placehold.co/800x600/16213e/06b6d4?text=MacBook+Side',
      ],
    },
    {
      name: 'ThinkPad X1 Carbon Gen 11', slug: 'thinkpad-x1-carbon-11', sku: 'TPX1C-11',
      shortDesc: 'Ultrabook liviano y potente', longDesc: 'El ThinkPad X1 Carbon de 11ª generación combina portabilidad extrema con potencia de nivel empresarial.',
      price: 1899990, status: ProductStatus.ACTIVE, isVisible: true, isFeatured: true,
      stock: 10, brand: 'Lenovo', weight: 1.12, tags: ['lenovo', 'thinkpad', 'laptop'],
      categories: [catTech.id, catLaptops.id], primaryCategory: catLaptops.id,
      images: ['https://placehold.co/800x600/2d2d44/06b6d4?text=ThinkPad+X1'],
    },
    {
      name: 'Monitor Dell UltraSharp 27" 4K', slug: 'dell-ultrasharp-27-4k', sku: 'DELL-U2723',
      shortDesc: 'Monitor profesional 4K USB-C', longDesc: 'Monitor 27" 4K UHD con USB-C, calibración de color de fábrica y tecnología ComfortView Plus.',
      price: 549990, comparePrice: 649990, status: ProductStatus.ACTIVE, isVisible: true, isFeatured: true,
      stock: 20, brand: 'Dell', tags: ['dell', 'monitor', '4k'],
      categories: [catTech.id, catMonitors.id], primaryCategory: catMonitors.id,
      images: ['https://placehold.co/800x600/0f3460/06b6d4?text=Dell+27+4K'],
    },
    {
      name: 'Teclado Mecánico Keychron K2 Pro', slug: 'keychron-k2-pro', sku: 'KC-K2PRO',
      shortDesc: 'Teclado mecánico inalámbrico 75%', longDesc: 'Teclado mecánico inalámbrico compacto con switches intercambiables, Bluetooth 5.1 y retroiluminación RGB.',
      price: 89990, status: ProductStatus.ACTIVE, isVisible: true,
      stock: 35, brand: 'Keychron', tags: ['keychron', 'teclado', 'mecanico'],
      categories: [catAccess.id, catKeyboards.id], primaryCategory: catKeyboards.id,
      images: ['https://placehold.co/800x600/1a1a3e/06b6d4?text=Keychron+K2'],
      hasVariants: true,
    },
    {
      name: 'Mouse Logitech MX Master 3S', slug: 'logitech-mx-master-3s', sku: 'LOG-MXM3S',
      shortDesc: 'Mouse ergonómico de alto rendimiento', longDesc: 'Mouse inalámbrico con sensor de 8000 DPI, scroll electromagnético MagSpeed y conectividad triple.',
      price: 79990, comparePrice: 99990, status: ProductStatus.ACTIVE, isVisible: true, isFeatured: true,
      stock: 40, brand: 'Logitech', tags: ['logitech', 'mouse', 'ergonomico'],
      categories: [catAccess.id, catMice.id], primaryCategory: catMice.id,
      images: ['https://placehold.co/800x600/533483/06b6d4?text=MX+Master+3S'],
      hasVariants: true,
    },
    {
      name: 'Consultoría Arquitectura de Software', slug: 'consultoria-arquitectura', sku: 'SRV-ARQ01',
      shortDesc: 'Sesiones de consultoría en arquitectura', longDesc: 'Servicio de consultoría especializada en arquitectura de software, microservicios y diseño de sistemas escalables.',
      price: 150000, status: ProductStatus.ACTIVE, isVisible: true,
      stock: 99, brand: 'Nexo', tags: ['consultoria', 'arquitectura', 'servicio'],
      categories: [catServices.id, catDev.id], primaryCategory: catServices.id,
      images: ['https://placehold.co/800x600/0a3d62/06b6d4?text=Consultoría'],
    },
    {
      name: 'Hub USB-C 12 en 1 Thunderbolt', slug: 'hub-usbc-12-en-1', sku: 'HUB-TB12',
      shortDesc: 'Hub multipuerto Thunderbolt 4', longDesc: 'Hub USB-C con 12 puertos incluyendo Thunderbolt 4, HDMI 2.1, Ethernet 2.5G y carga de 100W.',
      price: 129990, status: ProductStatus.ACTIVE, isVisible: true,
      stock: 25, brand: 'CalDigit', tags: ['hub', 'usbc', 'thunderbolt'],
      categories: [catAccess.id], primaryCategory: catAccess.id,
      images: ['https://placehold.co/800x600/2c3e50/06b6d4?text=Hub+USB-C'],
    },
    {
      name: 'Audífonos Sony WH-1000XM5', slug: 'sony-wh-1000xm5', sku: 'SONY-XM5',
      shortDesc: 'Audífonos con cancelación de ruido premium', longDesc: 'Los mejores audífonos con cancelación de ruido activa, sonido Hi-Res y hasta 30 horas de batería.',
      price: 299990, comparePrice: 349990, status: ProductStatus.ACTIVE, isVisible: true, isFeatured: true,
      stock: 18, brand: 'Sony', tags: ['sony', 'audifonos', 'bluetooth'],
      categories: [catAccess.id], primaryCategory: catAccess.id,
      images: ['https://placehold.co/800x600/4a0e4e/06b6d4?text=Sony+XM5'],
      hasVariants: true,
    },
    {
      name: 'Webcam Logitech Brio 4K', slug: 'logitech-brio-4k', sku: 'LOG-BRIO4K',
      shortDesc: 'Webcam profesional 4K HDR', longDesc: 'Webcam con resolución 4K Ultra HD, HDR, Windows Hello y campo de visión ajustable.',
      price: 149990, status: ProductStatus.ACTIVE, isVisible: true,
      stock: 22, brand: 'Logitech', tags: ['logitech', 'webcam', '4k'],
      categories: [catAccess.id], primaryCategory: catAccess.id,
      images: ['https://placehold.co/800x600/2d3436/06b6d4?text=Brio+4K'],
    },
    {
      name: 'Desarrollo Web Full Stack a Medida', slug: 'desarrollo-web-fullstack', sku: 'SRV-FULL01',
      shortDesc: 'Desarrollo de aplicaciones web completas', longDesc: 'Servicio de desarrollo web full stack con React, Node.js, PostgreSQL. Desde el diseño hasta el despliegue.',
      price: 2500000, status: ProductStatus.ACTIVE, isVisible: true, isFeatured: true,
      stock: 5, brand: 'Nexo', tags: ['desarrollo', 'fullstack', 'web', 'servicio'],
      categories: [catServices.id, catDev.id], primaryCategory: catServices.id,
      images: ['https://placehold.co/800x600/006266/06b6d4?text=Dev+FullStack'],
    },
  ];

  for (const p of productsData) {
    const { categories, primaryCategory, images, hasVariants, ...productData } = p;
    const product = await prisma.product.create({ data: productData });

    // Categories
    for (const catId of categories) {
      await prisma.productCategory.create({
        data: { productId: product.id, categoryId: catId, isPrimary: catId === primaryCategory },
      });
    }

    // Images
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: { productId: product.id, url: images[i], alt: product.name, position: i },
      });
    }

    // Variants for some products
    if (hasVariants && product.sku === 'KC-K2PRO') {
      const switches = ['Red', 'Brown', 'Blue'];
      for (let i = 0; i < switches.length; i++) {
        await prisma.productVariant.create({
          data: {
            productId: product.id, name: `Switch ${switches[i]}`,
            sku: `${product.sku}-${switches[i].toUpperCase()}`,
            stock: 10, options: { switch: switches[i] }, position: i,
          },
        });
      }
    }
    if (hasVariants && product.sku === 'LOG-MXM3S') {
      const colors = [
        { name: 'Grafito', code: 'grafito' },
        { name: 'Blanco', code: 'blanco' },
      ];
      for (let i = 0; i < colors.length; i++) {
        await prisma.productVariant.create({
          data: {
            productId: product.id, name: colors[i].name,
            sku: `${product.sku}-${colors[i].code.toUpperCase()}`,
            stock: 20, options: { color: colors[i].name }, position: i,
          },
        });
      }
    }
    if (hasVariants && product.sku === 'SONY-XM5') {
      const colors = ['Negro', 'Plata', 'Azul'];
      for (let i = 0; i < colors.length; i++) {
        await prisma.productVariant.create({
          data: {
            productId: product.id, name: colors[i],
            sku: `${product.sku}-${colors[i].toUpperCase()}`,
            stock: 6, options: { color: colors[i] }, position: i,
          },
        });
      }
    }
  }
  console.log('✅ Products');

  // ── Shipping Methods ──
  await prisma.shippingMethod.createMany({
    data: [
      { name: 'Envío Estándar', description: 'Despacho en 3-5 días hábiles', price: 4990, minDays: 3, maxDays: 5, isActive: true, regions: ['Metropolitana'] },
      { name: 'Envío Express', description: 'Despacho en 1-2 días hábiles', price: 9990, minDays: 1, maxDays: 2, isActive: true, regions: ['Metropolitana'] },
      { name: 'Envío Regiones', description: 'Despacho a regiones en 5-8 días hábiles', price: 7990, minDays: 5, maxDays: 8, isActive: true },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Shipping methods');

  // ── Banners ──
  await prisma.banner.createMany({
    data: [
      {
        title: 'Nuevos MacBook Pro M3', subtitle: 'Rendimiento profesional para desarrolladores',
        imageUrl: 'https://placehold.co/1920x600/1a1a2e/06b6d4?text=MacBook+Pro+M3+-+Nexo',
        linkUrl: '/productos/macbook-pro-14-m3-pro', position: 1, isActive: true,
      },
      {
        title: 'Consultoría de Arquitectura', subtitle: 'Diseñamos la solución ideal para tu negocio',
        imageUrl: 'https://placehold.co/1920x600/0a3d62/06b6d4?text=Consultoría+Arquitectura+-+Nexo',
        linkUrl: '/productos/consultoria-arquitectura', position: 2, isActive: true,
      },
      {
        title: 'Accesorios Premium', subtitle: 'Todo lo que necesitas para tu setup',
        imageUrl: 'https://placehold.co/1920x600/2d3436/06b6d4?text=Accesorios+Premium+-+Nexo',
        linkUrl: '/categorias/accesorios', position: 3, isActive: true,
      },
    ],
  });
  console.log('✅ Banners');

  // ── Pages ──
  await prisma.page.createMany({
    data: [
      {
        title: 'Política de Envíos', slug: 'politica-envios',
        content: '## Política de Envíos\n\nRealizamos envíos a todo Chile.\n\n### Tiempos de entrega\n- **Santiago (RM):** 1-3 días hábiles\n- **Regiones:** 3-7 días hábiles\n\n### Costos\nEl costo de envío se calcula según el destino y peso del paquete.\n\n### Seguimiento\nUna vez despachado tu pedido, recibirás un código de seguimiento.',
      },
      {
        title: 'Política de Devoluciones', slug: 'politica-devoluciones',
        content: '## Política de Devoluciones\n\nTienes 30 días desde la recepción para solicitar una devolución.\n\n### Requisitos\n- Producto en estado original\n- Empaque completo\n- Boleta o factura\n\n### Proceso\n1. Contacta a soporte\n2. Envía el producto\n3. Revisamos y procesamos el reembolso en 5-10 días hábiles',
      },
      {
        title: 'Preguntas Frecuentes', slug: 'preguntas-frecuentes',
        content: '## Preguntas Frecuentes\n\n### ¿Cuánto demora el envío?\nEntre 1 y 7 días hábiles dependiendo de tu ubicación.\n\n### ¿Puedo pagar con tarjeta?\nSí, aceptamos tarjetas de crédito y débito.\n\n### ¿Emiten factura?\nSí, envíanos tu RUT y razón social al momento de la compra.\n\n### ¿Tienen garantía los productos?\nTodos los productos tienen garantía legal de 6 meses.',
      },
      {
        title: 'Sobre Nosotros', slug: 'sobre-nosotros',
        content: '## Nexo Spa\n\nSomos una empresa chilena dedicada al desarrollo de software y venta de tecnología.\n\nNuestro objetivo es entregar soluciones de calidad tanto en productos como servicios para profesionales del desarrollo y la tecnología.',
      },
    ],
  });
  console.log('✅ Pages');

  // ── Coupons ──
  await prisma.coupon.createMany({
    data: [
      {
        code: 'BIENVENIDO10', description: '10% de descuento para nuevos clientes',
        discountType: 'PERCENTAGE', value: 10, minPurchase: 50000,
        maxUses: 100, maxPerUser: 1, isActive: true,
      },
      {
        code: 'NEXO5000', description: '$5.000 de descuento',
        discountType: 'FIXED', value: 5000, minPurchase: 30000,
        maxUses: 50, isActive: true,
      },
    ],
  });
  console.log('✅ Coupons');

  // ── Sample orders ──
  const products = await prisma.product.findMany({ take: 3 });
  const addresses = await prisma.address.findMany({ where: { userId: customer1.id } });
  const shippingMethods = await prisma.shippingMethod.findMany();

  if (products.length > 0 && addresses.length > 0) {
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'NX-SEED-001',
        userId: customer1.id,
        addressId: addresses[0].id,
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.APPROVED,
        shippingStatus: 'DELIVERED',
        subtotal: products[0].price,
        total: products[0].price + 4990,
        shippingCost: 4990,
        shippingMethodId: shippingMethods[0]?.id,
        shippingStreet: addresses[0].street,
        shippingNumber: addresses[0].number,
        shippingCommune: addresses[0].commune,
        shippingCity: addresses[0].city,
        shippingRegion: addresses[0].region,
        paidAt: new Date('2025-01-15'),
        shippedAt: new Date('2025-01-16'),
        deliveredAt: new Date('2025-01-19'),
        items: {
          create: {
            productId: products[0].id,
            productName: products[0].name,
            sku: products[0].sku,
            price: products[0].price,
            quantity: 1,
            total: products[0].price,
          },
        },
        payment: {
          create: {
            method: 'MOCK_GATEWAY',
            status: PaymentStatus.APPROVED,
            amount: products[0].price + 4990,
            transactionId: 'MOCK-SEED-001',
            paidAt: new Date('2025-01-15'),
          },
        },
        statusHistory: {
          create: [
            { status: OrderStatus.PENDING, note: 'Pedido creado', createdAt: new Date('2025-01-15T10:00:00') },
            { status: OrderStatus.CONFIRMED, note: 'Pago confirmado', createdAt: new Date('2025-01-15T10:05:00') },
            { status: OrderStatus.PREPARING, note: 'En preparación', createdAt: new Date('2025-01-15T14:00:00') },
            { status: OrderStatus.SHIPPED, note: 'Despachado', createdAt: new Date('2025-01-16T09:00:00') },
            { status: OrderStatus.DELIVERED, note: 'Entregado', createdAt: new Date('2025-01-19T11:00:00') },
          ],
        },
      },
    });

    const order2 = await prisma.order.create({
      data: {
        orderNumber: 'NX-SEED-002',
        userId: customer1.id,
        status: OrderStatus.PREPARING,
        paymentStatus: PaymentStatus.APPROVED,
        shippingStatus: 'PROCESSING',
        subtotal: products[1].price + products[2].price,
        total: products[1].price + products[2].price + 9990,
        shippingCost: 9990,
        shippingMethodId: shippingMethods[1]?.id,
        shippingStreet: addresses[0].street,
        shippingNumber: addresses[0].number,
        shippingCommune: addresses[0].commune,
        shippingCity: addresses[0].city,
        shippingRegion: addresses[0].region,
        addressId: addresses[0].id,
        paidAt: new Date(),
        items: {
          create: [
            { productId: products[1].id, productName: products[1].name, sku: products[1].sku, price: products[1].price, quantity: 1, total: products[1].price },
            { productId: products[2].id, productName: products[2].name, sku: products[2].sku, price: products[2].price, quantity: 1, total: products[2].price },
          ],
        },
        payment: {
          create: {
            method: 'MOCK_GATEWAY', status: PaymentStatus.APPROVED,
            amount: products[1].price + products[2].price + 9990,
            transactionId: 'MOCK-SEED-002', paidAt: new Date(),
          },
        },
        statusHistory: {
          create: [
            { status: OrderStatus.PENDING, note: 'Pedido creado' },
            { status: OrderStatus.CONFIRMED, note: 'Pago confirmado' },
            { status: OrderStatus.PREPARING, note: 'En preparación' },
          ],
        },
      },
    });

    console.log('✅ Sample orders');
  }

  // ── Reviews ──
  if (products.length > 0) {
    await prisma.review.createMany({
      data: [
        { productId: products[0].id, userId: customer1.id, rating: 5, title: 'Excelente equipo', comment: 'Rendimiento increíble para desarrollo. Compila todo en segundos.', isApproved: true },
        { productId: products[0].id, userId: customer2.id, rating: 4, title: 'Muy bueno', comment: 'Calidad premium, solo le falta más RAM base.', isApproved: true },
      ],
    });

    // Update product rating
    await prisma.product.update({
      where: { id: products[0].id },
      data: { avgRating: 4.5, reviewCount: 2 },
    });
    console.log('✅ Reviews');
  }

  console.log('\n🚀 Seed completed successfully!');
  console.log('📧 Admin: admin@nexo.cl / admin123');
  console.log('📧 Customer: juan@test.cl / cliente123');
  console.log('📧 Customer: maria@test.cl / cliente123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
