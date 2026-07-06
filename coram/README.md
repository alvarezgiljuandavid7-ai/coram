# CorAM

Carpeta principal del proyecto CorAM dentro de este workspace.

## Ruta de trabajo

La aplicacion viva esta en:

```text
C:\Users\Usuario\Desktop\open desing\coram\app
```

Desde esa carpeta se ejecuta:

```bash
npm run dev
```

Vite usa `http://localhost:3000`.

## Estructura principal

- `app/`: aplicacion viva de CorAM en React/Vite/TypeScript.
- `docs/`: especificaciones, planes, estado actual y notas tecnicas.
- `references/originals/`: archivos originales importados al iniciar el proyecto.

Esta carpeta `coram/` es el lugar unico de trabajo para la aplicacion CorAM. El resto del workspace pertenece a herramientas y proyectos externos.

## Estado actual

CorAM ya no es solo un mock local. La app tiene integraciones reales con Supabase:

- Supabase Auth para login con Google, correo y recuperacion de contrasena.
- Tabla `profiles` para guardar correos, nombre, avatar, proveedor e info premium.
- Tabla `corarios` con los 272 corarios reales.
- Tabla `hymns` con el Himnario Manantial de Inspiracion.
- Supabase Storage para imagenes, videos, recursos, avatares y patrocinadores.
- Tabla `media_assets` para metadata de archivos.
- RLS activo en tablas y Storage.

## Zonas importantes

- `app/src/App.tsx`: shell principal, tabs globales y proteccion del Admin.
- `app/src/components/PhoneSimulator.tsx`: simulador movil.
- `app/src/components/AdminDashboard.tsx`: panel administrador.
- `app/src/components/AuthPanel.tsx`: login real de Supabase.
- `app/src/domain/`: logica por dominio.
- `app/src/shared/supabase/client.ts`: cliente Supabase del frontend.

## Documentos de orientacion

- `docs/PROJECT_MAP.md`: mapa rapido de carpetas y archivos.
- `docs/PROJECT_STATUS.md`: estado actual, backend, frontend y pendientes.
- `docs/SUPABASE.md`: resumen de la integracion real con Supabase.
