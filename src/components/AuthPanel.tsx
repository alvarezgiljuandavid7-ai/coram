import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const passwordAutocomplete = auth.recoveryMode || mode === 'signup' ? 'new-password' : 'current-password';

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
    setMessage('Redirigiendo a Google...');

    try {
      await auth.signInWithGoogle();
    } catch (caughtError) {
      setError(humanizeAuthError(caughtError));
      setMessage('');
    } finally {
      setWorking(false);
    }
  };

  const startAppleSignIn = async () => {
    setWorking(true);
    setError('');
    setMessage('Redirigiendo a Apple...');

    try {
      await auth.signInWithApple();
    } catch (caughtError) {
      setError(humanizeAuthError(caughtError));
      setMessage('');
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
      <div className="flex min-h-36 items-center justify-center gap-3 rounded-[1.5rem] border border-[#0B2545]/8 bg-white px-5 text-sm font-bold text-[#46546a] shadow-[0_14px_34px_rgba(24,45,71,0.07)]" role="status" aria-live="polite">
        <Loader2 className="h-5 w-5 animate-spin text-[#4a8a55]" />
        <span>Validando sesion...</span>
      </div>
    );
  }

  if (auth.user) {
    return (
      <div className={`rounded-[1.5rem] border border-[#0B2545]/8 bg-white p-4 shadow-[0_14px_34px_rgba(24,45,71,0.07)] ${compact ? '' : 'mx-auto max-w-md'}`}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e5f0df] text-[#4a8a55]"><ShieldCheck className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a56b09]">{auth.isAdmin ? 'Administrador' : 'Sesion activa'}</p>
            <p className="mt-1 truncate text-sm font-bold text-[#17305a]">{auth.profile?.email ?? auth.user.email}</p>
          </div>
          <button type="button" onClick={() => void closeSession()} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 transition active:scale-95" aria-label="Cerrar sesion" title="Cerrar sesion">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const modeLabel = auth.recoveryMode
    ? 'Nueva contrasena'
    : mode === 'signin'
      ? 'Bienvenido de nuevo'
      : mode === 'signup'
        ? 'Crea tu cuenta'
        : 'Recupera tu acceso';
  const modeDescription = auth.recoveryMode
    ? 'Elige una contrasena nueva para volver a entrar.'
    : mode === 'signin'
      ? 'Entra para continuar con tu ministerio.'
      : mode === 'signup'
        ? 'Tu cuenta te dara acceso a la biblioteca y herramientas.'
        : 'Te enviaremos un enlace seguro a tu correo.';

  return (
    <form onSubmit={submit} className={`w-full rounded-[1.65rem] border border-white bg-white/95 p-5 shadow-[0_18px_40px_rgba(24,45,71,0.09)] sm:p-7 ${compact ? 'max-w-md' : 'mx-auto max-w-md'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#a56b09]">Acceso CorAM</p>
          <h2 className="mt-2 font-serif text-[clamp(2rem,5vw,2.6rem)] leading-none text-[#17305a]">{modeLabel}</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#596576]">{modeDescription}</p>
        </div>
        {!auth.recoveryMode && mode !== 'reset' && (
          <button type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="min-h-11 shrink-0 rounded-full border border-[#0B2545]/10 bg-[#fffaf0] px-3 text-xs font-bold text-[#3d7146] transition hover:bg-[#e5f0df] active:scale-95">
            {mode === 'signin' ? 'Registrarme' : 'Ingresar'}
          </button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {!auth.recoveryMode && mode !== 'reset' && (
          <button type="button" disabled={working} onClick={() => void startGoogleSignIn()} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[#0B2545]/10 bg-white px-4 text-sm font-bold text-[#17305a] shadow-sm transition hover:bg-[#fffaf0] active:scale-[0.985] disabled:cursor-wait disabled:opacity-60">
            {working ? <Loader2 className="h-4 w-4 animate-spin text-[#4a8a55]" /> : <span className="grid h-5 w-5 place-items-center rounded-full bg-[#fff0d1] text-[11px] font-black text-[#a56b09]">G</span>}
            <span>Continuar con Google</span>
          </button>
        )}

        {auth.appleOAuthEnabled && !auth.recoveryMode && mode !== 'reset' && (
          <button type="button" disabled={working} onClick={() => void startAppleSignIn()} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-[#17305a] px-4 text-sm font-bold text-white transition hover:bg-[#0B2545] active:scale-[0.985] disabled:cursor-wait disabled:opacity-60">
            {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 text-[#f6bb18]" />}
            <span>Continuar con Apple</span>
          </button>
        )}

        {!auth.recoveryMode && mode !== 'reset' && <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400"><span className="h-px flex-1 bg-[#0B2545]/8" />o con tu correo<span className="h-px flex-1 bg-[#0B2545]/8" /></div>}

        {mode === 'signup' && !auth.recoveryMode && (
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#33435a]">Nombre</span>
            <span className="relative block"><UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a8a55]" /><input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Tu nombre" autoComplete="name" className="min-h-12 w-full rounded-2xl border border-[#0B2545]/10 bg-[#fffdf8] py-3 pl-11 pr-4 text-sm font-semibold text-[#17305a] outline-none transition placeholder:text-slate-400 focus:border-[#4a8a55] focus:ring-4 focus:ring-[#4a8a55]/10" /></span>
          </label>
        )}

        {!auth.recoveryMode && (
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#33435a]">Correo electronico</span>
            <span className="relative block"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a8a55]" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@dominio.com" autoComplete="email" className="min-h-12 w-full rounded-2xl border border-[#0B2545]/10 bg-[#fffdf8] py-3 pl-11 pr-4 text-sm font-semibold text-[#17305a] outline-none transition placeholder:text-slate-400 focus:border-[#4a8a55] focus:ring-4 focus:ring-[#4a8a55]/10" /></span>
          </label>
        )}

        {mode !== 'reset' || auth.recoveryMode ? (
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[#33435a]">{auth.recoveryMode ? 'Nueva contrasena' : 'Contrasena'}</span>
            <span className="relative block"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a8a55]" /><input type={passwordVisible ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={auth.recoveryMode ? 'Nueva contrasena' : 'Contrasena'} autoComplete={passwordAutocomplete} className="min-h-12 w-full rounded-2xl border border-[#0B2545]/10 bg-[#fffdf8] py-3 pl-11 pr-12 text-sm font-semibold text-[#17305a] outline-none transition placeholder:text-slate-400 focus:border-[#4a8a55] focus:ring-4 focus:ring-[#4a8a55]/10" /><button type="button" onClick={() => setPasswordVisible((visible) => !visible)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-[#596576] transition hover:bg-[#edf3e8] hover:text-[#3d7146]" aria-label={passwordVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'}>{passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
          </label>
        ) : null}

        <div className="min-h-0" aria-live="polite" aria-atomic="true">
          {error && <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
          {message && <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-[#edf7ed] px-4 py-3 text-sm font-semibold leading-6 text-[#266234]"><Check className="mt-0.5 h-4 w-4 shrink-0" /><span>{message}</span></div>}
        </div>

        <button type="submit" disabled={working} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#4a8a55] px-4 text-sm font-bold text-white shadow-lg shadow-[#4a8a55]/20 transition hover:bg-[#3d7146] active:scale-[0.985] disabled:cursor-wait disabled:opacity-60">
          {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          <span>{auth.recoveryMode ? 'Actualizar contrasena' : mode === 'reset' ? 'Enviar enlace' : mode === 'signup' ? 'Crear cuenta' : 'Entrar a CorAM'}</span>
        </button>

        {!auth.recoveryMode && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm font-bold">
            <button type="button" onClick={() => setMode(mode === 'reset' ? 'signin' : 'reset')} className="inline-flex min-h-11 items-center gap-2 text-[#596576] transition hover:text-[#3d7146] active:scale-[0.98]"><KeyRound className="h-4 w-4" /><span>{mode === 'reset' ? 'Volver a ingresar' : 'Olvide mi contrasena'}</span></button>
            {mode !== 'reset' && <Link to={mode === 'signin' ? '/register' : '/login'} className="inline-flex min-h-11 items-center text-[#3d7146] underline decoration-[#d7a934] decoration-2 underline-offset-4">{mode === 'signin' ? 'Crear cuenta' : 'Ya tengo cuenta'}</Link>}
          </div>
        )}
      </div>
    </form>
  );
}
