import { type FormEvent, type Key, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, BookMarked, Clock3, FolderPlus, ListMusic, Music2, Pencil, Play, Sparkles, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCoramApp } from '../../app/CoramAppContext';
import { EditorialCard, EditorialHeading, EditorialHero, ExperienceCanvas, MetricTile, SectionHeading, StatePanel } from '../../components/experience-v2/ExperienceV2';
import type { UserCollection, UserCollectionItem } from '../../types';

export function ColeccionesPage() {
  const { state, hymns, collections, createUserCollection, updateUserCollection, deleteUserCollection, removeItemFromCollection, reorderUserCollectionItems } = useCoramApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const totalItems = collections.reduce((sum, collection) => sum + collection.items.length, 0);
  const nextCollection = collections.find((collection) => collection.items.length > 0);
  const contentNames = useMemo(() => {
    const names = new Map<string, string>();
    state.corarios.forEach((item) => names.set(`corario:${item.id}`, item.title));
    hymns.forEach((item) => names.set(`hymn:${item.id}`, `${item.number}. ${item.title}`));
    return names;
  }, [hymns, state.corarios]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    if (editingId) await updateUserCollection(editingId, cleanName, description.trim());
    else await createUserCollection(cleanName, description.trim());
    setName(''); setDescription(''); setEditingId(null);
  }

  function startEdit(collection: UserCollection) {
    setEditingId(collection.id); setName(collection.name); setDescription(collection.description ?? '');
  }

  async function moveItem(collection: UserCollection, item: UserCollectionItem, direction: -1 | 1) {
    const index = collection.items.findIndex((candidate) => candidate.id === item.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= collection.items.length) return;
    const next = [...collection.items];
    [next[index], next[target]] = [next[target], next[index]];
    await reorderUserCollectionItems(collection.id, next);
  }

  return <ExperienceCanvas>
    <EditorialHeading eyebrow="Repertorios personales" title="Colecciones" body="Organiza corarios e himnos reales para ensayos, cultos y momentos de ministración." icon={ListMusic} />
    <EditorialHero badge="Preparación ministerial" title={nextCollection ? nextCollection.name : 'Crea tu próximo repertorio'} body={nextCollection ? `${nextCollection.items.length} canciones listas para abrir en modo ensayo.` : 'Reúne canciones desde Corarios e Himnario y ordénalas según el flujo del servicio.'} icon={Sparkles} action={nextCollection ? { label: 'Comenzar ensayo', to: `/app/ensayo/${nextCollection.items[0].entityType}/${nextCollection.items[0].entityId}?collection=${nextCollection.id}` } : undefined} imageUrl="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1500&q=82" />
    <section className="grid gap-3 sm:grid-cols-3"><MetricTile label="Colecciones" value={collections.length} detail="Listas privadas" icon={ListMusic} /><MetricTile label="Canciones" value={totalItems} detail="Ordenadas" icon={Music2} tone="gold" /><MetricTile label="Siguiente" value={nextCollection ? 'Listo' : 'Crear'} detail={nextCollection?.name ?? 'Primer repertorio'} icon={Clock3} tone="lilac" /></section>
    <EditorialCard className="p-5"><SectionHeading eyebrow={editingId ? 'Editar colección' : 'Nueva colección'} title={editingId ? 'Actualiza tu repertorio' : 'Prepara una lista'} /><form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Culto del domingo" className="min-h-12 rounded-full border border-[#0B2545]/10 bg-[#fbfaf6] px-5 text-sm outline-none focus:border-[#4a8a55] focus:ring-4 focus:ring-[#4a8a55]/10" /><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción opcional" className="min-h-12 rounded-full border border-[#0B2545]/10 bg-[#fbfaf6] px-5 text-sm outline-none focus:border-[#4a8a55] focus:ring-4 focus:ring-[#4a8a55]/10" /><button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#4a8a55] px-5 text-sm font-bold text-white"><FolderPlus className="h-4 w-4" />{editingId ? 'Guardar' : 'Crear'}</button></form></EditorialCard>
    <section className="space-y-4"><SectionHeading eyebrow="Tus listas" title="Colecciones guardadas" />{collections.length === 0 ? <StatePanel icon={FolderPlus} title="Aún no tienes colecciones" body="Crea una lista y agrega contenido desde Corarios o Himnario." /> : <div className="grid gap-4 xl:grid-cols-2">{collections.map((collection) => <CollectionCard key={collection.id} collection={collection} names={contentNames} onEdit={() => startEdit(collection)} onDelete={() => void deleteUserCollection(collection.id)} onMove={(item, direction) => void moveItem(collection, item, direction)} onRemove={(itemId) => void removeItemFromCollection(itemId)} />)}</div>}</section>
  </ExperienceCanvas>;
}

function CollectionCard({ collection, names, onEdit, onDelete, onMove, onRemove }: { key?: Key; collection: UserCollection; names: Map<string,string>; onEdit: () => void; onDelete: () => void; onMove: (item: UserCollectionItem, direction: -1 | 1) => void; onRemove: (id: string) => void }) {
  return <EditorialCard className="overflow-hidden"><header className="flex items-start justify-between gap-3 bg-[linear-gradient(120deg,#f0f5ec,#fffaf0)] p-5"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a56b09]">{collection.items.length} elementos</p><h3 className="mt-2 truncate font-serif text-3xl leading-none">{collection.name}</h3>{collection.description && <p className="mt-2 text-sm leading-6 text-[#596576]">{collection.description}</p>}</div><div className="flex gap-2"><button type="button" onClick={onEdit} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm" aria-label="Editar colección"><Pencil className="h-4 w-4" /></button><button type="button" onClick={onDelete} className="grid h-10 w-10 place-items-center rounded-full bg-white text-rose-600 shadow-sm" aria-label="Eliminar colección"><Trash2 className="h-4 w-4" /></button></div></header><div className="space-y-2 p-4">{collection.items.length === 0 ? <p className="rounded-2xl bg-[#f7f5ef] p-4 text-sm text-[#596576]">Agrega corarios o himnos desde sus bibliotecas.</p> : collection.items.map((item, index) => <div key={item.id} className="flex items-center gap-2 rounded-2xl border border-[#0B2545]/8 bg-white p-2"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf3e8] text-[#4a8a55]">{item.entityType === 'hymn' ? <BookMarked className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}</span><span className="min-w-0 flex-1 truncate text-sm font-bold">{names.get(`${item.entityType}:${item.entityId}`) ?? 'Contenido no disponible'}</span><button type="button" disabled={index === 0} onClick={() => onMove(item,-1)} className="grid h-9 w-9 place-items-center rounded-full disabled:opacity-25" aria-label="Subir"><ArrowUp className="h-4 w-4" /></button><button type="button" disabled={index === collection.items.length - 1} onClick={() => onMove(item,1)} className="grid h-9 w-9 place-items-center rounded-full disabled:opacity-25" aria-label="Bajar"><ArrowDown className="h-4 w-4" /></button><button type="button" onClick={() => onRemove(item.id)} className="grid h-9 w-9 place-items-center rounded-full text-rose-600" aria-label="Quitar"><Trash2 className="h-4 w-4" /></button></div>)}</div>{collection.items[0] && <div className="border-t border-[#0B2545]/8 p-4"><Link to={`/app/ensayo/${collection.items[0].entityType}/${collection.items[0].entityId}?collection=${collection.id}`} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0B2545] text-sm font-bold text-white"><Play className="h-4 w-4" /> Abrir en modo ensayo</Link></div>}</EditorialCard>;
}
