import { Download, FileAudio, FileText, FolderOpen, Heart, Search, Sparkles, X } from 'lucide-react';
import { type Key, useEffect, useMemo, useState } from 'react';
import { useCoramApp } from '../../app/CoramAppContext';
import { EditorialCard, EditorialHeading, EditorialHero, ExperienceCanvas, FilterChip, MetricTile, SearchField, SectionHeading, StatePanel } from '../../components/experience-v2/ExperienceV2';
import type { Resource } from '../../types';
import { SponsoredPlacement } from '../../features/sponsors/SponsoredPlacement';

export function RecursosPage() {
  const { state, isFavorite, toggleFavorite, recordRecentActivity } = useCoramApp();
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selected, setSelected] = useState<Resource | null>(null);
  const categories = useMemo(() => ['Todos', ...Array.from(new Set(state.resources.map((resource) => resource.category)))], [state.resources]);
  const filtered = useMemo(() => state.resources.filter((resource) => {
    const term = query.trim().toLocaleLowerCase('es');
    return (category === 'Todos' || resource.category === category) && (!onlyFavorites || isFavorite('resource', resource.id)) && (!term || [resource.title, resource.description, resource.category].some((value) => value.toLocaleLowerCase('es').includes(term)));
  }), [category, isFavorite, onlyFavorites, query, state.resources]);
  const favorites = state.resources.filter((resource) => isFavorite('resource', resource.id)).length;
  const downloadable = state.resources.filter((resource) => resource.fileUrl).length;

  useEffect(() => {
    if (!selected) return undefined;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [selected]);

  function openResource(resource: Resource) {
    setSelected(resource);
    void recordRecentActivity({ entityType: 'resource', entityId: resource.id, title: resource.title, route: '/app/recursos', metadata: { category: resource.category } });
  }

  return <ExperienceCanvas>
    <EditorialHeading eyebrow="Biblioteca descargable" title="Recursos" body="Partituras, guías, audios y materiales publicados para preparar cada servicio con orden." icon={FolderOpen} />
    <EditorialHero badge="Material ministerial" title="Todo lo que necesitas, listo para usar" body="Busca, guarda y abre los recursos reales publicados desde el panel administrador." icon={Sparkles} imageUrl="https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1500&q=82" />
    <SponsoredPlacement placement="recursos" />
    <section className="grid gap-3 sm:grid-cols-3"><MetricTile label="Recursos" value={state.resources.length} detail="Publicados" icon={FolderOpen} /><MetricTile label="Con archivo" value={downloadable} detail="Listos para abrir" icon={Download} tone="gold" /><MetricTile label="Favoritos" value={favorites} detail="Guardados" icon={Heart} tone="lilac" /></section>
    <section className="space-y-4"><SectionHeading eyebrow="Explorar" title="Encuentra tu material" /><SearchField value={query} onChange={setQuery} placeholder="Buscar recursos..." /><div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <FilterChip key={item} active={category === item} label={item} onClick={() => setCategory(item)} />)}<FilterChip active={onlyFavorites} label="Favoritos" icon={Heart} onClick={() => setOnlyFavorites((current) => !current)} /></div></section>
    <section className="space-y-4"><SectionHeading eyebrow="Contenido publicado" title="Biblioteca CorAM" />{state.resources.length === 0 ? <StatePanel icon={FolderOpen} title="Aún no hay recursos" body="Los materiales aparecerán cuando sean publicados desde Supabase." /> : filtered.length === 0 ? <StatePanel icon={Search} title="No hay coincidencias" body="Prueba con otra búsqueda o categoría." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((resource) => <ResourceTile key={resource.id} resource={resource} favorite={isFavorite('resource', resource.id)} onOpen={() => openResource(resource)} onFavorite={() => void toggleFavorite('resource', resource.id)} />)}</div>}</section>
    {selected && <ResourceDialog resource={selected} favorite={isFavorite('resource', selected.id)} onClose={() => setSelected(null)} onFavorite={() => void toggleFavorite('resource', selected.id)} />}
  </ExperienceCanvas>;
}

function resourceIcon(category: string) {
  return category.toLocaleLowerCase('es').includes('audio') ? FileAudio : FileText;
}

function ResourceTile({ resource, favorite, onOpen, onFavorite }: { key?: Key; resource: Resource; favorite: boolean; onOpen: () => void; onFavorite: () => void }) {
  const Icon = resourceIcon(resource.category);
  return <EditorialCard interactive className="overflow-hidden"><button type="button" onClick={onOpen} className="block w-full p-5 text-left"><div className="flex items-start justify-between gap-3"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#edf3e8] text-[#4a8a55]"><Icon className="h-6 w-6" /></span><span className="rounded-full bg-[#fff1d5] px-3 py-1 text-[10px] font-black uppercase text-[#a56b09]">{resource.category}</span></div><h3 className="mt-6 font-serif text-2xl leading-none">{resource.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-[#596576]">{resource.description}</p><div className="mt-5 flex gap-4 text-xs font-bold text-[#596576]"><span>{resource.fileSize || 'Tamaño no disponible'}</span><span>{resource.downloadsCount} aperturas</span></div></button><div className="grid grid-cols-[1fr_auto] gap-2 border-t border-[#0B2545]/8 p-4"><button type="button" onClick={onOpen} className="min-h-11 rounded-full bg-[#0B2545] px-4 text-sm font-bold text-white">Ver detalle</button><button type="button" onClick={onFavorite} className={`grid h-11 w-11 place-items-center rounded-full border ${favorite ? 'border-[#4a8a55] text-[#4a8a55]' : 'border-[#0B2545]/10'}`} aria-label="Cambiar favorito"><Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} /></button></div></EditorialCard>;
}

function ResourceDialog({ resource, favorite, onClose, onFavorite }: { resource: Resource; favorite: boolean; onClose: () => void; onFavorite: () => void }) {
  const Icon = resourceIcon(resource.category);
  return <div className="fixed inset-0 z-50 flex items-end bg-[#0B2545]/60 p-3 pt-16 md:items-center md:justify-center" role="dialog" aria-modal="true"><button type="button" className="absolute inset-0" onClick={onClose} aria-label="Cerrar recurso" /><section className="relative w-full max-w-xl overflow-hidden rounded-[1.7rem] bg-[#fffdf8] shadow-2xl"><header className="flex items-start justify-between gap-4 border-b border-[#0B2545]/8 p-5"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#edf3e8] text-[#4a8a55]"><Icon className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a56b09]">{resource.category}</p><h2 className="mt-1 font-serif text-2xl leading-none">{resource.title}</h2></div></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[#f2ecdf]" aria-label="Cerrar"><X className="h-5 w-5" /></button></header><div className="p-5"><p className="text-sm leading-7 text-[#596576]">{resource.description}</p><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={onFavorite} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#0B2545]/10 font-bold"><Heart className={`h-4 w-4 ${favorite ? 'fill-current text-[#4a8a55]' : ''}`} />{favorite ? 'Guardado' : 'Guardar'}</button>{resource.fileUrl ? <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#4a8a55] font-bold text-white"><Download className="h-4 w-4" /> Abrir archivo</a> : <span className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-500">Archivo no disponible</span>}</div></div></section></div>;
}
