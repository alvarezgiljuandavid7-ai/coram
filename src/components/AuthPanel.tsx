import { FormEvent, useState } from 'react';
import { AlertCircle, Check, KeyRound, Loader2, LogOut, Mail, ShieldCheck } from 'lucide-react';
import type { CoramAuthState } from '../app/useSupabaseAuth';
import { humanizeAuthError } from '../domain/auth/authErrors';

interface AuthPanelProps {
  auth: CoramAuthState;
  compact?: boolean;
}

type AuthMode = 'signin' | 'signup' | 'reset';

export function AuthPanel({ auth, compact = false }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setWorking(true);
    setError('');
    setMessage('');

    try {
      if (auth.recoveryMode) {
        await auth.updateCurrentPassword(password);
        setMessage('Contraseña actualizada. Ya puedes continuar con tu sesión.');
      } else if (mode === 'signin') {
        await auth.signInWithEmail(email, password);
        setMessage('Sesión iniciada correctamente.');
      } else if (mode === 'signup') {
        await auth.signUpWithEmail(email, password, fullName);
        setMessage('Cuenta creada. Revisa tu correo si Supabase solicita confirmación.');
      } else {
        await auth.sendPasswordReset(email);
        setMessage('Te enviamos un enlace para recuperar tu contraseña.');
      }
    } catch (caughtError) {
      setError(humanizeAuthError(caughtError));
    } finally {
      setWorking(false);
    }
  };

  const startGoogleSignIn = async () => {
    setWorking(true);
    setError('');
    setMessage('');

    try {
      await auth.signInWithGoogle();
    } catch (caughtError) {
      setError(humanizeAuthError(caughtError));
    } finally {
      setWorking(false);
    }
  };

  if (auth.loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Validando sesión...</span>
      </div>
    );
  }

  if (auth.user) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
        <div className="text-right leading-tight">
          <span className="block text-[10px] font-black uppercase tracking-wider text-[#0B2545]">
          {auth.isAdmin ? 'Administrador' : auth.role === 'premium' ? 'Premium' : 'Miembro'}
          </span>
          <span className="block max-w-[180px] truncate text-[11px] font-semibold text-slate-500">
            {auth.profile?.email ?? auth.user.email}
          </span>
        </div>
        {auth.isAdmin && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
        <button
          type="button"
          onClick={() => void auth.signOut()}
          className="rounded-xl bg-white p-2 text-slate-500 transition-colors hover:text-[#0B2545]"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-3xs ${compact ? 'max-w-md' : 'max-w-sm'}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#0B2545]">
          {auth.recoveryMode ? 'Nueva contraseña' : mode === 'signin' ? 'Acceso real' : mode === 'signup' ? 'Crear cuenta' : 'Recuperar acceso'}
        </span>
        {!auth.recoveryMode && (
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-[10px] font-black text-[#C29031] hover:underline"
          >
            {mode === 'signin' ? 'Registrarme' : 'Ingresar'}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {!auth.recoveryMode && mode !== 'reset' && (
          <button
            type="button"
            disabled={working}
            onClick={() => void startGoogleSignIn()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 disabled:cursor-wait disabled:text-slate-400"
          >
            {working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5 text-[#C29031]" />}
            <span>Continuar con Google</span>
          </button>
        )}

        {mode === 'signup' && !auth.recoveryMode && (
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nombre"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-hidden focus:border-[#C29031]"
          />
        )}
        {!auth.recoveryMode && (
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@dominio.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-hidden focus:border-[#C29031]"
          />
        )}
        {mode !== 'reset' || auth.recoveryMode ? (
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={auth.recoveryMode ? 'Nueva contraseña' : 'Contraseña'}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-hidden focus:border-[#C29031]"
          />
        ) : null}

        {error && (
          <div className="flex gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] font-bold text-red-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="flex gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[10px] font-bold text-emerald-700">
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={working}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white hover:bg-slate-900 disabled:cursor-wait disabled:bg-slate-400"
          >
            {working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
            <span>{auth.recoveryMode ? 'Actualizar' : mode === 'reset' ? 'Enviar' : mode === 'signup' ? 'Crear cuenta' : 'Entrar'}</span>
          </button>
        </div>

        {!auth.recoveryMode && (
          <button
            type="button"
            onClick={() => setMode(mode === 'reset' ? 'signin' : 'reset')}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-[#0B2545]"
          >
            <KeyRound className="h-3 w-3" />
            <span>{mode === 'reset' ? 'Volver al login' : 'Olvidé mi contraseña'}</span>
          </button>
        )}
      </div>
    </form>
  );
}
