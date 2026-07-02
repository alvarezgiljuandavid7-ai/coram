# CorAM AI Handoff

Este documento sirve para entregar el proyecto CorAM a otra herramienta de IA o equipo de desarrollo sin perder el contexto actual.

## Fuente de verdad

- Repositorio GitHub: `https://github.com/alvarezgiljuandavid7-ai/coram.git`
- Produccion Vercel: `https://coram-two.vercel.app`
- Rama principal: `main`

No trabajar copiando archivos sueltos si la herramienta permite conectar GitHub. Lo correcto es importar o clonar el repositorio y crear una rama nueva para cada cambio.

## Stack tecnico

- React 19
- Vite 8
- TypeScript
- Tailwind CSS 4
- React Router
- Supabase Auth + Supabase data
- Motion React
- Lucide React
- Vitest
- Capacitor preparado para Android/iOS, aunque la ruta actual prioritaria es web/PWA.

Comandos:

```bash
npm install
npm run dev
npm run lint
npm run build
npm run test
```

## Variables de entorno

Crear las variables en el entorno de la herramienta o hosting. No escribir secretos dentro del codigo.

```bash
VITE_SUPABASE_URL="https://PROJECT_REF.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
VITE_CORAM_PUBLIC_URL="https://coram-two.vercel.app"
VITE_CORAM_ENABLE_APPLE_AUTH=false
```

Importante:

- Usar solo publishable/anon key en frontend.
- Nunca usar service role key en Vite/browser.
- Apple Auth esta preparado pero desactivado hasta configurar Apple Developer.

## Estructura de experiencias

CorAM esta separado en cuatro experiencias independientes:

1. Landing publica: `/`
2. Autenticacion: `/login`, `/register`, `/forgot-password`
3. App de usuario: `/app`
4. Panel administrador: `/admin`

Layouts:

- `src/layouts/PublicLayout.tsx`
- `src/layouts/AuthLayout.tsx`
- `src/layouts/AppLayout.tsx`
- `src/layouts/AdminLayout.tsx`

Reglas que no se deben romper:

- La landing no debe importar componentes internos de la app.
- `/app` no debe mostrar mockup de celular ni hero comercial.
- `/admin` no debe compartir menu ni layout con usuarios normales.
- El acceso admin depende de `profiles.role` desde Supabase.
- Si no hay sesion, enviar a `/login`.
- Si un usuario no admin entra a `/admin`, enviar a `/app`.

## Rutas principales

Usuario:

- `/app/inicio`
- `/app/corarios`
- `/app/himnario`
- `/app/academia`
- `/app/recursos`
- `/app/herramientas`
- `/app/herramientas/afinador`
- `/app/herramientas/piano`
- `/app/herramientas/calentamiento`
- `/app/perfil`

Admin:

- `/admin/dashboard`
- `/admin/cursos`
- `/admin/corarios`
- `/admin/himnos`
- `/admin/recursos`
- `/admin/usuarios`
- `/admin/configuracion`

## Estado visual actual

La app de usuario fue redisenada con estilo premium mobile-first:

- Paleta navy/dorado.
- Cards premium.
- Header compacto.
- Bottom nav en movil.
- Sidebar en desktop.
- Secciones reales sin mockup de celular.
- Herramientas visibles dentro de `/app/herramientas`.

Componentes compartidos del rediseño:

- `src/components/app-premium/PremiumApp.tsx`

Pantallas de usuario redisenadas:

- `src/pages/app/AppInicioPage.tsx`
- `src/pages/app/HerramientasPage.tsx`
- `src/pages/app/AcademiaPage.tsx`
- `src/pages/app/RecursosPage.tsx`
- `src/pages/app/CorariosPage.tsx`
- `src/pages/app/HimnarioPage.tsx`
- `src/pages/app/ProfilePage.tsx`

## Autenticacion y roles

La seguridad real de admin debe venir de Supabase:

- `profiles.role === "admin"` -> `/admin/dashboard`
- `profiles.role === "premium"` -> `/app`
- `profiles.role === "member"` -> `/app`

Archivos relevantes:

- `src/app/useSupabaseAuth.ts`
- `src/domain/auth/postLoginRedirect.ts`
- `src/routes/ProtectedRoute.tsx`
- `src/routes/AdminRoute.tsx`
- `src/shared/supabase/client.ts`

No basar autorizacion solo en correo desde frontend.

## Herramientas vocales

Herramientas existentes:

- Afinador vocal
- Piano / teclado
- Calentamiento vocal

Archivos:

- `src/pages/app/tools/HerramientasPage.tsx`
- `src/pages/app/tools/AfinadorPage.tsx`
- `src/pages/app/tools/PianoPage.tsx`
- `src/pages/app/tools/CalentamientoPage.tsx`
- `src/pages/app/tools/VocalToolsShell.tsx`
- `src/components/PhoneSimulator.tsx`
- `src/domain/audio/reusableAudioContext.ts`
- `src/domain/audio/pitchHold.ts`
- `src/domain/audio/tunerMatch.ts`

No reescribir desde cero si se puede corregir sobre esta base.

## Admin y CRUD

El panel administrador ya tiene estructura para gestionar:

- Dashboard
- Cursos
- Corarios
- Himnos
- Recursos
- Usuarios
- Configuracion

Archivos:

- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminCrudPage.tsx`
- `src/pages/admin/AdminCoursesPage.tsx`
- `src/pages/admin/AdminCorariosPage.tsx`
- `src/pages/admin/AdminHymnsPage.tsx`
- `src/pages/admin/AdminResourcesPage.tsx`
- `src/pages/admin/AdminUsersPage.tsx`
- `src/pages/admin/AdminSettingsPage.tsx`
- `src/domain/admin/adminCrudRepository.ts`

Antes de cambiar CRUD, revisar permisos RLS y tablas reales en Supabase.

## Produccion y cache

Vercel usa `vercel.json` con rewrite SPA y headers no-cache para rutas principales. Esto evita que el navegador siga mostrando versiones viejas del HTML.

Archivo:

- `vercel.json`

## Validacion esperada antes de entregar cambios

Ejecutar:

```bash
npm run lint
npm run build
npm run test
```

Probar visualmente:

- Movil: 360px, 390px, 430px
- Tablet: 768px
- Desktop: 1366px

Rutas minimas a revisar:

- `/app/inicio`
- `/app/herramientas`
- `/app/corarios`
- `/app/himnario`
- `/app/academia`
- `/app/recursos`
- `/app/perfil`
- `/admin/dashboard`

## Prompt recomendado para otra IA

Pega este prompt en la otra herramienta despues de darle acceso al repositorio:

```text
Vas a trabajar en CorAM, una app web/PWA para ministerios de alabanza.

Repositorio fuente:
https://github.com/alvarezgiljuandavid7-ai/coram.git

No rehagas la app desde cero. Continua desde el estado actual del repositorio.

Stack:
- React + Vite + TypeScript
- Tailwind CSS
- Supabase Auth y datos
- React Router
- Motion React

Reglas obligatorias:
1. Mantener separadas las cuatro experiencias:
   - Landing publica: /
   - Auth: /login, /register, /forgot-password
   - App usuario: /app
   - Admin: /admin
2. No mezclar landing con /app.
3. No mostrar mockup de celular dentro de /app.
4. No romper login email/password, Google login ni recuperacion de contraseña.
5. Apple Login debe seguir oculto mientras VITE_CORAM_ENABLE_APPLE_AUTH no sea true.
6. No guardar claves, tokens ni secretos en codigo.
7. Admin solo si profiles.role === "admin" desde Supabase.
8. Usuarios member/premium deben ir a /app.
9. Si no hay sesion, redirigir a /login.
10. No cambiar rutas sin justificarlo.

Antes de modificar:
- Revisa AI_HANDOFF.md.
- Revisa src/routes/AppRouter.tsx.
- Revisa src/layouts/AppLayout.tsx y src/layouts/AdminLayout.tsx.
- Revisa src/components/app-premium/PremiumApp.tsx.
- Ejecuta npm install si hace falta.

Objetivo:
Continuar mejorando CorAM con calidad de produccion, mobile-first, manteniendo el estilo premium navy/dorado, sin romper autenticacion, roles, Supabase ni rutas actuales.

Al finalizar:
- Entrega archivos modificados.
- Explica que rutas probaste.
- Ejecuta npm run lint, npm run build y npm run test.
```

## Forma recomendada de trabajar con otra IA

Opcion ideal:

1. Conectar la herramienta a GitHub.
2. Importar `alvarezgiljuandavid7-ai/coram`.
3. Crear una rama nueva, por ejemplo `feature/lovable-redesign-pass`.
4. Configurar variables de entorno en la herramienta.
5. Pedirle que lea `AI_HANDOFF.md`.
6. Hacer cambios.
7. Revisar diff.
8. Abrir Pull Request o fusionar a `main` solo cuando pase validacion.

Opcion si la herramienta no conecta GitHub:

1. Descargar ZIP del repo desde GitHub.
2. Subir el ZIP a la herramienta.
3. Pegar el prompt recomendado.
4. Pedir que entregue cambios como patch o ZIP.
5. Revisar manualmente antes de reemplazar archivos.

No recomendado:

- Copiar solo `index.html`.
- Pegar solo capturas.
- Subir solo `dist/`.
- Compartir `.env.local`.
- Compartir tokens personales o service role keys.
