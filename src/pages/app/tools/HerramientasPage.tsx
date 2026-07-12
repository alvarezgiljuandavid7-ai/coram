import { Activity, ArrowRight, Clock3, Mic2, Music2, Piano, Sparkles, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCoramApp } from '../../../app/CoramAppContext';
import { EditorialCard, EditorialHeading, EditorialHero, ExperienceCanvas, MetricTile, SectionHeading } from '../../../components/experience-v2/ExperienceV2';

const tools = [
  { title: 'Afinador vocal', detail: 'Escucha tu voz, identifica la nota y corrige la desviación en tiempo real.', to: '/app/herramientas/afinador', icon: Mic2, tone: 'from-[#e8f2e4] to-[#f8fbf6]', label: 'Precisión vocal' },
  { title: 'Piano y acordes', detail: 'Toca notas y acordes de referencia con un teclado responsive.', to: '/app/herramientas/piano', icon: Piano, tone: 'from-[#fff1d3] to-[#fffaf0]', label: 'Oído musical' },
  { title: 'Calentamiento', detail: 'Respiración 4-4-8 y escalas guiadas según tu registro vocal.', to: '/app/herramientas/calentamiento', icon: Wind, tone: 'from-[#ece8f5] to-[#fbf9ff]', label: 'Voz saludable' },
];

export function HerramientasPage() {
  const { recentActivity } = useCoramApp();
  const toolActivity = recentActivity.filter((item) => item.entityType === 'tool');
  return <ExperienceCanvas>
    <EditorialHeading eyebrow="Laboratorio musical" title="Herramientas" body="Entrena la voz, el oído y la respiración con una suite creada para servir con seguridad." icon={Activity} />
    <EditorialHero badge="Suite vocal activa" title="Prepárate antes de cantar" body="Afinación, piano y calentamiento reunidos en un flujo claro para ensayo, clase o servicio." icon={Sparkles} action={{ label: 'Comenzar con afinador', to: '/app/herramientas/afinador' }} imageUrl="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1500&q=82" />
    <section className="grid gap-3 sm:grid-cols-3"><MetricTile label="Herramientas" value="3" detail="Disponibles" icon={Music2} /><MetricTile label="Actividad" value={toolActivity.length} detail="Usos recientes" icon={Clock3} tone="gold" /><MetricTile label="Acceso" value="Libre" detail="Sin pagos" icon={Sparkles} tone="lilac" /></section>
    <section className="space-y-4"><SectionHeading eyebrow="Entrenamiento" title="Elige tu práctica" /><div className="grid gap-4 lg:grid-cols-3">{tools.map((tool) => <Link key={tool.to} to={tool.to} className="group outline-none focus-visible:ring-4 focus-visible:ring-[#4a8a55]/20"><EditorialCard interactive className={`h-full overflow-hidden bg-gradient-to-br p-5 ${tool.tone}`}><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0B2545] text-[#e8bd59] shadow-lg"><tool.icon className="h-6 w-6" /></span><p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#a56b09]">{tool.label}</p><h2 className="mt-2 font-serif text-3xl leading-none">{tool.title}</h2><p className="mt-3 min-h-14 text-sm leading-6 text-[#536074]">{tool.detail}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#3d7146]">Abrir herramienta <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></EditorialCard></Link>)}</div></section>
  </ExperienceCanvas>;
}
