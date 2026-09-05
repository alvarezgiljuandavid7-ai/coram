# CorAM: archivo maestro de continuidad

Actualizado: 20 de julio de 2026. Este documento no contiene secretos, claves,
contraseñas, correos reales ni datos personales.

## 1. Producto y objetivo

CorAM es una plataforma web y móvil para ministerios musicales cristianos. Reúne
Himnario, Corarios, afinador, piano, calentamiento vocal, academia, recursos,
repertorio personal, organizaciones ministeriales, planificación de servicios,
afiliados y patrocinios. Su objetivo es facilitar preparación, formación,
repertorio y coordinación del equipo con una experiencia premium y mobile-first.

## 2. Stack

- Web: React 19, Vite 8 y React Router.
- Móvil: Expo SDK 57, React Native 0.86 y Expo Router.
- Backend: Supabase Postgres, Auth, RLS, Storage y Edge Functions.
- Hosting web: Vercel.
- Builds móviles: Expo Application Services (EAS).
- Suscripciones móviles: RevenueCat, preparada pero desactivada.
- Anuncios móviles: AdMob/UMP, preparados con IDs de prueba y desactivados.
- Estado remoto: TanStack Query.

## 3. Repositorio, ramas y PR

- Repositorio: https://github.com/alvarezgiljuandavid7-ai/coram
- Base estable actual: `fix/mobile-tools-data-performance`.
- Trabajo Monetization MVP: `feature/coram-monetization-mvp`.
- PR abierto y sin fusionar: https://github.com/alvarezgiljuandavid7-ai/coram/pull/2
- Commit de diseño: `1779762e276af6314c41b21b159631df8e7e446c`.
- Base Expo fusionada: `a62e17d9`.
- Monetization MVP: commits `e5059f08` a `844bbdcd`.
- Endurecimiento staging/API: `0d3a3390`, `764b3f4c`, `816d1a13`,
  `382c1739`.

## 4. URLs y entornos

- Web Production: https://coram-two.vercel.app
- Preview de rama: https://coram-git-feature-cora-c08204-alvarezgiljuandavid7-ais-projects.vercel.app
- Deployment verificado: https://coram-kgz9rk5hd-alvarezgiljuandavid7-ais-projects.vercel.app
- Supabase Production: `qbjcqnhgijsotmdzccmi`.
- Supabase Staging: `zcizkqqhxecfrjuqwaej`, región `us-east-2`.

Production es estrictamente de solo lectura sin autorización expresa. Nunca
ejecutar migraciones, escrituras, borrados ni cargas de prueba allí.

## 5. Supabase, migraciones y RLS

Staging contiene el baseline histórico y las migraciones Monetization MVP
`202607200001` a `202607200009`, más la corrección versionada de lectura
pública de afiliados. Hay 41 tablas públicas y las 41 tienen RLS habilitado.
La suite SQL de aislamiento fue ejecutada en staging dentro de una transacción
con rollback.

Tablas principales:

- Identidad/contenido: `profiles`, `hymnal_collections`, `hymns`,
  `corarios`, `courses`, `resources`.
- Ministerio: `organizations`, `organization_members`,
  `organization_invitations`, `services`, `service_assignments`.
- Repertorio: `songs`, `service_songs`.
- Monetización ética: `affiliate_partners`, `affiliate_courses`,
  `affiliate_clicks`, `sponsor_campaigns`, `sponsor_placements`,
  `sponsor_events`.
- Planes: `user_entitlements`, `billing_events`.

El repertorio usa ownership XOR: cada canción pertenece exactamente a
`owner_user_id` (privada) o a `organization_id` (compartida). Un usuario no
ve canciones privadas ajenas; los integrantes autorizados ven el repertorio de
su organización. Free tiene límite personal, Pro es ilimitado y Ministerio se
limita por organización.

## 6. Estado de contenido

- Production: 1 colección Manantial y 272 himnos publicados.
- Staging: 1 colección Manantial, 272 himnos publicados y 0 corarios.
- La copia preserva IDs, relación, número, título, slug, tono, letra, acordes,
  estado y timestamps. `search_text` se regenera por su columna calculada.
- Script reproducible:
  `scripts/staging/copy-public-hymns-to-staging.ts`.
- No se versionan exportaciones de letras.
- No se copiaron usuarios, perfiles, emails, favoritos, colecciones, progreso,
  Auth, compras, entitlements, métricas ni sesiones.
- Cursos/videos productivos no se copiaron porque no son necesarios para QA y
  referencian Storage productivo. Afiliados y patrocinadores usan fixtures QA.

## 7. Funciones implementadas

- Planes, capacidades, límites, roles y transposición.
- Organizaciones, miembros, invitaciones e instrumentos.
- Servicios, asignaciones, confirmaciones y canciones del servicio.
- Repertorio personal y ministerial con búsqueda y transposición.
- Afiliados con allowlist, disclosure, tracking y redirect HTTPS seguro.
- Patrocinios con placements, impresiones, clicks, frequency cap y gating.
- Expo Auth con Supabase, SecureStore, guards, logout y deep links.
- Infraestructura RevenueCat de offerings, compra, restore, entitlement y
  webhook idempotente.
- Infraestructura AdMob con consentimiento, IDs de prueba, feature flags y cero
  anuncios para planes pagos.
- Web muestra plan y límites; no incluye checkout.

## 8. Pendientes funcionales y humanos

- Configurar Apple Developer y App Store Connect.
- Configurar Google Play Console.
- Crear proyecto/productos reales en RevenueCat y probar sandbox.
- Crear apps/ad units en AdMob y validar UMP con anuncios de prueba.
- Iniciar sesión en EAS, definir IDs finales y configurar firma Android/iOS.
- Ejecutar builds de desarrollo y QA en dispositivos físicos.
- Aprobar privacidad, términos, soporte, derechos de contenido y textos legales.
- Revisar las 12 vulnerabilidades moderadas de la cadena Expo; hay 0 altas y
  0 críticas y el fix automático propuesto es incompatible.

## 9. RevenueCat

- Estado: infraestructura implementada, integración real desactivada.
- Offering esperado: `default`.
- Entitlements: `pro`, `ministry_starter`, `ministry_pro`.
- Productos: `coram_pro_monthly`, `coram_pro_yearly`,
  `coram_ministry_starter_monthly`,
  `coram_ministry_starter_yearly`,
  `coram_ministry_pro_monthly`, `coram_ministry_pro_yearly`.
- Pendientes: claves públicas iOS/Android, secreto del webhook, productos de
  tienda, sandbox y pruebas en dispositivo. Nunca usar email como appUserID;
  usar UUID de Supabase.

## 10. AdMob

- Estado: infraestructura y consentimiento implementados; desactivado.
- Flags: `EXPO_PUBLIC_CORAM_ENABLE_ADMOB=false` y
  `EXPO_PUBLIC_CORAM_ADS_ENV=test`.
- Pendientes: App IDs y banner IDs reales para iOS/Android.
- Desarrollo usa IDs oficiales de prueba. No activar anuncios reales antes de
  UMP y QA físico. Pro y Ministerio deben producir cero solicitudes de anuncios.

## 11. Expo/EAS

Perfiles en `mobile/eas.json`: `development`, `preview`, `production`.
Comandos:

```text
npm run expo:typecheck
npm run expo:doctor
npm run expo:config
npm run expo:export:android
npm run expo:export:ios
```

No existe aún EAS Production aprobado. Faltan projectId, application ID/bundle
ID finales, credenciales de firma, builds firmados y pruebas físicas.

## 12. Vercel

Preview usa exclusivamente URL y publishable/anon key públicas de staging.
Nunca configurar `service_role` en Vercel. Production y Preview son entornos
separados; el PR #2 no debe promoverse ni fusionarse sin el checklist final.

## 13. Validación habitual

```text
npm ci
npm run test
npm run lint
npm run build
npm run expo:typecheck
NODE_OPTIONS=--use-system-ca npm run expo:doctor
npm run expo:export:android
npm run expo:export:ios
NODE_OPTIONS=--use-system-ca npm audit --omit=dev
```

Ejecutar también `supabase/tests/monetization_mvp_rls.sql` solo contra staging.

## 14. Archivos y carpetas protegidos

- No versionar `.env*` salvo ejemplos ya aprobados.
- No tocar ni incluir `.testsprite/`, `docs/sql/`, `.tmp/`, `.agents/`,
  `.hermes/`, adjuntos remotos, logs, CSV, backups, builds, `dist/`,
  `node_modules/`, credenciales, archivos de firma o service_role.
- No modificar Production ni la remediación Corarios/Himnarios sin autorización.
- No reescribir Auth, RLS, Web Audio o Admin fuera del alcance explícito.

## 15. Riesgos conocidos

- 12 vulnerabilidades moderadas transitivas de Expo; 0 altas/0 críticas.
- RevenueCat, AdMob y EAS no tienen evidencia real de sandbox/dispositivo.
- Password leaked protection de Supabase permanece pendiente.
- Advisors informan funciones SECURITY DEFINER intencionales y optimizaciones
  de políticas/índices; revisar antes de Production.
- El webhook RevenueCat responde no configurado mientras falta su secreto, lo
  cual es esperado en staging con compras desactivadas.

## 16. Checklist Android

- [ ] Application ID final y Play Console.
- [ ] EAS login, projectId y firma.
- [ ] Variables públicas y secretos gestionados fuera de Git.
- [ ] Supabase callback/deep link.
- [ ] Login, logout y restore en dispositivo.
- [ ] RevenueCat sandbox completo.
- [ ] UMP y anuncios etiquetados de prueba.
- [ ] Data Safety, privacidad, términos y soporte.
- [ ] Build firmado y beta cerrada.

## 17. Checklist iOS

- [ ] Apple Developer, App Store Connect y bundle ID.
- [ ] EAS login, projectId, certificados y provisioning.
- [ ] Supabase callback/deep link y Google/Apple según aprobación.
- [ ] Login, logout, compra y restore en iPhone.
- [ ] StoreKit/RevenueCat sandbox completo.
- [ ] ATT/UMP y anuncios de prueba.
- [ ] Privacy Nutrition Labels, términos y soporte.
- [ ] Build firmado y TestFlight.

## 18. Checklist antes de merge

- [ ] PR #2 revisado y staging aprobado.
- [ ] Git limpio y diff sin secretos ni artefactos.
- [ ] Tests, lint, build y exports frescos.
- [ ] RLS e aislamiento revalidados.
- [ ] Himnario 272 y Corarios 0 en staging.
- [ ] Preview sin schema-cache ni errores críticos.
- [ ] Riesgos y pendientes humanos aceptados.
- [ ] Ningún cambio accidental en Production.

## 19. Prompt reutilizable para otra IA

Lee `CORAM_HANDOFF.md` completamente antes de actuar. Ejecuta un preflight de
rama, git status, configuración y comandos disponibles. No modifiques Supabase
Production ni inventes estados o resultados. Conserva las ramas existentes y
trabaja en una rama nueva para cada alcance. No incluyas secretos, tokens,
passwords, service_role ni datos personales. Mantén Auth, RLS, Admin, Web Audio
y las integraciones externas dentro del alcance aprobado. Ejecuta tests, lint,
build web y validaciones móviles pertinentes. Entrega los cambios mediante Pull
Request, sin force push ni merge no autorizado. Si algo no puede verificarse,
reporta el bloqueador exacto y la evidencia disponible.
