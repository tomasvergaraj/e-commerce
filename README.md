# Nexo E-Commerce

Sistema de e-commerce completo desarrollado por Nexo Spa. Plataforma genérica y adaptable para cualquier rubro, con frontend público, panel de cliente y panel administrativo.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand, React Hook Form |
| Backend | Node.js, NestJS, TypeScript, Prisma ORM, JWT |
| Base de datos | PostgreSQL 16 |
| Infraestructura | Docker, Docker Compose, Nginx |

## Estructura del proyecto

```text
nexo/
|-- backend/              # API NestJS
|   |-- prisma/           # Schema, migraciones, seed
|   `-- src/
|       |-- common/       # Filtros, guards, interceptors, Prisma
|       `-- modules/      # Auth, Users, Products, Cart, Orders, etc.
|-- frontend/             # App React + Vite
|   `-- src/
|       |-- api/          # Cliente HTTP y servicios
|       |-- components/   # Componentes reutilizables
|       |-- pages/        # Páginas (store, account, admin)
|       |-- stores/       # Zustand stores
|       `-- lib/          # Utilidades
|-- docker-compose.yml
|-- .env.example
`-- README.md
```

## Inicio rápido (Desarrollo)

### Requisitos previos

- Node.js 20+
- PostgreSQL 16 (o Docker)
- npm o yarn

### 1. Clonar y configurar

```bash
# Copiar variables de entorno
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Levantar la base de datos

```bash
# Opción A: Docker (recomendado)
docker run -d --name nexo-db \
  -e POSTGRES_USER=nexo \
  -e POSTGRES_PASSWORD=nexo_password \
  -e POSTGRES_DB=nexo_db \
  -p 5432:5432 \
  postgres:16-alpine

# Opción B: PostgreSQL local
# Crear una base de datos "nexo_db" y ajustar DATABASE_URL en backend/.env
```

### 3. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run start:dev
```

El backend estará en: http://localhost:3000  
Swagger docs en: http://localhost:3000/api/docs  
También puedes iniciarlo desde la raíz con: `npm run start:dev`
Ese comando ahora detecta si el puerto del backend ya está ocupado por otra instancia `node` del mismo entorno de desarrollo y la cierra antes de volver a levantar Nest.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

La tienda estará en: http://localhost:5173  
También puedes iniciarla desde la raíz con: `npm run dev:frontend`

Si quieres levantar frontend y backend juntos desde la raíz:

```bash
npm run dev
```

## Inicio con Docker Compose (producción)

```bash
docker-compose up -d --build
```

Luego ejecutar el seed:

```bash
docker exec nexo-api npx prisma db seed
```

Acceder en: http://localhost:5173

## Credenciales por defecto (seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Super Admin | admin@nexo.cl | admin123 |
| Cliente | juan@test.cl | cliente123 |
| Cliente | maria@test.cl | cliente123 |

## Novedades recientes

- `npm run dev` desde la raíz levanta frontend y backend al mismo tiempo
- `npm run start:dev` ahora libera automáticamente el puerto del backend si había otra instancia `node` ocupándolo
- Home con carrusel de banners activos
- Banners editables desde admin con subida, recorte y vista previa de imágenes
- Páginas informativas administrables desde el panel con navegación pública dinámica
- Footer público conectado a configuración, redes sociales y datos reales de la tienda
- Reseñas habilitadas sólo para clientes con compras entregadas
- Favoritos con corazón animado y estado visual sincronizado
- Animación breve al agregar productos al carrito con feedback también en el ícono del header
- Buscador público con sugerencias rápidas mientras el usuario escribe
- Historial y detalle de pedidos rediseñados con mejor jerarquía visual y seguimiento
- Transición suave entre light mode y dark mode

## Módulos implementados

### Tienda Pública

- Home con carrusel de banners, productos destacados y en oferta
- Catálogo con filtros (categoría, precio, marca, estado)
- Ordenamiento (precio, nombre, fecha, ventas)
- Paginación
- Detalle de producto con variantes, imágenes, reseñas y favoritos
- Productos relacionados
- Buscador con sugerencias rápidas
- Carrito de compras (invitado y autenticado)
- Checkout completo (dirección, envío, pago)
- Páginas informativas dinámicas (políticas, FAQ, etc.) con diseño editorial
- Footer y enlaces sociales conectados a la configuración pública
- Dark mode con transición visual

### Panel de Cliente

- Perfil y datos personales
- Direcciones múltiples
- Historial de pedidos con vista enriquecida y detalle visual de seguimiento
- Seguimiento de pedidos
- Favoritos / wishlist con feedback visual
- Reseñas de productos después de pedidos entregados
- Cambio de contraseña

### Panel Administrativo

- Dashboard con métricas (ventas, pedidos, stock)
- CRUD de productos con variantes
- Gestión de categorías
- Gestión de pedidos con cambio de estado
- Historial de estados por pedido
- Gestión de clientes con búsqueda
- Banners con edición completa y recorte de imágenes
- Moderación de reseñas
- Configuración de tienda y redes sociales
- Gestión de páginas informativas / CMS
- Cupones de descuento

### Backend API

- Autenticación JWT con registro/login
- RBAC (Customer, Admin, Super Admin)
- Validación con class-validator y DTOs
- Manejo centralizado de errores
- Respuestas estandarizadas
- Paginación
- Soft delete
- Upload de archivos e imágenes servido desde `/uploads`
- Endpoints públicos para configuración y páginas informativas
- Validación de elegibilidad para reseñas post-entrega
- Swagger API docs
- Pasarela de pago mock (desacoplada para integración real)

## Base de datos

Modelos principales: User, Address, Category, Product, ProductImage, ProductVariant, Cart, CartItem, Order, OrderItem, Payment, ShippingMethod, Coupon, WishlistItem, Review, Setting, Banner, Page, AuditLog

## Configuración del proyecto

| Parámetro | Valor |
|-----------|-------|
| Nombre | Nexo Spa |
| País | Chile |
| Moneda | CLP |
| Idioma | es-CL |
| Tema | Claro con Dark Mode |
| Color principal | #06b6d4 (cyan) |
| Venta con stock | Sí |
| Variantes | Sí |
| Compra invitado | Sí |
| Despacho | Sí |
| Retiro en tienda | No |
| Wishlist | Sí |
| Reseñas | Sí |

## Extensibilidad

### Integración de pasarela de pago real

El módulo de pagos usa una arquitectura desacoplada. Para integrar Webpay, Mercado Pago, Stripe u otro:

1. Crear un nuevo service en `backend/src/modules/payments/` (ej: `webpay.service.ts`)
2. Implementar los métodos `initTransaction`, `confirmTransaction`, `refund`
3. Registrar en el módulo y actualizar el controller
4. El enum `PaymentMethod` ya incluye las opciones

### Facturación

El modelo de Order incluye datos del cliente y dirección. Para agregar facturación:

1. Crear modelo `Invoice` en Prisma
2. Crear módulo NestJS `invoices`
3. Integrar con SII o proveedor de facturación electrónica

### Multi-sucursal / Multi-bodega

Para agregar soporte:

1. Crear modelos `Branch` y `Warehouse`
2. Relacionar stock de productos por bodega
3. Ajustar la lógica de despacho y disponibilidad

## Scripts útiles

```bash
# Raíz del proyecto
npm run dev                # Frontend + backend en desarrollo
npm run dev:full           # Alias explícito del stack completo
npm run start:dev          # Backend en desarrollo
npm run dev:frontend       # Alias explícito para frontend
npm run dev:backend        # Alias explícito para backend
npm run build:frontend     # Build del frontend
npm run build:backend      # Build del backend
npm run db:generate        # Prisma generate en backend
npm run db:migrate         # Prisma migrate dev en backend
npm run db:seed            # Seed en backend

# Backend (desde /backend)
npm run start:dev          # Desarrollo con hot reload
npm run build              # Build producción
npm run db:migrate         # Ejecutar migraciones
npm run db:seed            # Ejecutar seed
npm run db:studio          # Prisma Studio (GUI BD)

# Frontend (desde /frontend)
npm run dev                # Desarrollo
npm run build              # Build producción
npm run preview            # Preview del build
```

## Licencia

Proyecto privado - Nexo Spa © 2025
