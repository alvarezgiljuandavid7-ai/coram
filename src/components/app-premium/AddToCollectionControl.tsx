import { useEffect, useState } from 'react';
import { FolderPlus, Loader2 } from 'lucide-react';
import { useCoramApp } from '../../app/CoramAppContext';

export function AddToCollectionControl({
  entityType,
  entityId,
}: {
  entityType: 'corario' | 'hymn';
  entityId: string;
}) {
  const { collections, addItemToCollection, createUserCollection } = useCoramApp();
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? '');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!collectionId && collections[0]?.id) setCollectionId(collections[0].id);
  }, [collectionId, collections]);

  const addExisting = async () => {
    if (!collectionId) return;
    setSaving(true);
    setMessage('');
    try {
      await addItemToCollection(collectionId, entityType, entityId);
      setMessage('Agregado a coleccion.');
    } finally {
      setSaving(false);
    }
  };

  const createAndAdd = async () => {
    const cleanName = newName.trim();
    if (!cleanName) return;
    setSaving(true);
    setMessage('');
    try {
      await createUserCollection(cleanName);
      setNewName('');
      setMessage('Coleccion creada. Seleccionala para agregar este contenido.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">Colecciones</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <select
          value={collectionId}
          onChange={(event) => setCollectionId(event.target.value)}
          className="min-h-11 rounded-2xl border border-white/10 bg-slate-950 px-3 text-xs font-black text-white outline-none"
        >
          <option value="">Seleccionar coleccion</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!collectionId || saving}
          onClick={() => void addExisting()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-3 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
          Agregar
        </button>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Nueva coleccion"
          className="min-h-11 rounded-2xl border border-white/10 bg-slate-950 px-3 text-xs font-semibold text-white outline-none placeholder:text-slate-500"
        />
        <button
          type="button"
          disabled={!newName.trim() || saving}
          onClick={() => void createAndAdd()}
          className="min-h-11 rounded-2xl border border-white/10 px-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Crear
        </button>
      </div>
      {message && <p className="mt-2 text-xs font-bold text-[#D4AF37]">{message}</p>}
    </div>
  );
}
