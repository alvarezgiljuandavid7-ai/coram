import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileAudio,
  FileText,
  Loader2,
  Search,
  Star,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { Link, NavLink, useNavigate, type LinkProps } from 'react-router-dom';
import type { Key, ReactNode } from 'react';
import type { Course, Resource } from '../../types';

const softEase = [0.23, 1, 0.32, 1] as const;

export function PremiumScreen({ children }: { children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: softEase }}
      className="mx-auto w-full max-w-7xl space-y-5 pb-24 md:space-y-7 md:pb-0"
    >
      {children}
    </motion.section>
  );
}

export function MobileAppShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[520px] space-y-5 pb-24 md:hidden">{children}</div>;
}

export function DesktopAppShell({ children }: { children: ReactNode }) {
  return <div className="hidden w-full max-w-7xl space-y-7 md:block">{children}</div>;
}

interface BrandedIconProps {
  icon: LucideIcon;
  tone?: 'gold' | 'navy' | 'violet' | 'emerald';
  className?: string;
}

export function BrandedIcon({ icon: Icon, tone = 'gold', className = '' }: BrandedIconProps) {
  const tones = {
    gold: 'from-[#D4AF37] to-[#8A5B12] text-white shadow-[#D4AF37]/25',
    navy: 'from-[#0B2545] to-[#020817] text-[#D4AF37] shadow-slate-950/25',
    violet: 'from-violet-700 to-[#0B2545] text-white shadow-violet-900/20',
    emerald: 'from-emerald-600 to-[#0B2545] text-white shadow-emerald-900/20',
  };

  return (
    <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br shadow-lg ${tones[tone]} ${className}`}>
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.35),transparent_34%)]" />
      <Icon className="relative h-5 w-5" />
    </span>
  );
}

interface AppHeroProps {
  eyebrow: string;
  title: ReactNode;
  body: string;
  cta?: { label: string; to: string };
  children?: ReactNode;
}

export function AppHero({ eyebrow, title, body, cta, children }: AppHeroProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.995 }}
      className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#071426] px-5 py-5 text-white shadow-2xl shadow-[#0B2545]/20 md:px-8 md:py-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(212,175,55,0.34),transparent_28%),linear-gradient(135deg,rgba(4,14,28,0.98),rgba(11,37,69,0.92))]" />
      <div className="absolute right-[-70px] top-5 h-44 w-64 rotate-[-16deg] rounded-full border border-[#D4AF37]/20" />
      <div className="absolute bottom-3 right-0 h-24 w-2/3 bg-[repeating-linear-gradient(0deg,transparent_0_14px,rgba(212,175,55,0.16)_14px_15px)] opacity-70" />
      <div className="absolute bottom-0 right-0 h-32 w-2/3 bg-[linear-gradient(120deg,transparent_20%,rgba(212,175,55,0.13)_21%,transparent_24%,transparent_42%,rgba(212,175,55,0.14)_43%,transparent_46%)]" />
      <div className="relative z-10 max-w-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">{eyebrow}</p>
        <h1 className="mt-3 text-[clamp(1.9rem,9vw,3.5rem)] font-black leading-[1.02] tracking-tight">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200 md:text-base">{body}</p>
        {cta && (
          <Link
            to={cta.to}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B5811F] px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-[#D4AF37]/25 transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children && <div className="relative z-10 mt-5">{children}</div>}
    </motion.div>
  );
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#B5811F]">{eyebrow}</p>}
        <h2 className="mt-1 text-[clamp(1.2rem,5vw,1.75rem)] font-black tracking-tight text-[#0B2545]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

interface PremiumCardProps {
  key?: Key;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}

export function PremiumCard({ children, className = '', dark = false }: PremiumCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18, ease: softEase }}
      className={`relative overflow-hidden rounded-[1.4rem] border p-4 shadow-lg ${
        dark
          ? 'border-white/10 bg-[#071426] text-white shadow-[#0B2545]/18'
          : 'border-slate-200/80 bg-[oklch(99%_0.004_90)] text-slate-900 shadow-slate-950/6'
      } ${className}`}
    >
      {dark && <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(212,175,55,0.18),transparent_35%)]" />}
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export function PremiumLinkCard({ to, children, className = '', dark = false, ...props }: LinkProps & { dark?: boolean }) {
  return (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.985 }} transition={{ duration: 0.18, ease: softEase }}>
      <Link
        to={to}
        className={`relative block min-h-32 overflow-hidden rounded-[1.4rem] border p-4 shadow-lg transition ${
          dark
            ? 'border-white/10 bg-[#071426] text-white shadow-[#0B2545]/18'
            : 'border-slate-200/80 bg-[oklch(99%_0.004_90)] text-slate-900 shadow-slate-950/6'
        } ${className}`}
        {...props}
      >
        {dark && <span className="absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(212,175,55,0.18),transparent_35%)]" />}
        <span className="relative block">{children}</span>
      </Link>
    </motion.div>
  );
}

interface PremiumNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export function PremiumBottomNav({ items }: { items: PremiumNavItem[] }) {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[1.6rem] border border-white/15 bg-[#061326]/94 px-2 py-2 shadow-2xl shadow-slate-950/35 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app/inicio'}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-black transition active:scale-95 ${
                  isActive ? 'bg-[#D4AF37] text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function PremiumSidebar({ children, open }: { children: ReactNode; open: boolean }) {
  return (
    <motion.aside
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: softEase }}
      className={`fixed inset-y-0 left-0 z-50 w-72 overflow-hidden border-r border-white/10 bg-[#061326] px-4 py-5 text-white shadow-2xl shadow-slate-950/30 transition-transform lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.2),transparent_28%),linear-gradient(180deg,rgba(2,8,23,0),rgba(2,8,23,0.55))]" />
      <div className="relative">{children}</div>
    </motion.aside>
  );
}

export function PremiumTopBar({
  children,
  immersive = false,
  className = '',
}: {
  children: ReactNode;
  immersive?: boolean;
  className?: string;
}) {
  return (
    <header className={`${immersive ? 'hidden' : ''} sticky top-0 z-30 border-b border-slate-200/70 bg-[oklch(99%_0.004_90)]/88 px-3 backdrop-blur-xl md:px-6 ${className}`}>
      {children}
    </header>
  );
}

export function ToolCard({
  to,
  title,
  detail,
  accent,
  icon,
}: {
  key?: Key;
  to: string;
  title: string;
  detail: string;
  accent: string;
  icon: LucideIcon;
}) {
  return (
    <PremiumLinkCard to={to} dark className="group min-h-56 p-5">
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(120deg,transparent_10%,rgba(212,175,55,0.18)_50%,transparent_90%)] opacity-80" />
      <div className="absolute right-4 top-5 h-20 w-32 rounded-full border border-[#D4AF37]/20" />
      <div className="flex items-start justify-between gap-4">
        <BrandedIcon icon={icon} tone="gold" className="h-14 w-14" />
        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">
          Abrir
        </span>
      </div>
      <p className="mt-8 text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">{accent}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
      <div className="mt-5 flex items-center gap-2 text-sm font-black text-[#D4AF37]">
        Entrar
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </PremiumLinkCard>
  );
}

export function CourseCard({
  course,
  enrolled,
  onDetails,
  onToggle,
}: {
  key?: Key;
  course: Course;
  enrolled: boolean;
  onDetails: () => void;
  onToggle: () => void;
}) {
  return (
    <PremiumCard dark className="p-0">
      <div className="relative min-h-44 overflow-hidden">
        {course.imageUrl ? (
          <img src={course.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.26),transparent_32%),linear-gradient(135deg,#071426,#0B2545)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071426] via-[#071426]/55 to-transparent" />
        <div className="relative flex min-h-44 flex-col justify-end p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">{course.instructor}</p>
          <h3 className="mt-2 text-xl font-black leading-tight text-white">{course.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="line-clamp-3 text-sm leading-6 text-slate-300">{course.description || 'Curso disponible para la academia CorAM.'}</p>
        <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
            {course.rating}
          </span>
          <span>{course.duration}</span>
          <span>Gratis</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onDetails} className="min-h-11 rounded-2xl border border-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/10 active:scale-[0.99]">
            Ver detalles
          </button>
          <button type="button" onClick={onToggle} className="min-h-11 rounded-2xl bg-[#D4AF37] px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-[#e5c452] active:scale-[0.99]">
            {enrolled ? 'Inscrito' : 'Inscribirme'}
          </button>
        </div>
      </div>
    </PremiumCard>
  );
}

export function ResourceCard({ resource }: { key?: Key; resource: Resource }) {
  const Icon = getResourceIcon(resource.category);

  return (
    <PremiumCard dark className="min-h-52 p-5">
      <div className="absolute bottom-0 right-0 h-24 w-40 bg-[linear-gradient(120deg,transparent,rgba(212,175,55,0.16),transparent)]" />
      <div className="flex items-start justify-between gap-3">
        <BrandedIcon icon={Icon} tone="gold" />
        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">
          {resource.fileSize}
        </span>
      </div>
      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">{resource.category}</p>
      <h3 className="mt-2 text-xl font-black leading-tight text-white">{resource.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{resource.description}</p>
      <div className="mt-5 flex items-center justify-between text-xs font-bold text-slate-400">
        <span>{resource.downloadsCount} descargas</span>
        <span className="inline-flex items-center gap-1 text-[#D4AF37]">
          <Download className="h-4 w-4" />
          Abrir
        </span>
      </div>
    </PremiumCard>
  );
}

function getResourceIcon(category: Resource['category']) {
  if (category === 'Pistas / Audio') return FileAudio;
  if (category === 'Partituras') return Video;
  return FileText;
}

export function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <PremiumCard className="p-3.5">
      <div className="flex items-center gap-3">
        <BrandedIcon icon={Icon} tone="navy" className="h-11 w-11" />
        <div className="min-w-0">
          <p className="text-2xl font-black tracking-tight text-[#0B2545]">{value}</p>
          <p className="text-xs font-black text-slate-900">{label}</p>
          <p className="truncate text-[11px] font-semibold text-slate-500">{detail}</p>
        </div>
      </div>
    </PremiumCard>
  );
}

export function EmptyStatePremium({ title, body, icon: Icon }: { title: string; body: string; icon: LucideIcon }) {
  return (
    <PremiumCard dark className="p-5">
      <BrandedIcon icon={Icon} tone="gold" />
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </PremiumCard>
  );
}

export function LoadingStatePremium({ label = 'Cargando contenido...' }: { label?: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-[1.4rem] border border-slate-200 bg-white/70 text-sm font-bold text-[#0B2545]">
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#B5811F]" />
      {label}
    </div>
  );
}

export function SearchInputPremium({
  value,
  onChange,
  placeholder = 'Buscar...',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 shadow-sm focus-within:border-[#D4AF37]">
      <Search className="h-4 w-4 shrink-0 text-[#B5811F]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[#0B2545] outline-none placeholder:text-slate-400"
      />
    </label>
  );
}

export function BackButton({
  fallbackTo,
  label = 'Volver',
  onBeforeNavigate,
}: {
  fallbackTo: string;
  label?: string;
  onBeforeNavigate?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        onBeforeNavigate?.();
        if (window.history.length > 1) {
          navigate(-1);
          return;
        }
        navigate(fallbackTo, { replace: true });
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#0B2545] shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
