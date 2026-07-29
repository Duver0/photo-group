# Deployment Specification

## Plataforma: Vercel

### Configuracion `vercel.json`

```json
{
  "framework": "nextjs",
  "functions": {
    "app/api/drive/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

Las rutas de Drive API pueden exceder los 10s default de Vercel — se extiende a 30s.

### Variables de entorno (Vercel Dashboard)

| Variable | Valor | Secreto |
|----------|-------|---------|
| `AUTH_SECRET` | Generar con `openssl rand -base64 32` | Si |
| `AUTH_GOOGLE_ID` | Client ID de Google Cloud | Si |
| `AUTH_GOOGLE_SECRET` | Client Secret de Google Cloud | Si |
| `NEXT_PUBLIC_APP_URL` | `https://photo-group.vercel.app` | No |

### Build

```bash
bun install
bun run build
```

Vercel detecta automaticamente Next.js y Bun lockfile.

---

## Google Cloud Console

### Pasos

1. Ir a https://console.cloud.google.com
2. Crear proyecto nuevo: `photo-group`
3. Habilitar APIs:
   - Google Drive API
4. Configurar pantalla de consentimiento OAuth:
   - Tipo: Externo (o Interno si solo usuarios de tu organizacion)
   - Scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `.../auth/drive.file`
   - Test users: anadir los correos de prueba
5. Crear credenciales OAuth 2.0:
   - Tipo: Aplicacion web
   - Origenes JS autorizados:
     - `http://localhost:3000`
     - `https://photo-group.vercel.app` (o dominio personalizado)
   - URIs de redireccion:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://photo-group.vercel.app/api/auth/callback/google`

### Publicacion

Cuando este lista para produccion, enviar la pantalla de consentimiento a verificacion de Google (o limitar a 100 usuarios si no se verifica).

---

## CI/CD

- Rama `main` → deploy automatico a produccion
- Pull Requests → preview deployments automaticos
- Comando manual: `vercel --prod`

## Seguridad en produccion

- [ ] `AUTH_SECRET` rotado periodicamente
- [ ] Headers CSP configurados en `next.config.ts`
- [ ] Logs de Vercel no contienen tokens
- [ ] Rate limiting en `/api/drive/upload` (opcional, Vercel WAF)
- [ ] Dominio personalizado con SSL (automatico con Vercel)

## Monitoreo

- Vercel Analytics para metricas de uso
- Vercel Logs para errores de serverless functions
- Google Cloud Console > APIs > Dashboard para monitorear uso de Drive API
