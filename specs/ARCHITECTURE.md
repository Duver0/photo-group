# Architecture Specification

## Stack

| Capa | Tecnologia |
|------|-----------|
| Runtime | Bun 1.x |
| Framework | Next.js 16 (App Router), TypeScript 5 |
| Autenticacion | NextAuth.js v5 (beta) con Google Provider |
| Almacenamiento | Google Drive API v3 via `googleapis` |
| QR | `qrcode.react` para generar, escaner nativo del dispositivo |
| Estilos | Tailwind CSS v4 |
| Despliegue | Vercel (Funciones Serverless) |

## Principios

- Sin base de datos — la sesion usa JWT, los archivos van a Google Drive del usuario
- Server-side validation siempre — nunca confiar solo en validacion del cliente
- Token refresh automatico via NextAuth JWT callback
- Rutas publicas solo las minimas necesarias (`/upload`)

## Flujo de datos

```
Usuario A (dueno)
  ├── Login Google → NextAuth → sesion JWT con token Drive
  ├── Dashboard → genera QR → `{origin}/upload?owner={userId}`
  └── Drive → carpetas `Photo-Group/YYYY-MM-DD/`

Usuario B (invitado)
  ├── Escanea QR → abre `/upload?owner={userId}`
  ├── Toma foto o sube desde galeria (max 10)
  └── POST /api/drive/upload → Drive del Usuario A
```

## Estructura de directorios

```
photo-group/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   └── drive/
│   │       ├── folders/route.ts
│   │       ├── upload/route.ts
│   │       └── photos/route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   ├── upload/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── favicon.ico
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── dialog.tsx
│   ├── qr-display.tsx
│   ├── photo-uploader.tsx
│   ├── folder-gallery.tsx
│   └── auth-buttons.tsx
├── lib/
│   ├── auth.ts
│   ├── drive.ts
│   └── utils.ts
├── middleware.ts
├── specs/
├── opencode.json
├── AGENTS.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts (v4 usa CSS nativo)
├── postcss.config.mjs
└── vercel.json
```

## Seguridad

- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` solo en variables de entorno del servidor
- Google Drive `drive.file` scope — acceso solo a archivos creados por la app
- Validacion MIME type en server (`file-type` o `magic bytes`)
- Límite de 10 archivos y 10MB cada uno validado en servidor
- `/upload` publica pero requiere `owner` valido en query param
- Headers CSP en `next.config.ts`
