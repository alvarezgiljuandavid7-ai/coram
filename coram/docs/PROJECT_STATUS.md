# CorAM Project Status

## Estado actual

CorAM ya esta funcionando como aplicacion web React/Vite/TypeScript conectada parcialmente a Supabase.

## Frontend listo

- Pantalla principal con simulador movil.
- Panel de administrador.
- Login real con Supabase Auth.
- Registro por correo.
- Ingreso con Google.
- Recuperacion de contrasena.
- Sincronizacion basica de perfil.
- Proteccion del panel admin por rol `admin`.
- Corarios cargados desde Supabase.
- Himnario Manantial de Inspiracion cargado desde Supabase.
- Subida de imagenes y videos desde el admin hacia Supabase Storage.

## Backend listo en Supabase

- Proyecto Supabase: `corarios`.
- Tabla `corarios` con 272 corarios reales.
- Tabla `hymnal_collections`.
- Tabla `hymns` con Himnario Manantial de Inspiracion.
- Tabla `profiles` para usuarios.
- Tabla `media_assets` para metadata de archivos subidos.
- Buckets de Storage:
  - `course-images`
  - `course-videos`
  - `resources`
  - `avatars`
  - `sponsors`
- RLS activo en tablas y Storage.

## Pendiente prioritario

- Que el usuario administrador exista en Supabase Auth y tenga `app_metadata.role = admin`.
- Persistir cursos, recursos, sponsors, anuncios y mentorias en tablas reales.
- Implementar Stripe para pagos.
- Crear politicas legales: privacidad, terminos, cookies y reembolsos.
- Mejorar textos mojibake/heredados de la importacion original.
- Separar componentes grandes para mantenimiento mas facil.

## Ruta oficial

```text
C:\Users\Usuario\Desktop\open desing\coram\app
```

## URL local

```text
http://127.0.0.1:3000
```
