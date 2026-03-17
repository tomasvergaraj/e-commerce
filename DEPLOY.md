# Deploy de Demo

Esta guia deja el proyecto listo para una demo publica con:

- `frontend` en Vercel
- `backend` en Railway
- `PostgreSQL` en Railway
- `uploads` persistentes usando un Volume en Railway

## Arquitectura recomendada

```text
Vercel (frontend React/Vite)
  -> consume https://tu-backend.up.railway.app/api

Railway (backend NestJS)
  -> conecta a PostgreSQL de Railway
  -> sirve /uploads desde un Volume persistente
```

## Lo que ya quedo preparado

- El backend expone `GET /api/health` para healthchecks.
- El backend acepta CORS con multiples dominios y comodines simples usando `CORS_ORIGINS`.
- Los uploads ahora usan `UPLOAD_DIR`, por lo que puedes montarlos en un volumen persistente.
- El frontend resuelve imagenes de `/uploads/...` contra el dominio real del backend.
- `frontend/vercel.json` ya incluye rewrite a `index.html` para que las rutas del SPA no fallen.
- `backend/railway.json` ya define el healthcheck para Railway.

## Orden recomendado

1. Deploy del backend en Railway.
2. Verificar backend y base de datos.
3. Deploy del frontend en Vercel apuntando al backend ya publicado.
4. Probar login, catalogo, carrito, checkout, admin y uploads.

## Backend en Railway

### 1. Crear el proyecto

1. En Railway, crea un proyecto nuevo desde GitHub.
2. Selecciona este repositorio.
3. Configura el servicio para usar `backend` como `Root Directory`.

El archivo [backend/railway.json](/c:/Users/19726539-6/Desktop/Sistemas/Projects/nexo/backend/railway.json) ya deja listo el healthcheck en `/api/health`.

### 2. Base de datos

1. Agrega un servicio PostgreSQL dentro del mismo proyecto de Railway.
2. Copia la `DATABASE_URL` que te entregue Railway.
3. En el servicio `backend`, crea una variable `DATABASE_URL` apuntando a la base del proyecto.

Ejemplo en Railway:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Importante:

- `Postgres` en el ejemplo es el nombre del servicio de base de datos dentro de Railway.
- Si tu servicio tiene otro nombre, usa ese nombre exacto. Ejemplo: `DATABASE_URL=${{postgresql.DATABASE_URL}}`.
- Si prefieres referenciar variables separadas, el contenedor tambien acepta `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` y `PGDATABASE`, pero `DATABASE_URL` sigue siendo la opcion recomendada.

### 3. Volume para imagenes

1. Agrega un `Volume` al servicio del backend.
2. Montalo en `/app/uploads`.

Si montas el volumen en otra ruta, cambia `UPLOAD_DIR` para que coincida exactamente con ese mount path.

### 4. Variables del backend

Define estas variables en Railway:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=usa-un-secreto-largo-y-random
JWT_EXPIRES=7d
ENABLE_SWAGGER=false
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tu-demo.vercel.app
CORS_ORIGINS=https://tu-demo.vercel.app,https://*.vercel.app
APP_URL=https://tu-backend.up.railway.app
UPLOAD_DIR=/app/uploads
REQUEST_BODY_LIMIT=1mb
```

Notas:

- En Railway, `DATABASE_URL` debe existir realmente dentro del servicio `backend`; no basta con crear la base si el backend no tiene la referencia.
- En produccion, `JWT_SECRET` debe ser realmente largo y aleatorio. El backend ahora rechaza secretos cortos o valores por defecto inseguros.
- `FRONTEND_URL` cubre tu dominio principal.
- `CORS_ORIGINS` puede incluir varios dominios separados por coma.
- No uses `CORS_ORIGINS=*` en produccion.
- `https://*.vercel.app` sirve para previews y ramas desplegadas en Vercel.
- `APP_URL` se usa para logs y referencias publicas del backend.
- `ENABLE_SWAGGER=false` evita exponer la documentacion fuera de desarrollo, salvo que realmente la necesites.
- `REQUEST_BODY_LIMIT` define el maximo de payload JSON/urlencoded aceptado por la API.

### 5. Build y arranque

Si Railway detecta el `Dockerfile` del backend, no necesitas configurar comandos manualmente.

Si prefieres configurarlos en el dashboard:

```bash
Build Command: npm ci && npx prisma generate && npm run build
Start Command: npx prisma migrate deploy && npm run start:prod
```

### 6. Migraciones y seed

Las migraciones de produccion deben aplicarse con:

```bash
npm run db:migrate:prod
```

Si quieres dejar datos demo, ejecuta tambien:

```bash
npm run db:seed
```

Haz esto desde la shell de Railway o como comando puntual del servicio.
El script de seed detecta automaticamente Railway y usa el archivo compilado del backend para evitar errores de `ts-node` dentro del contenedor.

### 7. Verificaciones del backend

Prueba estas rutas:

- `https://tu-backend.up.railway.app/api/health`
- `https://tu-backend.up.railway.app/api/settings/public`

Opcional si habilitaste Swagger explicitamente:

- `https://tu-backend.up.railway.app/api/docs`

Si subes una imagen desde admin, verifica tambien una URL tipo:

- `https://tu-backend.up.railway.app/uploads/archivo.jpg`

## Frontend en Vercel

### 1. Crear el proyecto

1. En Vercel, importa el mismo repositorio.
2. Configura `frontend` como `Root Directory`.
3. El preset de Vite deberia detectarse automaticamente.

El archivo [frontend/vercel.json](/c:/Users/19726539-6/Desktop/Sistemas/Projects/nexo/frontend/vercel.json) ya deja resueltas las rutas del SPA.

### 2. Variable del frontend

Configura en Vercel:

```env
VITE_API_URL=https://tu-backend.up.railway.app/api
```

Importante:

- Usa la URL publica completa del backend.
- No dejes `VITE_API_URL=/api` en produccion si frontend y backend viven en dominios distintos.

### 3. Build esperado

Vercel deberia usar:

```bash
npm run build
```

y publicar el contenido de `dist/`.

## Checklist post deploy

Prueba este flujo completo:

1. Abrir home y revisar banners.
2. Buscar productos.
3. Abrir un producto con imagen.
4. Registrar usuario o entrar con demo.
5. Agregar al carrito.
6. Hacer checkout.
7. Entrar al panel admin.
8. Subir un banner nuevo.
9. Confirmar que la imagen queda visible en la tienda.

## Credenciales demo

Si ejecutaste el seed:

```text
Admin: admin@nexo.cl / admin123
Cliente: juan@test.cl / cliente123
Cliente: maria@test.cl / cliente123
```

## Problemas comunes

### CORS bloqueado

Sintoma:

- El frontend carga, pero las llamadas al backend fallan en navegador.

Revision:

- `FRONTEND_URL` y `CORS_ORIGINS` deben apuntar al dominio real de Vercel.
- Si usas previews de Vercel, agrega `https://*.vercel.app`.
- No uses `*` como origen permitido si vas a enviar tokens o credenciales.

### Las imagenes no cargan

Sintoma:

- Los productos o banners muestran URL guardada, pero no la imagen.

Revision:

- `VITE_API_URL` debe ser la URL completa del backend en produccion.
- `UPLOAD_DIR` debe apuntar a un volumen persistente real.
- El volume de Railway debe estar montado.
- La URL `/uploads/...` del backend debe responder directamente en navegador.

### Railway arranca pero no hay tablas

Sintoma:

- El backend responde, pero Prisma falla al consultar.

Revision:

- Si los logs muestran `Environment variable not found: DATABASE_URL` o `Missing database connection configuration`, agrega `DATABASE_URL=${{NombreExactoDelServicioPostgres.DATABASE_URL}}` en el servicio backend de Railway.
- Ejecuta `npm run db:migrate:prod`.
- Luego, si quieres datos demo, ejecuta `npm run db:seed`.

### Vercel devuelve 404 al refrescar una ruta

Sintoma:

- `/productos/...` o `/cuenta/...` funcionan al navegar, pero fallan al recargar.

Revision:

- Asegurate de desplegar con `frontend` como `Root Directory`.
- Confirma que [frontend/vercel.json](/c:/Users/19726539-6/Desktop/Sistemas/Projects/nexo/frontend/vercel.json) forme parte del deploy.

## Nota sobre pagos

El checkout usa una pasarela mock. Para una demo de portafolio esto esta bien, pero no es un flujo de cobro real.
