import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, KeyRound, Loader2, LogOut, Mail, ShieldCheck } from 'lucide-react';
import type { CoramAuthState } from '../app/useSupabaseAuth';
import { humanizeAuthError } from '../domain/auth/authErrors';

interface AuthPanelProps {
  auth: CoramAuthState;
  compact?: boolean;
  initialMode?: AuthMode;
}

type AuthMode = 'signin' | 'signup' | 'reset';

export function AuthPanel({ auth, compact = false, initialMode = 'signin' }: AuthPanelProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(initialMode);
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
        setMessage('Contrasena actualizada. Ya puedes continuar con tu sesion.');
      } else if (mode === 'signin') {
        await auth.signInWithEmail(email, password);
        setMessage('Sesion iniciada correctamente.');
      } else if (mode === 'signup') {
        await auth.signUpWithEmail(email, password, fullName);
        setMessage('Cuenta creada. Revisa tu correo si Supabase solicita confirmacion.');
      } else {
        await auth.sendPasswordReset(email);
        setMessage('Te enviamos un enlace para recuperar tu contrasena.');
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

  const startAppleSignIn = async () => {
    setWorking(true);
    setError('');
    setMessage('');

    try {
      await auth.signInWithApple();
    } catch (caughtError) {
      setError(humanizeAuthError(caughtError));
    } finally {
      setWorking(false);
    }
  };

  const closeSession = async () => {
    await auth.signOut();
    navigate('/login', { replace: true });
  };

  if (auth.loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Validando sesion...</span>
      </div>
    );
  }

  if (auth.user) {
    return (
      <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="min-w-0 text-right leading-tight">
          <span className="block text-[10px] font-black uppercase tracking-wider text-[#0B2545]">
            {auth.isAdmin ? 'Administrador' : 'Miembro'}
          </span>
          <span className="block max-w-[180px] truncate text-[11px] font-semibold text-slate-500">
            {auth.profile?.email ?? auth.user.email}
          </span>
        </div>
        {auth.isAdmin && <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />}
        <button
          type="button"
          onClick={() => void closeSession()}
          className="rounded-xl bg-slate-50 p-2 text-slate-500 transition active:scale-95"
          title="Cerrar sesion"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const modeLabel = auth.recoveryMode
    ? 'Nueva contrasena'
    : mode === 'signin'
      ? 'Acceso CorAM'
      : mode === 'signup'
        ? 'Crear cuenta'
        : 'Recuperar acceso';

  return (
    <form
      onSubmit={submit}
      className={`w-full rounded-[1.4rem] border border-slate-200 bg-white shadow-lg shadow-slate-950/6 ${
        compact ? 'max-w-md p-3' : 'mx-auto max-w-md p-4 sm:p-5'
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#B5811F]">{modeLabel}</span>
        {!auth.recoveryMode && (
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="rounded-full bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-black text-[#8A5B12] transition active:scale-95"
          >
            {mode === 'signin' ? 'Registrarme' : 'Ingresar'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {!auth.recoveryMode && mode !== 'reset' && (
          <button
            type="button"
            disabled={working}
            onClick={() => void startGoogleSignIn()}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 shadow-sm transition active:scale-[0.99] disabled:cursor-wait disabled:text-slate-400"
          >
            {working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5 text-[#C29031]" />}
            <span>Continuar con Google</span>
          </button>
        )}

        {auth.appleOAuthEnabled && !auth.recoveryMode && mode !== 'reset' && (
          <button
            type="button"
            disabled={working}
            onClick={() => void startAppleSignIn()}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B2545] px-3 py-3 text-xs font-black text-white transition active:scale-[0.99] disabled:cursor-wait disabled:bg-slate-400"
          >
            {working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />}
            <span>Continuar con Apple</span>
          </button>
        )}

        {mode === 'signup' && !auth.recoveryMode && (
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nombre"
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#0B2545] outline-none transition focus:border-[#C29031] focus:ring-4 focus:ring-[#D4AF37]/15"
          />
        )}

        {!auth.recoveryMode && (
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@dominio.com"
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#0B2545] outline-none transition focus:border-[#C29031] focus:ring-4 focus:ring-[#D4AF37]/15"
          />
        )}

        {mode !== 'reset' || auth.recoveryMode ? (
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={auth.recoveryMode ? 'Nueva contrasena' : 'Contrasena'}
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#0B2545] outline-none transition focus:border-[#C29031] focus:ring-4 focus:ring-[#D4AF37]/15"
          />
        ) : null}

        {error && (
          <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            <Check className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={working}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B2545] px-3 py-3 text-xs font-black uppercase tracking-wider text-white transition active:scale-[0.99] disabled:cursor-wait disabled:bg-slate-400"
        >
          {working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
          <span>{auth.recoveryMode ? 'Actualizar' : mode === 'reset' ? 'Enviar' : mode === 'signup' ? 'Crear cuenta' : 'Entrar'}</span>
        </button>

        {!auth.recoveryMode && (
          <button
            type="button"
            onClick={() => setMode(mode === 'reset' ? 'signin' : 'reset')}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-[#0B2545] active:scale-95"
          >
            <KeyRound className="h-3 w-3" />
            <span>{mode === 'reset' ? 'Volver al login' : 'Olvide mi contrasena'}</span>
          </button>
        )}
      </div>
    </form>
  );
}
