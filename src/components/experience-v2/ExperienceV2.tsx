import type { ElementType, Key, ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './ExperienceV2.module.css';

export function ExperienceCanvas({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.canvas} ${className}`}><main className="mx-auto max-w-7xl space-y-7 px-5 pb-10 pt-7 sm:px-7 md:space-y-9 md:px-10 lg:px-12">{children}</main></div>;
}

export function EditorialHeading({ eyebrow, title, body, icon: Icon }: { eyebrow: string; title: string; body: string; icon?: ElementType }) {
  return <section className="relative min-h-44 overflow-hidden py-4 md:min-h-48 md:py-7"><div className="relative z-10 max-w-2xl"><p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#a56b09]">{eyebrow}</p><h1 className="mt-2 font-serif text-[clamp(3rem,9vw,5.5rem)] leading-[0.9] tracking-tight text-[#0B2545]">{title}</h1><span className="mt-5 block h-1 w-10 rounded-full bg-[#f6bb18]" /><p className="mt-4 max-w-lg text-[clamp(1rem,2.6vw,1.15rem)] leading-7 text-[#3f4b5f]">{body}</p></div>{Icon && <Icon aria-hidden="true" className="absolute bottom-5 right-[7%] hidden h-24 w-24 stroke-[1.1] text-[#b5811f]/25 sm:block" />}</section>;
}

export function EditorialHero({ badge, title, body, icon: Icon, action, children, imageUrl }: { badge: string; title: string; body: string; icon: ElementType; action?: { label: string; to: string }; children?: ReactNode; imageUrl?: string }) {
  return <section className={`${styles.hero} ${styles.editorialCard} relative min-h-72 overflow-hidden rounded-[1.7rem] border border-white/80 p-6 sm:p-8 md:p-10`}>
    {imageUrl && <img src={imageUrl} alt="" className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-25 md:w-[55%]" />}
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,253,248,0.96),rgba(255,253,248,0.72)_58%,rgba(11,37,69,0.08))]" />
    <div className="relative z-10 max-w-xl"><span className="inline-flex items-center gap-2 rounded-full bg-[#e5f0df] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#3d7146]"><Icon className="h-4 w-4" />{badge}</span><h2 className="mt-5 max-w-lg font-serif text-[clamp(2.1rem,6vw,3.65rem)] leading-[0.96] text-[#17305a]">{title}</h2><p className="mt-4 max-w-md text-base leading-7 text-[#46546a]">{body}</p>{action && <Link to={action.to} className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#4a8a55] px-5 text-sm font-bold text-white shadow-lg shadow-[#4a8a55]/20 transition active:scale-[0.98]">{action.label}</Link>}{children}</div>
  </section>;
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#a56b09]">{eyebrow}</p><h2 className="mt-1 font-serif text-[clamp(1.8rem,5vw,2.65rem)] leading-none text-[#0B2545]">{title}</h2></div>{action}</div>;
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="flex min-h-14 items-center gap-3 rounded-[1.35rem] border border-[#0B2545]/10 bg-white px-5 shadow-[0_7px_22px_rgba(24,45,71,0.07)] focus-within:border-[#4a8a55] focus-within:ring-4 focus-within:ring-[#4a8a55]/10"><Search className="h-5 w-5 shrink-0" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400" /></div>;
}

export function FilterChip({ active, label, icon: Icon, onClick }: { key?: Key; active: boolean; label: string; icon?: ElementType; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold outline-none transition focus-visible:ring-4 focus-visible:ring-[#4a8a55]/20 active:scale-95 ${active ? 'bg-[#4a8a55] text-white shadow-md shadow-[#4a8a55]/20' : 'border border-[#0B2545]/9 bg-white text-[#233653]'}`}>{Icon && <Icon className="h-4 w-4" />}{label}</button>;
}

export function MetricTile({ label, value, detail, icon: Icon, tone = 'green' }: { label: string; value: string | number; detail: string; icon: ElementType; tone?: 'green' | 'gold' | 'lilac' | 'sky' }) {
  const tones = { green: 'from-[#edf3e8] to-[#f8faf3] text-[#4a8a55]', gold: 'from-[#fff2d7] to-[#fffaf0] text-[#bb7c12]', lilac: 'from-[#f2ecf9] to-[#fbf8ff] text-[#9063aa]', sky: 'from-[#e9f5f6] to-[#f8fcfc] text-[#3b7e86]' };
  return <div className={`${styles.editorialCard} flex min-w-0 items-center gap-3 rounded-[1.35rem] border border-white bg-gradient-to-br p-4 ${tones[tone]}`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/85 shadow-sm"><Icon className="h-5 w-5" /></span><div className="min-w-0"><p className="text-2xl font-black leading-none text-[#0B2545]">{value}</p><p className="mt-1 text-sm font-bold text-[#0B2545]">{label}</p><p className="truncate text-xs text-[#596576]">{detail}</p></div></div>;
}

export function EditorialCard({ children, className = '', interactive = false }: { key?: Key; children: ReactNode; className?: string; interactive?: boolean }) {
  return <div className={`${styles.editorialCard} ${interactive ? styles.interactive : ''} rounded-[1.5rem] border border-[#0B2545]/8 bg-white ${className}`}>{children}</div>;
}

export function StatePanel({ icon: Icon, title, body, tone = 'neutral' }: { icon: ElementType; title: string; body: string; tone?: 'neutral' | 'error' | 'loading' }) {
  const colors = tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-900' : tone === 'loading' ? 'border-sky-200 bg-sky-50 text-[#0B2545]' : 'border-[#0B2545]/8 bg-white text-[#0B2545]';
  return <div className={`rounded-[1.5rem] border p-6 text-center shadow-[0_12px_30px_rgba(18,42,68,0.07)] ${colors}`}><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#edf3e8] text-[#4a8a55]"><Icon className="h-6 w-6" /></span><h3 className="mt-4 font-serif text-2xl">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 opacity-70">{body}</p></div>;
}
