# Apple Login pendiente

CorAM mantiene el codigo preparado para Apple Auth, pero el boton "Continuar con Apple" permanece oculto mientras:

```env
VITE_CORAM_ENABLE_APPLE_AUTH=false
```

Para activar Apple en una fase futura:

1. Crear una cuenta de Apple Developer.
2. Crear un Service ID para web.
3. Activar Sign in with Apple en ese Service ID.
4. Agregar el dominio publico de CorAM.
5. Agregar en Apple la Return URL que muestra Supabase para el proveedor Apple.
6. Crear una Apple private key `.p8` y guardar Team ID, Key ID y Service ID.
7. Pegar esos datos en Supabase Dashboard > Authentication > Providers > Apple.
8. Agregar la URL publica de CorAM en Supabase Auth > URL Configuration.
9. Cambiar `VITE_CORAM_ENABLE_APPLE_AUTH=true` en Vercel.

Apple OAuth web exige rotar el client secret generado con la key `.p8` cada 6 meses. Hasta completar esa configuracion, CorAM debe lanzarse con email/password, Google login y recuperacion de contrasena.
