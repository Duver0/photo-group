# Google Drive Integration Specification

## Inicializacion

```ts
// lib/drive.ts
import { google } from 'googleapis'

function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.drive({ version: 'v3', auth })
}
```

## Estructura de carpetas

```
Photo-Group/                    ← Raiz (se crea una vez por usuario)
├── 2026-07-29/                 ← Fecha actual
│   ├── photo-1.jpg
│   ├── photo-2.jpg
│   └── ...
├── 2026-07-30/
│   └── ...
└── ...
```

## Operaciones

### 1. Obtener/Crear carpeta raiz "Photo-Group"

```
GET /drive/files?q=name='Photo-Group' and mimeType='application/vnd.google-apps.folder' and trashed=false
```
Si no existe → `POST /drive/files` con `{ name: 'Photo-Group', mimeType: 'application/vnd.google-apps.folder' }`

### 2. Obtener/Crear carpeta de fecha

Buscar por nombre `YYYY-MM-DD` dentro de `Photo-Group`. Si no existe, crearla.

### 3. Subir archivos

```
POST /drive/files
  requestBody: {
    name: `${timestamp}-${originalName}`,
    parents: [folderId],
    mimeType: file.mimeType
  },
  media: { body: fileBuffer }
```

- Nombre de archivo: `${Date.now()}-${nombre-original}` para evitar colisiones
- MIME types permitidos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/heic`

### 4. Listar fotos de una carpeta

```
GET /drive/files?q='{folderId}' in parents and trashed=false&orderBy=createdTime desc&pageSize=100
```

### 5. Permisos

Por defecto los archivos son privados (solo el dueno los ve). No se comparten enlaces publicos — las imagenes se sirven mediante `webContentLink` o proxy.

## Validacion server-side

```typescript
// En el route handler de upload:
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
const MAX_FILES = 10
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

if (files.length > MAX_FILES) throw new Error('Max 10 files')
files.forEach(f => {
  if (!ALLOWED_TYPES.includes(f.mimeType)) throw new Error('Invalid file type')
  if (f.size > MAX_SIZE) throw new Error('File too large')
})
```

## Llamadas a la API de Google Drive

| Operacion | Metodo Drive API | Ruta API nuestra |
|-----------|-----------------|------------------|
| Crear carpeta | `drive.files.create` | `POST /api/drive/folders` |
| Buscar carpeta | `drive.files.list` | `GET /api/drive/folders` |
| Subir archivo | `drive.files.create` (con media) | `POST /api/drive/upload` |
| Listar archivos | `drive.files.list` | `GET /api/drive/photos?folderId=xxx` |
