import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Loader2, Pencil, Plus, Power, Search, Trash2, UploadCloud, X } from 'lucide-react';
import { useCoramApp } from '../../app/CoramAppContext';
import {
  adminCrudConfigs,
  createAdminRecord,
  deleteAdminRecord,
  listAdminRecords,
  updateAdminRecord,
  type AdminContentKind,
  type AdminCrudConfig,
  type AdminFieldConfig,
  type AdminRecord,
} from '../../domain/admin/adminCrudRepository';
import { uploadMediaAsset } from '../../domain/media/mediaAssets';

interface AdminCrudPageProps {
  kind: AdminContentKind;
}

export function AdminCrudPage({ kind }: AdminCrudPageProps) {
  const config = adminCrudConfigs[kind];
  const { auth } = useCoramApp();
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');

  const canCreate = config.allowCreate !== false;
  const visibleRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesQuery =
        !normalizedQuery ||
        (config.searchableFields ?? []).some((field) => String(record[field] ?? '').toLowerCase().includes(normalizedQuery));
      const matchesFilter =
        filter === 'Todos' ||
        !config.filterField ||
        String(record[config.filterField]) === filter;

      return matchesQuery && matchesFilter;
    });
  }, [config.filterField, config.searchableFields, filter, query, records]);

  const loadRecords = async () => {
    setLoading(true);
    setError('');

    try {
      const next = await listAdminRecords(config);
      setRecords(next);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo cargar la informacion.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, [kind]);

  const openCreate = () => {
    setMessage('');
    setError('');
    setEditing({ ...config.createDefaults });
  };

  const openEdit = (record: AdminRecord) => {
    setMessage('');
    setError('');
    setEditing({ ...record });
  };

  const saveRecord = async (payload: AdminRecord) => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (payload.id) {
        await updateAdminRecord(config, auth.profile, String(payload.id), stripId(payload));
        setMessage('Registro actualizado.');
      } else {
        await createAdminRecord(config, auth.profile, payload);
        setMessage('Registro creado.');
      }
      setEditing(null);
      await loadRecords();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo guardar el registro.');
    } finally {
      setSaving(false);
    }
  };

  const hideRecord = async (record: AdminRecord) => {
    if (!record.id || !config.deactivate) return;
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await updateAdminRecord(config, auth.profile, String(record.id), config.deactivate(record));
      setMessage('Registro ocultado. Ya no aparecera en la app de usuarios.');
      await loadRecords();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo ocultar el registro.');
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async (record: AdminRecord) => {
    if (!record.id) return;
    const title = config.displayTitle(record);
    const confirmed = window.confirm(`Eliminar "${title}" de Supabase? Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await deleteAdminRecord(config, auth.profile, String(record.id), record);
      setMessage('Registro eliminado de Supabase.');
      await loadRecords();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo eliminar el registro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <AdminCrudHeader config={config} canCreate={canCreate} onCreate={openCreate} />

      {error && <AdminNotice tone="error" message={error} />}
      {message && <AdminNotice tone="success" message={message} />}

      <AdminCrudToolbar config={config} query={query} filter={filter} onQuery={setQuery} onFilter={setFilter} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70"
      >
        {loading ? (
          <AdminLoading />
        ) : records.length === 0 ? (
          <AdminEmpty config={config} canCreate={canCreate} onCreate={openCreate} />
        ) : visibleRecords.length === 0 ? (
          <div className="p-6 text-sm font-semibold text-slate-400">No hay resultados con los filtros actuales.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {visibleRecords.map((record) => (
              <motion.article
                key={String(record.id)}
                whileTap={{ scale: 0.995 }}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="min-w-0">
                  <h2 className="truncate text-base font-black text-slate-50">{config.displayTitle(record)}</h2>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-400">{config.displayMeta(record)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(record)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-black text-slate-100 transition hover:bg-slate-900 active:scale-[0.99]"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  {config.deactivate && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void hideRecord(record)}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-950/30 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
                    >
                      <Power className="h-4 w-4" />
                      Ocultar
                    </button>
                  )}
                  {config.allowDelete !== false && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void removeRecord(record)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-xs font-black text-red-200 transition hover:bg-red-950/40 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </motion.div>

      {editing && (
        <AdminCrudEditor
          config={config}
          record={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={(payload) => void saveRecord(payload)}
          onChange={setEditing}
          onError={setError}
        />
      )}
    </section>
  );
}

function AdminCrudToolbar({
  config,
  query,
  filter,
  onQuery,
  onFilter,
}: {
  config: AdminCrudConfig;
  query: string;
  filter: string;
  onQuery: (value: string) => void;
  onFilter: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 md:grid-cols-[1fr_220px]">
      <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm font-semibold text-slate-300 focus-within:border-[#D4AF37]">
        <Search className="h-4 w-4 text-[#D4AF37]" />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={`Buscar en ${config.title.toLowerCase()}...`}
          className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-600"
        />
      </label>
      {config.filterField && (
        <select
          value={filter}
          onChange={(event) => onFilter(event.target.value)}
          className="min-h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm font-black text-slate-100 outline-none focus:border-[#D4AF37]"
        >
          <option value="Todos">Todos</option>
          {(config.filterOptions ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function AdminCrudHeader({
  config,
  canCreate,
  onCreate,
}: {
  config: AdminCrudConfig;
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37]">{config.eyebrow}</p>
          <h1 className="mt-2 text-[clamp(1.5rem,6vw,2rem)] font-black tracking-tight text-slate-50">{config.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{config.description}</p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#e5c75c] active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </button>
        )}
      </div>
    </div>
  );
}

function AdminCrudEditor({
  config,
  record,
  saving,
  onClose,
  onSave,
  onChange,
  onError,
}: {
  config: AdminCrudConfig;
  record: AdminRecord;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: AdminRecord) => void;
  onChange: (record: AdminRecord) => void;
  onError: (message: string) => void;
}) {
  const [validationError, setValidationError] = useState('');

  const title = useMemo(() => (record.id ? 'Editar registro' : 'Nuevo registro'), [record.id]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const missing = config.fields.find((field) => field.required && !String(record[field.name] ?? '').trim());
    if (missing) {
      setValidationError(`Completa el campo: ${missing.label}.`);
      return;
    }
    setValidationError('');
    onSave(normalizePayload(config, record));
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end bg-slate-950/75 p-3 sm:items-center sm:justify-center sm:p-6">
      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="max-h-[92dvh] w-full max-w-2xl overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37]">{config.title}</p>
            <h2 className="mt-1 text-xl font-black text-slate-50">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white active:scale-95">
            <X className="h-5 w-5" />
          </button>
        </div>

        {validationError && <AdminNotice tone="error" message={validationError} compact />}

        <div className="mt-5 grid gap-4">
          {config.fields.map((field) => (
            <AdminField
              key={field.name}
              field={field}
              value={record[field.targetField ?? field.name]}
              onChange={(value) => onChange({ ...record, [field.targetField ?? field.name]: value })}
              onError={onError}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-black text-slate-200 transition hover:bg-slate-900 active:scale-[0.99]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-[#e5c75c] active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </motion.form>
    </div>
  );
}

function AdminField({
  field,
  value,
  onChange,
  onError,
}: {
  key?: string;
  field: AdminFieldConfig;
  value: AdminRecord[string] | undefined;
  onChange: (value: AdminRecord[string]) => void;
  onError: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const baseClass =
    'mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10';

  const uploadFile = async (file: File | undefined) => {
    if (!file || !field.bucketId || !field.assetType) return;
    setUploading(true);
    onError('');
    try {
      const uploaded = await uploadMediaAsset({
        file,
        bucketId: field.bucketId,
        assetType: field.assetType,
        visibility: 'public',
        linkedEntityType: field.linkedEntityType,
      });
      onChange(uploaded.publicUrl ?? `${uploaded.bucketId}/${uploaded.objectPath}`);
    } catch (caughtError) {
      onError(caughtError instanceof Error ? caughtError.message : 'No se pudo subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="text-xs font-black uppercase tracking-wider text-slate-400">
      {field.label}
      {field.kind === 'textarea' ? (
        <textarea value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} rows={5} className={baseClass} />
      ) : field.kind === 'file' ? (
        <span className="mt-2 flex flex-col gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900 p-3 normal-case tracking-normal text-slate-200">
          <span className="flex items-center gap-2 text-xs font-bold text-slate-300">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4 text-[#D4AF37]" />}
            {uploading ? 'Subiendo a Supabase Storage...' : 'Selecciona archivo para subir a Supabase Storage'}
          </span>
          <input
            type="file"
            disabled={uploading}
            onChange={(event) => void uploadFile(event.target.files?.[0])}
            className="text-xs font-semibold text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#D4AF37] file:px-3 file:py-2 file:text-xs file:font-black file:text-slate-950"
          />
          {value && <span className="break-all text-[11px] font-semibold text-emerald-200">Guardado: {String(value)}</span>}
        </span>
      ) : field.kind === 'boolean' ? (
        <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 normal-case tracking-normal text-slate-200">
          <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[#D4AF37]" />
          Activo
        </span>
      ) : field.kind === 'select' ? (
        <select value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} className={baseClass}>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.kind === 'datetime-local' ? (
        <input
          type="datetime-local"
          value={formatDatetimeLocalValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className={baseClass}
        />
      ) : (
        <input
          type={field.kind === 'number' ? 'number' : 'text'}
          value={String(value ?? '')}
          onChange={(event) => onChange(field.kind === 'number' ? Number(event.target.value) : event.target.value)}
          className={baseClass}
        />
      )}
    </label>
  );
}

function formatDatetimeLocalValue(value: AdminRecord[string] | undefined): string {
  if (!value) return '';
  const asString = String(value);
  if (!asString) return '';
  return asString.includes('T') ? asString.slice(0, 16) : asString;
}

function AdminLoading() {
  return (
    <div className="flex items-center gap-3 p-6 text-sm font-bold text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      Cargando registros...
    </div>
  );
}

function AdminEmpty({ config, canCreate, onCreate }: { config: AdminCrudConfig; canCreate: boolean; onCreate: () => void }) {
  return (
    <div className="p-6 text-sm font-semibold text-slate-400">
      No hay registros en {config.title.toLowerCase()}.
      {canCreate && (
        <button type="button" onClick={onCreate} className="ml-2 font-black text-[#D4AF37] underline-offset-4 hover:underline">
          Crear el primero
        </button>
      )}
    </div>
  );
}

function AdminNotice({ tone, message, compact = false }: { tone: 'error' | 'success'; message: string; compact?: boolean }) {
  const classes =
    tone === 'error'
      ? 'border-red-500/30 bg-red-950/30 text-red-100'
      : 'border-emerald-500/30 bg-emerald-950/30 text-emerald-100';
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2;

  return (
    <div className={`mt-3 flex gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${classes} ${compact ? 'text-xs' : ''}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function stripId(record: AdminRecord): AdminRecord {
  const { id, ...payload } = record;
  return payload;
}

function normalizePayload(config: AdminCrudConfig, record: AdminRecord): AdminRecord {
  const payload = record.id ? stripId(record) : stripId(record);
  config.fields.forEach((field) => {
    if (field.kind === 'file') delete payload[field.name];
    if (field.kind === 'datetime-local' && payload[field.name] === '') payload[field.name] = null;
  });
  if (config.kind === 'hymns' && payload.slug === '') {
    payload.slug = String(payload.title || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  return payload;
}
