# 8. Seguridad

## Autenticación y Autorización

- La contraseña de la dueña se almacena con hash bcrypt (salt rounds: 12) en MySQL.
- El backend emite un JWT firmado con `JWT_SECRET` (variable de entorno en Railway) con expiración de 8 horas.
- El JWT viaja exclusivamente en una cookie httpOnly + SameSite=Strict, nunca en localStorage.
- Todas las rutas `/admin/*` del frontend verifican la presencia del JWT antes de renderizar.
- Todas las rutas de la API NestJS (excepto `/auth/login` y `/catalogo`) requieren el guard `JwtAuthGuard`.

## Manejo de Secretos

| Secreto | Dónde vive |
|---|---|
| `JWT_SECRET` | Variable de entorno en Railway |
| `DATABASE_URL` | Variable de entorno en Railway (inyectada por Railway automáticamente) |
| `CLOUDINARY_CLOUD_NAME` | Variable de entorno en Railway |
| `CLOUDINARY_API_KEY` | Variable de entorno en Railway |
| `CLOUDINARY_API_SECRET` | Variable de entorno en Railway |
| `NEXT_PUBLIC_API_URL` | Variable de entorno en Vercel |

Ningún secreto se commitea al repositorio. Se usa `.env.example` como referencia sin valores reales.

## Superficie de Ataque

- **Catálogo público:** Solo lectura, sin autenticación. No acepta parámetros que modifiquen datos.
- **CORS:** El backend solo acepta requests desde el dominio de Vercel (configurado en NestJS `CorsModule`).
- **Rate limiting:** NestJS `ThrottlerModule` limita el endpoint `/auth/login` a 5 intentos por minuto para mitigar fuerza bruta.
- **Validación de inputs:** Todos los DTOs de NestJS usan `class-validator` para sanitizar y validar datos entrantes.
- **Subida de archivos:** Solo se aceptan archivos con MIME type `image/jpeg`, `image/png` o `image/webp`, con tamaño máximo de 5 MB.
