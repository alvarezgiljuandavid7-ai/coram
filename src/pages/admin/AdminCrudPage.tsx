import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Loader2, Pencil, Plus, Power, Trash2, X } from 'lucide-react';
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

  const canCreate = config.allowCreate !== false;

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

  const deactivateRecord = async (record: AdminRecord) => {
    if (!record.id) return;
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (config.deactivate) {
        await updateAdminRecord(config, auth.profile, String(record.id), config.deactivate(record));
        setMessage('Registro desactivado.');
      } else {
        await deleteAdminRecord(config, auth.profile, String(record.id));
        setMessage('Registro eliminado.');
      }
      await loadRecords();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo completar la accion.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <AdminCrudHeader config={config} canCreate={canCreate} onCreate={openCreate} />

      {error && <AdminNotice tone="error" message={error} />}
      {message && <AdminNotice tone="success" message={message} />}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70"
      >
        {loading ? (
          <AdminLoading />
        ) : records.length === 0 ? (
          <AdminEmpty config={config} canCreate={canCreate} onCreate={openCreate} />
        ) : (
          <div className="divide-y divide-slate-800">
            {records.map((record) => (
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
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void deactivateRecord(record)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-xs font-black text-red-200 transition hover:bg-red-950/40 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
                  >
                    {config.deactivate ? <Power className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                    {config.deactivate ? 'Desactivar' : 'Eliminar'}
                  </button>
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
        />
      )}
    </section>
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
}: {
  config: AdminCrudConfig;
  record: AdminRecord;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: AdminRecord) => void;
  onChange: (record: AdminRecord) => void;
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
              value={record[field.name]}
              onChange={(value) => onChange({ ...record, [field.name]: value })}
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
}: {
  key?: string;
  field: AdminFieldConfig;
  value: AdminRecord[string] | undefined;
  onChange: (value: AdminRecord[string]) => void;
}) {
  const baseClass =
    'mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10';

  return (
    <label className="text-xs font-black uppercase tracking-wider text-slate-400">
      {field.label}
      {field.kind === 'textarea' ? (
        <textarea value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} rows={5} className={baseClass} />
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
  if (config.kind === 'hymns' && payload.slug === '') {
    payload.slug = String(payload.title || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  return payload;
}
