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
