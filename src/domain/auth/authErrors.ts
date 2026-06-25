export function humanizeAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || '');
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Correo o contrasena incorrectos. Si entras con Google, usa el boton Google o recupera tu contrasena.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Tu correo todavia no esta confirmado. Revisa tu bandeja de entrada antes de iniciar sesion.';
  }

  if (normalized.includes('email rate limit exceeded') || normalized.includes('over_email_send_rate_limit')) {
    return 'Supabase alcanzo el limite temporal de correos. Intenta registrarte mas tarde o entra con Google.';
  }

  if (normalized.includes('email address') && normalized.includes('invalid')) {
    return 'Ese correo no parece valido para Supabase. Usa un correo real o continua con Google.';
  }

  if (normalized.includes('provider is not enabled')) {
    return 'El proveedor de Google no esta habilitado en Supabase. Revisa Authentication > Providers.';
  }

  if (normalized.includes('redirect') || normalized.includes('not allowed')) {
    return 'La URL de retorno no esta autorizada en Supabase. Revisa Authentication > URL Configuration.';
  }

  return message || 'No se pudo completar la accion.';
}
