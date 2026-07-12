import { BookMarked, FolderOpen, GraduationCap, Heart, Music2, Trash2, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCoramApp } from '../../app/CoramAppContext';
import { EditorialCard, EditorialHeading, ExperienceCanvas, FilterChip, MetricTile, SectionHeading, StatePanel } from '../../components/experience-v2/ExperienceV2';
import type { FavoriteEntityType } from '../../types';

interface FavoriteViewItem { id: string; entityType: FavoriteEntityType; entityId: string; title: string; detail: string; to: string; icon: LucideIcon; }

export function FavoritosPage() {
  const { state, hymns, favorites, toggleFavorite } = useCoramApp();
  const [filter, setFilter] = useState<'todos' | FavoriteEntityType>('todos');
  const items = useMemo(() => favorites.map<FavoriteViewItem | null>((favorite) => {
    if (favorite.entityType === 'corario') { const item = state.corarios.find((value) => value.id === favorite.entityId); return item ? { id: favorite.id, entityType: favorite.entityType, entityId: item.id, title: item.title, detail: `Corario · Tono ${item.key}`, to: '/app/corarios', icon: Music2 } : null; }
    if (favorite.entityType === 'hymn') { const item = hymns.find((value) => value.id === favorite.entityId); return item ? { id: favorite.id, entityType: favorite.entityType, entityId: item.id, title: item.title, detail: `Himno ${item.number}`, to: '/app/himnario', icon: BookMarked } : null; }
    if (favorite.entityType === 'course') { const item = state.courses.find((value) => value.id === favorite.entityId); return item ? { id: favorite.id, entityType: favorite.entityType, entityId: item.id, title: item.title, detail: item.instructor || 'Academia CorAM', to: '/app/academia', icon: GraduationCap } : null; }
    const item = state.resources.find((value) => value.id === favorite.entityId); return item ? { id: favorite.id, entityType: favorite.entityType, entityId: item.id, title: item.title, detail: item.category, to: '/app/recursos', icon: FolderOpen } : null;
  }).filter(Boolean) as FavoriteViewItem[], [favorites, hymns, state.corarios, state.courses, state.resources]);
  const visible = filter === 'todos' ? items : items.filter((item) => item.entityType === filter);

  return <ExperienceCanvas>
    <EditorialHeading eyebrow="Biblioteca personal" title="Favoritos" body="Todo lo que guardas en Corarios, Himnario, Academia y Recursos, reunido sin duplicar datos." icon={Heart} />
    <section className="grid gap-3 sm:grid-cols-3"><MetricTile label="Guardados" value={items.length} detail="Contenido real" icon={Heart} /><MetricTile label="Canciones" value={items.filter((item) => item.entityType === 'corario' || item.entityType === 'hymn').length} detail="Corarios e himnos" icon={Music2} tone="gold" /><MetricTile label="Formación" value={items.filter((item) => item.entityType === 'course' || item.entityType === 'resource').length} detail="Cursos y recursos" icon={GraduationCap} tone="lilac" /></section>
    <section className="space-y-4"><SectionHeading eyebrow="Filtrar" title="Tu contenido guardado" /><div className="flex gap-2 overflow-x-auto pb-1">{([['todos','Todos'],['corario','Corarios'],['hymn','Himnos'],['course','Cursos'],['resource','Recursos']] as const).map(([value,label]) => <FilterChip key={value} active={filter === value} label={label} onClick={() => setFilter(value)} />)}</div></section>
    <section>{visible.length === 0 ? <StatePanel icon={Heart} title={items.length ? 'No hay favoritos de este tipo' : 'Aún no tienes favoritos'} body={items.length ? 'Cambia el filtro para ver otros contenidos.' : 'Usa el botón de corazón en las bibliotecas para guardar contenido.'} /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((item) => <EditorialCard key={item.id} interactive className="overflow-hidden"><Link to={item.to} className="block p-5"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#edf3e8] text-[#4a8a55]"><item.icon className="h-6 w-6" /></span><p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-[#a56b09]">{item.detail}</p><h2 className="mt-2 font-serif text-2xl leading-none">{item.title}</h2><p className="mt-4 text-sm font-bold text-[#4a8a55]">Abrir contenido</p></Link><div className="border-t border-[#0B2545]/8 p-3 text-right"><button type="button" onClick={() => void toggleFavorite(item.entityType,item.entityId)} className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-bold text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /> Quitar</button></div></EditorialCard>)}</div>}</section>
  </ExperienceCanvas>;
}
