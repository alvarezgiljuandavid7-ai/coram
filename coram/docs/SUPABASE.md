# CorAM Supabase Notes

## Proyecto

- Nombre: `corarios`
- Project ref: `qbjcqnhgijsotmdzccmi`
- URL: `https://qbjcqnhgijsotmdzccmi.supabase.co`

## Cliente frontend

El frontend usa solo la publishable key desde `coram/app/.env.local`.

Nunca se debe colocar la `service_role` key en el frontend.

## Auth

CorAM usa Supabase Auth para:

- Google login.
- Email/password.
- Signup.
- Password recovery.
- Session sync.

El panel admin requiere:

```json
{
  "role": "admin"
}
```

en `auth.users.raw_app_meta_data`.

## Tablas principales

- `public.profiles`: perfil del usuario.
- `public.corarios`: corarios reales.
- `public.hymnal_collections`: colecciones de himnarios.
- `public.hymns`: himnos por coleccion.
- `public.media_assets`: metadata de archivos subidos.

## Storage

Buckets creados:

- `course-images`: publico, imagenes de cursos.
- `course-videos`: privado, videos de cursos.
- `resources`: privado, PDFs, audios e imagenes.
- `avatars`: publico, imagenes de perfil.
- `sponsors`: publico, imagenes de patrocinadores.

## Seguridad

- RLS esta activo en tablas publicas.
- Storage tiene politicas separadas para lectura publica, lectura autenticada y escritura admin.
- El frontend sube archivos solo con sesion autenticada y rol admin.
