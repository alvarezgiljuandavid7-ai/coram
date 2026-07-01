import { supabase } from '../../shared/supabase/client';
import type { CoramAuthProfile } from '../auth/authRepository';

export type AdminContentKind = 'courses' | 'corarios' | 'hymns' | 'resources' | 'profiles';

export type AdminFieldKind = 'text' | 'textarea' | 'number' | 'boolean' | 'select';

export interface AdminFieldConfig {
  name: string;
  label: string;
  kind: AdminFieldKind;
  required?: boolean;
  options?: string[];
}

export interface AdminCrudConfig {
  kind: AdminContentKind;
  title: string;
  eyebrow: string;
  description: string;
  table: string;
  orderBy: string;
  select: string;
  fields: AdminFieldConfig[];
  displayTitle: (row: AdminRecord) => string;
  displayMeta: (row: AdminRecord) => string;
  createDefaults: AdminRecord;
  deactivate?: (row: AdminRecord) => AdminRecord;
  allowCreate?: boolean;
  allowDelete?: boolean;
}

export type AdminRecord = Record<string, string | number | boolean | null | string[]>;

function requireAdmin(profile: CoramAuthProfile | null) {
  if (profile?.role !== 'admin') {
    throw new Error('Debes iniciar sesion como administrador para modificar contenido.');
  }
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase no esta configurado.');
  }

  return supabase;
}

export async function listAdminRecords(config: AdminCrudConfig): Promise<AdminRecord[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from(config.table)
    .select(config.select)
    .order(config.orderBy, { ascending: true });

  if (error) throw error;
  return ((data ?? []) as unknown) as AdminRecord[];
}

export async function createAdminRecord(
  config: AdminCrudConfig,
  profile: CoramAuthProfile | null,
  payload: AdminRecord,
): Promise<AdminRecord> {
  requireAdmin(profile);
  const client = requireSupabase();
  const { data, error } = await client.from(config.table).insert(payload).select(config.select).single();

  if (error) throw error;
  return data as unknown as AdminRecord;
}

export async function updateAdminRecord(
  config: AdminCrudConfig,
  profile: CoramAuthProfile | null,
  id: string,
  payload: AdminRecord,
): Promise<AdminRecord> {
  requireAdmin(profile);
  const client = requireSupabase();
  const { data, error } = await client.from(config.table).update(payload).eq('id', id).select(config.select).single();

  if (error) throw error;
  return data as unknown as AdminRecord;
}

export async function deleteAdminRecord(
  config: AdminCrudConfig,
  profile: CoramAuthProfile | null,
  id: string,
): Promise<void> {
  requireAdmin(profile);
  const client = requireSupabase();
  const { error } = await client.from(config.table).delete().eq('id', id);

  if (error) throw error;
}

export const adminCrudConfigs: Record<AdminContentKind, AdminCrudConfig> = {
  courses: {
    kind: 'courses',
    title: 'Cursos',
    eyebrow: 'Academia',
    description: 'Publica y administra cursos visibles en la academia CorAM.',
    table: 'courses',
    orderBy: 'title',
    select: 'id, title, description, instructor, image_url, video_url, is_premium, is_published',
    displayTitle: (row) => String(row.title || 'Curso sin titulo'),
    displayMeta: (row) => `${row.instructor || 'CorAM'} · ${row.is_published ? 'Publicado' : 'Oculto'}`,
    createDefaults: {
      title: '',
      description: '',
      instructor: 'CorAM',
      image_url: '',
      video_url: '',
      is_premium: false,
      is_published: true,
    },
    deactivate: () => ({ is_published: false }),
    fields: [
      { name: 'title', label: 'Titulo', kind: 'text', required: true },
      { name: 'description', label: 'Descripcion', kind: 'textarea', required: true },
      { name: 'instructor', label: 'Instructor', kind: 'text' },
      { name: 'image_url', label: 'URL de imagen', kind: 'text' },
      { name: 'video_url', label: 'URL de video', kind: 'text' },
      { name: 'is_premium', label: 'Premium', kind: 'boolean' },
      { name: 'is_published', label: 'Publicado', kind: 'boolean' },
    ],
  },
  corarios: {
    kind: 'corarios',
    title: 'Corarios',
    eyebrow: 'Biblioteca',
    description: 'Gestiona letras, tonos y categorias del cancionero.',
    table: 'corarios',
    orderBy: 'titulo',
    select: 'id, titulo, categoria, tono, letra, premium, audio_url',
    displayTitle: (row) => String(row.titulo || 'Corario sin titulo'),
    displayMeta: (row) => `${row.categoria || 'Corarios'} · Tono ${row.tono || 'C'}`,
    createDefaults: {
      titulo: '',
      categoria: 'Corarios',
      tono: 'C',
      letra: '',
      premium: false,
      audio_url: '',
    },
    allowDelete: true,
    fields: [
      { name: 'titulo', label: 'Titulo', kind: 'text', required: true },
      { name: 'categoria', label: 'Categoria', kind: 'text' },
      { name: 'tono', label: 'Tono', kind: 'text' },
      { name: 'letra', label: 'Letra', kind: 'textarea', required: true },
      { name: 'audio_url', label: 'URL de audio', kind: 'text' },
      { name: 'premium', label: 'Premium', kind: 'boolean' },
    ],
  },
  hymns: {
    kind: 'hymns',
    title: 'Himnos',
    eyebrow: 'Himnario',
    description: 'Edita himnos del Himnario Manantial y su publicacion.',
    table: 'hymns',
    orderBy: 'hymn_number',
    select: 'id, hymn_number, title, slug, original_key, lyrics, chords, is_published',
    displayTitle: (row) => `${row.hymn_number || '-'} · ${row.title || 'Himno sin titulo'}`,
    displayMeta: (row) => `Tono ${row.original_key || 'C'} · ${row.is_published ? 'Publicado' : 'Oculto'}`,
    createDefaults: {
      hymn_number: 0,
      title: '',
      slug: '',
      original_key: 'C',
      lyrics: '',
      chords: [],
      is_published: true,
    },
    deactivate: () => ({ is_published: false }),
    fields: [
      { name: 'hymn_number', label: 'Numero', kind: 'number', required: true },
      { name: 'title', label: 'Titulo', kind: 'text', required: true },
      { name: 'slug', label: 'Slug', kind: 'text' },
      { name: 'original_key', label: 'Tono', kind: 'text' },
      { name: 'lyrics', label: 'Letra', kind: 'textarea', required: true },
      { name: 'is_published', label: 'Publicado', kind: 'boolean' },
    ],
  },
  resources: {
    kind: 'resources',
    title: 'Recursos',
    eyebrow: 'Biblioteca',
    description: 'Administra materiales descargables y enlaces de recursos.',
    table: 'resources',
    orderBy: 'title',
    select: 'id, title, description, category, is_premium, is_published',
    displayTitle: (row) => String(row.title || 'Recurso sin titulo'),
    displayMeta: (row) => `${row.category || 'Recurso'} · ${row.is_published ? 'Publicado' : 'Oculto'}`,
    createDefaults: {
      title: '',
      description: '',
      category: 'Guías Prácticas',
      is_premium: false,
      is_published: true,
    },
    deactivate: () => ({ is_published: false }),
    fields: [
      { name: 'title', label: 'Titulo', kind: 'text', required: true },
      { name: 'description', label: 'Descripcion', kind: 'textarea', required: true },
      {
        name: 'category',
        label: 'Categoria',
        kind: 'select',
        options: ['PDF Acordes', 'Guías Prácticas', 'Pistas / Audio', 'Partituras'],
      },
      { name: 'is_premium', label: 'Premium', kind: 'boolean' },
      { name: 'is_published', label: 'Publicado', kind: 'boolean' },
    ],
  },
  profiles: {
    kind: 'profiles',
    title: 'Usuarios',
    eyebrow: 'Accesos',
    description: 'Revisa usuarios y actualiza rol real desde profiles.role.',
    table: 'profiles',
    orderBy: 'email',
    select: 'id, email, full_name, auth_provider, is_premium, role',
    displayTitle: (row) => String(row.email || 'Usuario sin correo'),
    displayMeta: (row) => `${row.role || 'member'} · ${row.auth_provider || 'email'}`,
    createDefaults: {
      email: '',
      full_name: '',
      auth_provider: 'email',
      is_premium: false,
      role: 'member',
    },
    allowCreate: false,
    fields: [
      { name: 'email', label: 'Correo', kind: 'text', required: true },
      { name: 'full_name', label: 'Nombre', kind: 'text' },
      { name: 'auth_provider', label: 'Proveedor', kind: 'text' },
      { name: 'role', label: 'Rol', kind: 'select', required: true, options: ['member', 'premium', 'admin'] },
      { name: 'is_premium', label: 'Premium', kind: 'boolean' },
    ],
  },
};
