# Photo Group

Comparte fotos al instante con un codigo QR. Tus invitados escanean, suben fotos desde su celular, y se guardan automaticamente en tu Google Drive organizadas por fecha.

**App en produccion**: https://photo-group-flame.vercel.app

## Stack

| Capa | Tecnologia |
|------|-----------|
| Runtime | Bun 1.x |
| Framework | Next.js 16 (App Router), TypeScript |
| Auth | NextAuth.js v5 con Google Provider (OAuth 2.0) |
| Storage | Google Drive API v3 |
| QR | qrcode.react |
| Estilos | Tailwind CSS v4 |
| Deploy | Vercel |

## Desarrollo local

```bash
bun install
bun dev
```

## Variables de entorno

Copiar `.env.example` → `.env.local`:

| Variable | Descripcion |
|----------|-------------|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Client ID de Google Cloud |
| `AUTH_GOOGLE_SECRET` | Client Secret de Google Cloud |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| `AUTH_URL` | `http://localhost:3000` |

## Agregar usuarios de Google (Testing)

Mientras la app no este verificada por Google, solo los **usuarios de prueba** pueden autenticarse:

1. Ve a https://console.cloud.google.com/apis/credentials/consent
2. En **"Usuarios de prueba"** (Test users), click **"AGREGAR USUARIOS"**
3. Ingresa los correos Gmail de cada persona
4. Click **"GUARDAR"**

Cada usuario nuevo debe:
1. Ir a `https://photo-group-flame.vercel.app`
2. Iniciar sesion con Google
3. Autorizar los permisos (correo, perfil, Google Drive)
4. Listo — puede generar su QR y recibir fotos

Para abrir a todo publico, vuelve a la pantalla de consentimiento y click **"PUBLICAR"**.

## Uso

1. **Inicia sesion** con Google
2. En el **Dashboard** ves tu codigo QR
3. **Comparte el QR** con quien quieras (imprimelo, muestralo en pantalla, etc.)
4. Quien escanea el QR puede:
   - Tomar foto directo con la camara
   - Subir desde galeria (max 10 fotos)
5. Las fotos se guardan en tu Drive → `Photo-Group/YYYY-MM-DD/`

## Rutas

| Ruta | Acceso | Descripcion |
|------|--------|-------------|
| `/` | Publico | Landing + login |
| `/dashboard` | Solo autenticado | QR + galeria de fotos |
| `/upload?folder=X` | Publico | Subir fotos (desde QR) |
| `/api/auth/*` | Publico | NextAuth |
| `/api/drive/folders` | Solo autenticado | CRUD carpetas |
| `/api/drive/photos` | Solo autenticado | Listar fotos |
| `/api/drive/upload` | Publico + autenticado | Subir fotos |

## Arquitectura

- Las fotos se suben directamente al **Google Drive del dueno** usando un refresh token almacenado en el servidor
- No se requiere que los invitados tengan cuenta de Google
- Las carpetas se organizan como `Photo-Group/YYYY-MM-DD/`
- Sesion via JWT (sin base de datos)

## Prueba de carga

Resultados con 50KB por foto contra el endpoint `/api/drive/upload` en produccion (Vercel Hobby):

| Concurrentes | Requests | Tasa (req/s) | Errores | p50 | p95 |
|-------------|----------|-------------|---------|-----|-----|
| 5 | 25 | 2.5 | 0 | 1.5s | 3.1s |
| 30 | 120 | 15.3 | 0 | 1.4s | 2.5s |
| 100 | 500 | 39.6 | 0 | 1.6s | 2.0s |
| 200 | 1000 | 55.8 | 0 | 2.3s | 3.4s |
| 500 | 2000 | 95.5 | 0 | 3.2s | 4.7s |
| **1000** | **5000** | **73.7** | **212** | **4.9s** | **10.8s** |

**Conclusion**: Hasta 200 usuarios simultaneos la app responde sin errores y con latencia aceptable. El cuello de botella es la cuota de Google Drive API (10,000 queries/100s por proyecto). Para escalar: Vercel Pro + aumento de cuota en Google Cloud Console.

Ejecutar prueba local:
```bash
FOLDER_ID=<id-del-dashboard> bun run scripts/load-test.mjs
```
