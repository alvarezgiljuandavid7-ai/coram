import { Activity, ArrowRight, Clock3, Mic2, Sparkles, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCoramApp } from '../../../app/CoramAppContext';
import { EditorialCard, ExperienceCanvas, SectionHeading } from '../../../components/experience-v2/ExperienceV2';

const tools = [
  { title: 'Afinador vocal', detail: 'Escucha tu voz, identifica la nota y corrige la desviación en tiempo real.', to: '/app/herramientas/afinador', icon: Mic2, tone: 'from-[#e8f2e4] to-[#f8fbf6]', label: 'Precisión vocal' },
  { title: 'Calentamiento', detail: 'Respiración 4-4-8 y escalas guiadas según tu registro vocal.', to: '/app/herramientas/calentamiento', icon: Wind, tone: 'from-[#ece8f5] to-[#fbf9ff]', label: 'Voz saludable' },
];

function ToolMetric({ icon: Icon, value, label, tone = 'green' }: { icon: typeof Activity; value: string | number; label: string; tone?: 'green' | 'gold' | 'lilac' }) {
  const toneClass = tone === 'gold' ? 'bg-[#fff5df] text-[#ae7918]' : tone === 'lilac' ? 'bg-[#f4effa] text-[#8057a0]' : 'bg-[#edf6ea] text-[#4a8a55]';
  return <div className="min-w-0 rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_10px_24px_rgba(11,37,69,0.06)]">
    <span className={`grid h-8 w-8 place-items-center rounded-xl ${toneClass}`}><Icon className="h-4 w-4" /></span>
    <p className="mt-2 truncate text-xl font-black leading-none text-[#0B2545]">{value}</p>
    <p className="mt-1 text-[11px] font-bold text-[#596576]">{label}</p>
  </div>;
}

export function HerramientasPage() {
  const { recentActivity } = useCoramApp();
  const toolActivity = recentActivity.filter((item) => item.entityType === 'tool');
  return <ExperienceCanvas>
    <section className="grid gap-4 py-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#a56b09]">Laboratorio musical</p><h1 className="mt-2 font-serif text-[clamp(2.35rem,10vw,4.4rem)] leading-[0.92] text-[#0B2545]">Herramientas</h1><div className="mt-4 h-1 w-12 rounded-full bg-[#f6bb18]" /><p className="mt-4 max-w-xl text-sm leading-6 text-[#596576] sm:text-base">Entrena la voz y la respiración con una práctica clara para ensayo, clase o servicio.</p></div>
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#edf6ea] text-[#4a8a55] shadow-sm"><Activity className="h-5 w-5" /></span>
    </section>
    <EditorialCard className="overflow-hidden bg-[linear-gradient(120deg,#edf6ea_0%,#fffdf8_62%,#f4efe1_100%)] p-5 sm:p-7">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3d7146]"><Sparkles className="mr-1 inline h-3.5 w-3.5" /> Suite vocal activa</p><h2 className="mt-3 max-w-xl font-serif text-[clamp(1.85rem,7vw,3.2rem)] leading-[0.95] text-[#0B2545]">Prepárate antes de cantar</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#596576]">Afinación y calentamiento reunidos en un flujo claro para comenzar con seguridad.</p><Link to="/app/herramientas/afinador" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2563eb] px-4 text-sm font-black text-white shadow-[0_10px_20px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#2563eb]/25">Comenzar con afinador <ArrowRight className="h-4 w-4" /></Link>
    </EditorialCard>
    <section className="grid grid-cols-3 gap-2 sm:gap-3"><ToolMetric icon={Mic2} value={tools.length} label="Herramientas" /><ToolMetric icon={Clock3} value={toolActivity.length} label="Usos recientes" tone="gold" /><ToolMetric icon={Sparkles} value="Libre" label="Sin pagos" tone="lilac" /></section>
    <section className="space-y-3"><SectionHeading eyebrow="Entrenamiento" title="Elige tu práctica" /><div className="grid gap-3 lg:grid-cols-2">{tools.map((tool) => <Link key={tool.to} to={tool.to} className="group outline-none focus-visible:ring-4 focus-visible:ring-[#4a8a55]/20"><EditorialCard interactive className={`h-full overflow-hidden bg-gradient-to-br p-4 sm:p-5 ${tool.tone}`}><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0B2545] text-[#e8bd59] shadow-md"><tool.icon className="h-5 w-5" /></span><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#a56b09]">{tool.label}</p><h2 className="mt-1 font-serif text-[1.7rem] leading-none text-[#0B2545]">{tool.title}</h2><p className="mt-2 text-[13px] leading-5 text-[#536074]">{tool.detail}</p><span className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[#3d7146]">Abrir herramienta <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div></div></EditorialCard></Link>)}</div></section>
  </ExperienceCanvas>;
}
