# Frontend Specification

## Paginas

### `/` — Landing Page

| Estado | Comportamiento |
|--------|---------------|
| No autenticado | Hero + boton "Sign in with Google" |
| Autenticado | Redirigir a `/dashboard` |

### `/dashboard` — Panel principal

| Seccion | Componente | Descripcion |
|---------|------------|-------------|
| QR Code | `qr-display.tsx` | Muestra QR con URL `/upload?owner={userId}` + boton descargar |
| Today's Folder | `folder-gallery.tsx` | Grid de fotos subidas hoy |
| Folders | `folder-gallery.tsx` | Lista de carpetas por fecha |

**Estados**:
- **Loading**: Skeleton loader
- **Empty**: "No hay fotos hoy. Comparte tu codigo QR."
- **Error**: "Error al cargar. Intenta de nuevo." + boton retry
- **Data**: Grid de fotos con lazy loading

### `/upload` — Subir fotos (publica)

| Estado | Componente | Comportamiento |
|--------|------------|---------------|
| Sin `owner` | Error | "Enlace invalido. Escanea el codigo QR nuevamente." |
| Cargando | Spinner | Obteniendo informacion... |
| Listo | `photo-uploader.tsx` | Dos modos de captura |
| Subiendo | Progress bar | "Subiendo N archivos..." |
| Exito | Success | "Fotos subidas! Puedes cerrar esta pagina." |
| Error | Error | Mensaje de error + boton reintentar |

## Componentes

### `photo-uploader.tsx`

**Dos modos de entrada**:

1. **Camara** — `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`
   - Preview de camara en vivo
   - Boton "Tomar foto" → captura un frame del video a canvas → blob
   - Se pueden tomar multiples fotos (acumula hasta 10)
   - Boton "Detener camara" al terminar

2. **Galeria** — `<input type="file" accept="image/*" multiple />`
   - Multi-select nativo del dispositivo
   - Se pueden seleccionar hasta 10 archivos

**Preview**: Grid de thumbnails de fotos seleccionadas, cada una con boton "X" para remover.

**Contador**: `"5/10 fotos seleccionadas"`, se deshabilita seleccion al llegar a 10.

**Upload**: Boton "Subir fotos" → `POST /api/drive/upload` con FormData.

**Validacion cliente**:
```typescript
const MAX_FILES = 10
const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
```

### `qr-display.tsx`

Props: `userId: string`, `baseUrl: string`

Renderiza QR con `qrcode.react` apuntando a `${baseUrl}/upload?owner=${userId}`.

Incluye:
- QR code centrado en un card
- Texto: "Escanea para subir fotos"
- Boton "Descargar QR" → descarga como PNG
- Tamaño responsive (min 200px, max 400px)

### `folder-gallery.tsx`

Props: `folderId: string`

Grid responsive de fotos (3 columnas desktop, 2 tablet, 1 mobile).

Cada foto: thumbnail + nombre truncado.

Click: abre en nueva ventana con `webViewLink`.

### `auth-buttons.tsx`

- `SignInButton` → llama a `signIn('google', { callbackUrl: '/dashboard' })`
- `SignOutButton` → llama a `signOut({ callbackUrl: '/' })`
- Muestra avatar y nombre del usuario cuando autenticado

## Layout (`app/layout.tsx`)

```
+-------------------------------------+
| [Logo] photo-group    [Avatar] [⇨]  |  ← Navbar
+-------------------------------------+
|                                     |
|          Page Content               |
|                                     |
+-------------------------------------+
```

- Navbar fijo arriba
- Footer minimo con creditos
- Max width: `max-w-6xl mx-auto`

## Tema

- Tailwind CSS v4
- Colores: neutral/grises con acento azul
- Tipografia: sistema nativa (`font-sans`)
- Modo oscuro: solo claro para MVP

## Responsive

| Breakpoint | Comportamiento |
|------------|---------------|
| < 640px | Una columna, nav simplificado |
| 640-1024px | Dos columnas en galeria |
| > 1024px | Tres columnas, navegacion completa |

## Animaciones / Transiciones

- Loading: skeleton shimmer
- Upload: barra de progreso
- Transicion de paginas: instantanea (sin framer motion para MVP)
