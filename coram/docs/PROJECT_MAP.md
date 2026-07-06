# CorAM Project Map

Este documento define donde vive cada parte del proyecto CorAM.

## Carpeta raiz

```text
coram/
```

La carpeta `coram/` es la carpeta unica del proyecto.

## Aplicacion

```text
coram/app/
```

Aplicacion web principal en React, Vite y TypeScript.

Archivos clave:

- `src/App.tsx`: estructura principal de la app web.
- `src/components/PhoneSimulator.tsx`: experiencia movil simulada.
- `src/components/AdminDashboard.tsx`: panel de administracion.
- `src/components/AuthPanel.tsx`: login, registro y recuperacion de contrasena.
- `src/app/useCoramAppState.ts`: estado principal de CorAM.
- `src/app/useSupabaseAuth.ts`: sesion real con Supabase.
- `src/shared/supabase/client.ts`: cliente Supabase del frontend.

## Dominios

```text
coram/app/src/domain/
```

- `auth/`: funciones de autenticacion.
- `corarios/`: carga de corarios y logica de acordes.
- `hymns/`: Himnario Manantial de Inspiracion.
- `media/`: subida de archivos a Supabase Storage.
- `admin/`: calculos y metricas del panel admin.
- `monetization/`: reglas premium y acceso.
- `profile/`: acciones del perfil.

## Documentacion

```text
coram/docs/
```

- `PROJECT_MAP.md`: este mapa.
- `PROJECT_STATUS.md`: estado actual del proyecto.
- `SUPABASE.md`: resumen de backend real.
- `superpowers/`: planes y especificaciones historicas del desarrollo.

## Referencias originales

```text
coram/references/originals/
```

Archivos originales usados como punto de partida:

- `coram app.zip`
- `coram flutter codigo.txt`

## Comandos de trabajo

Desde `coram/app/`:

```bash
npm run dev
npm run lint
npm run test
npm run build
```
