import { Activity, Mic2, Music2, Piano, Radio, Wind } from 'lucide-react';
import {
  AppHero,
  PremiumScreen,
  SectionHeader,
  ToolCard,
} from '../../../components/app-premium/PremiumApp';

const tools = [
  {
    title: 'Afinador vocal',
    detail: 'Activa el microfono y compara tu voz contra la nota objetivo con lectura en tiempo real.',
    to: '/app/herramientas/afinador',
    icon: Mic2,
    accent: 'Microfono · precision vocal',
  },
  {
    title: 'Piano / teclado',
    detail: 'Escucha notas y acordes de referencia con un teclado listo para ensayar y estudiar.',
    to: '/app/herramientas/piano',
    icon: Piano,
    accent: 'Teclado · acordes',
  },
  {
    title: 'Calentamiento vocal',
    detail: 'Prepara respiracion, registro y escalas antes de ministrar o grabar.',
    to: '/app/herramientas/calentamiento',
    icon: Wind,
    accent: 'Rutina · voz sana',
  },
];

export function HerramientasPage() {
  return (
    <PremiumScreen>
      <AppHero
        eyebrow="Suite musical"
        title={
          <>
            Herramientas para <span className="text-[#D4AF37]">afinar tu llamado.</span>
          </>
        }
        body="Afinador, piano y calentamiento vocal viven aqui como una suite profesional para voces y ministerios."
      >
        <div className="grid grid-cols-3 gap-2">
          <MiniSignal icon={Mic2} label="Voz" />
          <MiniSignal icon={Music2} label="Notas" />
          <MiniSignal icon={Activity} label="Ritmo" />
        </div>
      </AppHero>

      <section className="space-y-3">
        <SectionHeader eyebrow="Entrenamiento" title="Elige tu herramienta" />
        <div className="grid gap-4 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.to} {...tool} />
          ))}
        </div>
      </section>
    </PremiumScreen>
  );
}

function MiniSignal({ icon: Icon, label }: { icon: typeof Radio; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <Icon className="h-4 w-4 text-[#D4AF37]" />
      <p className="mt-2 text-[11px] font-black text-white">{label}</p>
    </div>
  );
}
