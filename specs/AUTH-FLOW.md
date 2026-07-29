# Auth Flow Specification

## Provider: Google OAuth 2.0

### Scopes solicitados

- `openid`, `profile`, `email` — autenticacion basica
- `https://www.googleapis.com/auth/drive.file` — acceso a archivos creados por la app

### Configuracion NextAuth

```
Archivo: lib/auth.ts
```

**JWT strategy** (sin base de datos). El token de acceso de Google se almacena en la sesion JWT y se refresca automaticamente.

### Callbacks

| Callback | Proposito |
|----------|-----------|
| `jwt()` | Almacenar `access_token`, `refresh_token`, `expires_at` en el token JWT |
| `session()` | Exponer `accessToken` y `sub` (Google user ID) en la sesion del cliente |

### Token Refresh

```ts
async function refreshAccessToken(token: JWT): Promise<JWT> {
  // POST a https://oauth2.googleapis.com/token con refresh_token
  // Actualizar token.access_token, token.expires_at, token.refresh_token
}
```

Cuando `expires_at` <= Date.now() / 1000, se refresca automaticamente en el callback `jwt`.

## Middleware (`middleware.ts`)

| Ruta | Acceso |
|------|--------|
| `/` | Publico |
| `/upload` | Publico (solo query param `owner`) |
| `/dashboard/*` | Requiere autenticacion |
| `/api/auth/*` | Publico (manejado por NextAuth) |
| `/api/drive/*` | Requiere autenticacion (excepto upload con token valido) |

## Flujo completo

```
1. User visita /
2. Click "Sign in with Google"
3. Redirige a accounts.google.com (consent screen)
4. User autoriza scopes (incluyendo drive.file)
5. Google redirige a /api/auth/callback/google
6. NextAuth intercambia code por tokens
7. JWT creado con access_token, refresh_token, expires_at
8. Redirige a /dashboard
9. QR code generado con URL: /upload?owner={user.sub}
```

## Manejo de errores

- Token expirado → refresh automatico (si falla, redirigir a login)
- Consentimiento revocado → mostrar error y boton para reconectar
- Scope faltante → logout y nuevo login con prompt=consent
