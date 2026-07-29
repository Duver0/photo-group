# API Routes Specification

Todas las rutas API usan Next.js App Router Route Handlers.

---

## `POST /api/drive/folders`

Crea (o reutiliza) la carpeta del dia actual.

**Auth**: Requerida (sesion valida)

**Response `200`**:
```json
{
  "folderId": "abc123",
  "name": "2026-07-29",
  "created": false
}
```

**Response `201`** (nueva carpeta):
```json
{
  "folderId": "def456",
  "name": "2026-07-29",
  "created": true
}
```

---

## `GET /api/drive/folders`

Lista las carpetas del usuario ordenadas por fecha descendente.

**Auth**: Requerida

**Response `200`**:
```json
{
  "folders": [
    { "id": "abc123", "name": "2026-07-29", "createdTime": "2026-07-29T..." },
    { "id": "def456", "name": "2026-07-28", "createdTime": "2026-07-28T..." }
  ]
}
```

---

## `POST /api/drive/upload`

Sube fotos a la carpeta del dia actual.

**Auth**: Requerida (o token de owner via query param para upload publico)

**Content-Type**: `multipart/form-data`

**Campos**:
- `files`: File[] (max 10, solo imagenes)
- `folderId`: string (ID de la carpeta destino)
- `owner`: string (opcional, para upload publico — ID del dueno)

**Validacion server-side**:
| Regla | Accion |
|-------|--------|
| `files.length > 10` | `400` — "Maximo 10 archivos" |
| `files[i].size > 10MB` | `400` — "Archivo demasiado grande" |
| MIME type no permitido | `400` — "Tipo de archivo no soportado" |
| `owner` invalido o carpeta no existe | `400` — "Destino invalido" |

**Response `201`**:
```json
{
  "uploaded": [
    {
      "fileId": "ghi789",
      "name": "1743292800000-photo.jpg",
      "webViewLink": "https://drive.google.com/file/d/ghi789/view",
      "thumbnailLink": "https://lh3.googleusercontent.com/...",
      "mimeType": "image/jpeg",
      "size": 2048576
    }
  ]
}
```

**Response `400`**:
```json
{
  "error": "Maximo 10 archivos por vez",
  "code": "MAX_FILES_EXCEEDED"
}
```

**Response `401`**:
```json
{
  "error": "No autenticado"
}
```

---

## `GET /api/drive/photos?folderId={id}`

Lista las fotos de una carpeta.

**Auth**: Requerida

**Query params**:
- `folderId`: string (requerido)

**Response `200`**:
```json
{
  "photos": [
    {
      "id": "ghi789",
      "name": "1743292800000-photo.jpg",
      "mimeType": "image/jpeg",
      "webViewLink": "https://drive.google.com/file/d/ghi789/view",
      "thumbnailLink": "https://lh3.googleusercontent.com/...",
      "createdTime": "2026-07-29T10:00:00.000Z",
      "size": 2048576
    }
  ]
}
```

---

## Manejo de errores global

```json
{
  "error": "Mensaje descriptivo",
  "code": "ERROR_CODE",
  "details": {} // opcional
}
```

| Codigo HTTP | Uso |
|-------------|-----|
| 200 | OK |
| 201 | Creado |
| 400 | Error de validacion |
| 401 | No autenticado / token expirado |
| 404 | Recurso no encontrado |
| 429 | Rate limit de Google Drive |
| 500 | Error interno del servidor |
