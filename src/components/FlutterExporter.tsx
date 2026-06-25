import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Smartphone, 
  BookOpen, 
  Zap, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Award, 
  Monitor, 
  Heart 
} from 'lucide-react';
import { flutterTemplates } from '../flutterTemplates';

export const FlutterExporter: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('splash');
  const [copied, setCopied] = useState<boolean>(false);

  const currentTemplate = flutterTemplates[selectedKey] || flutterTemplates.splash;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentTemplate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="flutter-design-system-exporter" className="w-full bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6">
      
      {/* Exporter Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/35">
              SISTEMA DE DISEÑO MATERIAL 3
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Flutter Native SDK</span>
          </div>
          <h2 className="font-sans font-black text-xl tracking-tight text-white mt-1.5 flex items-center space-x-2">
            <span>Exportador de Código Flutter</span>
            <Sparkles className="w-5 h-5 text-[#D4AF37] fill-current" />
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 max-w-xl">
            Descarga o copia componentes limpios y reutilizables basados en la guía de Material 3 con la paleta de colores azul y dorado de CorAM.
          </p>
        </div>

        {/* Brand Theme Indicators */}
        <div className="flex space-x-4 shrink-0 text-left bg-slate-950 p-3 rounded-xl border border-slate-850">
          <div className="text-[10px]">
            <span className="text-slate-400 block font-bold uppercase tracking-wider">PRIMARY</span>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="w-3 h-3 rounded-sm bg-[#0B2545]"></span>
              <span className="font-mono text-white">#0B2545</span>
            </div>
          </div>
          <div className="text-[10px]">
            <span className="text-slate-400 block font-bold uppercase tracking-wider">SECONDARY</span>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="w-3 h-3 rounded-sm bg-[#D4AF37]"></span>
              <span className="font-mono text-white">#D4AF37</span>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Selection Matrix */}
      <div className="space-y-2">
        <label className="text-[10px] font-black tracking-wider text-slate-400 block">SELECCIONA LA PANTALLA FLUTTER CORRESPONDIENTE:</label>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(flutterTemplates).map(([key, t]) => {
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                id={`btn-flutter-select-${key}`}
                onClick={() => {
                  setSelectedKey(key);
                  setCopied(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected 
                    ? 'bg-[#D4AF37] text-slate-950 shadow-md' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {t.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side: Description Detail */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between text-left space-y-4">
          <div className="space-y-3">
            <span className="text-[9px] font-black tracking-wider text-[#D4AF37] uppercase block">ESPECIFICACIÓN DE COMPONENTE</span>
            <h4 className="text-white font-sans font-extrabold text-sm tracking-tight leading-tight">{currentTemplate.title}</h4>
            <span className="text-[10px] text-emerald-500 font-mono font-bold block bg-emerald-500/10 px-2 py-0.5 rounded-sm w-fit">
              class {currentTemplate.className}
            </span>
            <p className="text-slate-400 text-xs leading-relaxed">{currentTemplate.description}</p>

            <div className="border-t border-slate-850 pt-3 space-y-2">
              <span className="text-[9px] font-black tracking-wider text-slate-450 uppercase block">Atributos Material 3</span>
              {[
                'Paleta ColorScheme.fromSeed con tono azul profundo',
                'Uso estricto de componentes modernos Flutter 3.x',
                'Navegación fluida y animaciones de entrada nativas',
                'Responsividad adaptativa a pantallas iPhone y Android'
              ].map((item, id) => (
                <div key={id} className="flex items-start space-x-1.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                  <span className="leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            id="btn-flutter-copy-sidebar"
            onClick={handleCopyCode}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 ${
              copied 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#0B2545] hover:bg-slate-850 text-white border border-[#D4AF37]/50'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Código Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Código Dart / Flutter</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Code Block Explorer */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden relative">
          
          {/* Code Header Bar */}
          <div className="bg-slate-900 border-b border-slate-850 p-2.5 px-4 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
            <span>lib/screens/{selectedKey}_screen.dart</span>
            <button
              id="btn-flutter-copy-top-bar"
              onClick={handleCopyCode}
              className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Actual Code Viewer container */}
          <div className="p-4 overflow-auto max-h-[380px] text-left">
            <pre className="text-[11px] font-mono text-slate-200 leading-normal select-all">
              {currentTemplate.code}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
