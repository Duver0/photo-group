# Specs — photo-group

Indice de especificaciones tecnicas del proyecto.

| Archivo | Descripcion |
|---------|-------------|
| ARCHITECTURE.md | Arquitectura del sistema, stack tecnologico, estructura de directorios |
| AUTH-FLOW.md | Flujo de autenticacion OAuth con Google + NextAuth.js |
| DRIVE-INTEGRATION.md | Integracion con Google Drive API (carpetas, uploads, permisos) |
| API-ROUTES.md | Especificacion de rutas API (endpoints, request/response, validacion) |
| FRONTEND.md | Componentes UI (paginas, estados, validacion cliente) |
| DEPLOYMENT.md | Despliegue en Vercel, variables de entorno, Google Cloud Console |

## Convenciones

- **Formato de fecha**: `YYYY-MM-DD` (ISO 8601) para nombres de carpeta en Drive
- **Archivos**: Solo imagenes (jpg, jpeg, png, webp, gif, heic). Maximo 10 por upload.
- **Autenticacion**: NextAuth.js v5 con JWT, sin base de datos
- **API**: Next.js App Router Route Handlers, validacion en servidor
