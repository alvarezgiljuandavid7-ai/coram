import { supabase } from '../../shared/supabase/client';
import type { CoramAuthProfile } from '../auth/authRepository';
import { removeMediaAssetByUrl, type CoramMediaBucket, type MediaAssetType, type UploadMediaAssetInput } from '../media/mediaAssets';

export type AdminContentKind =
  | 'courses'
  | 'corarios'
  | 'hymns'
  | 'resources'
  | 'profiles'
  | 'campaigns'
  | 'advertisements'
  | 'featured_videos'
  | 'home_banners'
  | 'affiliate_partners'
  | 'affiliate_courses'
  | 'sponsor_campaigns'
  | 'sponsor_placements'
  | 'feed_posts';

export type AdminFieldKind = 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'datetime-local' | 'file';

export interface AdminFieldConfig {
  name: string;
  label: string;
  kind: AdminFieldKind;
  required?: boolean;
  options?: string[];
  targetField?: string;
  bucketId?: CoramMediaBucket;
  assetType?: MediaAssetType;
  linkedEntityType?: UploadMediaAssetInput['linkedEntityType'];
}

export interface AdminCrudConfig {
  kind: AdminContentKind;
  title: string;
  eyebrow: string;
  description: string;
  table: string;
  orderBy: string;
  orderAscending?: boolean;
  select: string;
  fields: AdminFieldConfig[];
  displayTitle: (row: AdminRecord) => string;
  displayMeta: (row: AdminRecord) => string;
  createDefaults: AdminRecord;
  deactivate?: (row: AdminRecord) => AdminRecord;
  allowCreate?: boolean;
  allowDelete?: boolean;
  searchableFields?: string[];
  filterField?: string;
  filterOptions?: string[];
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
    .order(config.orderBy, { ascending: config.orderAscending ?? true });

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
  record?: AdminRecord,
): Promise<void> {
  requireAdmin(profile);
  const client = requireSupabase();

  if (record) {
    const mediaFields = config.fields
      .filter((field) => field.kind === 'file' && field.targetField)
      .map((field) => String(field.targetField));

    await Promise.all(
      mediaFields.map((fieldName) => removeMediaAssetByUrl(typeof record[fieldName] === 'string' ? record[fieldName] : null)),
    );
  }

  const { error } = await client.from(config.table).delete().eq('id', id);

  if (error) throw error;
}

const MANANTIAL_COLLECTION_ID = '54996706-c783-42ae-9b88-6213b82ae91e';
const statusOptions = ['draft', 'published', 'archived'];

export const adminCrudConfigs: Record<AdminContentKind, AdminCrudConfig> = {
  courses: {
    kind: 'courses',
    title: 'Cursos',
    eyebrow: 'Academia',
    description: 'Publica y administra cursos visibles en la academia CorAM.',
    table: 'courses',
    orderBy: 'title',
    select: 'id, title, description, instructor, image_url, video_url, is_premium, is_published, status',
    displayTitle: (row) => String(row.title || 'Curso sin titulo'),
    displayMeta: (row) => `${row.instructor || 'CorAM'} / ${row.status || (row.is_published ? 'published' : 'draft')}`,
    createDefaults: {
      title: '',
      description: '',
      instructor: 'CorAM',
      image_url: '',
      video_url: '',
      is_premium: false,
      is_published: true,
      status: 'published',
    },
    deactivate: () => ({ status: 'archived' }),
    searchableFields: ['title', 'description', 'instructor'],
    filterField: 'status',
    filterOptions: statusOptions,
    fields: [
      { name: 'title', label: 'Titulo', kind: 'text', required: true },
      { name: 'description', label: 'Descripcion', kind: 'textarea', required: true },
      { name: 'instructor', label: 'Instructor', kind: 'text' },
      { name: 'image_upload', label: 'Subir imagen', kind: 'file', targetField: 'image_url', bucketId: 'course-images', assetType: 'image', linkedEntityType: 'course' },
      { name: 'image_url', label: 'URL de imagen', kind: 'text' },
      { name: 'video_upload', label: 'Subir video', kind: 'file', targetField: 'video_url', bucketId: 'course-videos', assetType: 'video', linkedEntityType: 'course' },
      { name: 'video_url', label: 'URL de video', kind: 'text' },
      { name: 'is_premium', label: 'Premium', kind: 'boolean' },
      { name: 'status', label: 'Estado', kind: 'select', options: statusOptions, required: true },
    ],
  },
  corarios: {
    kind: 'corarios',
    title: 'Corarios',
    eyebrow: 'Biblioteca',
    description: 'Gestiona letras, tonos y categorias del cancionero. No se mezcla con Himnarios.',
    table: 'corarios',
    orderBy: 'titulo',
    select: 'id, titulo, categoria, tono, letra, premium, audio_url, is_published, status',
    displayTitle: (row) => String(row.titulo || 'Corario sin titulo'),
    displayMeta: (row) => `${row.categoria || 'Corarios'} / Tono ${row.tono || 'C'} / ${row.status || (row.is_published ? 'published' : 'draft')}`,
    createDefaults: {
      titulo: '',
      categoria: 'Corarios',
      tono: 'C',
      letra: '',
      premium: false,
      audio_url: '',
      is_published: true,
      status: 'published',
    },
    allowDelete: true,
    deactivate: () => ({ status: 'archived' }),
    searchableFields: ['titulo', 'categoria', 'tono', 'letra'],
    filterField: 'status',
    filterOptions: statusOptions,
    fields: [
      { name: 'titulo', label: 'Titulo', kind: 'text', required: true },
      { name: 'categoria', label: 'Categoria', kind: 'text' },
      { name: 'tono', label: 'Tono', kind: 'text' },
      { name: 'letra', label: 'Letra', kind: 'textarea', required: true },
      { name: 'audio_upload', label: 'Subir audio', kind: 'file', targetField: 'audio_url', bucketId: 'resources', assetType: 'audio', linkedEntityType: 'resource' },
      { name: 'audio_url', label: 'URL de audio', kind: 'text' },
      { name: 'premium', label: 'Premium', kind: 'boolean' },
      { name: 'status', label: 'Estado', kind: 'select', options: statusOptions, required: true },
    ],
  },
  hymns: {
    kind: 'hymns',
    title: 'Himnarios',
    eyebrow: 'Himnario',
    description: 'Edita himnos del Himnario Manantial y su publicacion. Separado de Corarios.',
    table: 'hymns',
    orderBy: 'hymn_number',
    select: 'id, collection_id, hymn_number, title, slug, original_key, lyrics, chords, is_published, status',
    displayTitle: (row) => `${row.hymn_number || '-'} / ${row.title || 'Himno sin titulo'}`,
    displayMeta: (row) => `Tono ${row.original_key || 'C'} / ${row.status || (row.is_published ? 'published' : 'draft')}`,
    createDefaults: {
      collection_id: MANANTIAL_COLLECTION_ID,
      hymn_number: 0,
      title: '',
      slug: '',
      original_key: 'C',
      lyrics: '',
      chords: [],
      is_published: true,
      status: 'published',
    },
    deactivate: () => ({ status: 'archived' }),
    searchableFields: ['title', 'lyrics', 'original_key'],
    filterField: 'status',
    filterOptions: statusOptions,
    fields: [
      { name: 'hymn_number', label: 'Numero', kind: 'number', required: true },
      { name: 'title', label: 'Titulo', kind: 'text', required: true },
      { name: 'slug', label: 'Slug', kind: 'text' },
      { name: 'original_key', label: 'Tono', kind: 'text' },
      { name: 'lyrics', label: 'Letra', kind: 'textarea', required: true },
      { name: 'status', label: 'Estado', kind: 'select', options: statusOptions, required: true },
    ],
  },
  resources: {
    kind: 'resources',
    title: 'Recursos',
    eyebrow: 'Biblioteca',
    description: 'Administra materiales descargables y enlaces de recursos.',
    table: 'resources',
    orderBy: 'title',
    select: 'id, title, description, category, file_url, is_premium, is_published, status',
    displayTitle: (row) => String(row.title || 'Recurso sin titulo'),
    displayMeta: (row) => `${row.category || 'Recurso'} / ${row.status || (row.is_published ? 'published' : 'draft')}`,
    createDefaults: {
      title: '',
      description: '',
      category: 'Guias Practicas',
      file_url: '',
      is_premium: false,
      is_published: true,
      status: 'published',
    },
    deactivate: () => ({ status: 'archived' }),
    searchableFields: ['title', 'description', 'category'],
    filterField: 'status',
    filterOptions: statusOptions,
    fields: [
      { name: 'title', label: 'Titulo', kind: 'text', required: true },
      { name: 'description', label: 'Descripcion', kind: 'textarea', required: true },
      { name: 'category', label: 'Categoria', kind: 'select', options: ['PDF Acordes', 'Guias Practicas', 'Pistas / Audio', 'Partituras'] },
      { name: 'file_upload', label: 'Subir archivo', kind: 'file', targetField: 'file_url', bucketId: 'resources', assetType: 'document', linkedEntityType: 'resource' },
      { name: 'file_url', label: 'URL de archivo', kind: 'text' },
      { name: 'is_premium', label: 'Premium', kind: 'boolean' },
      { name: 'status', label: 'Estado', kind: 'select', options: statusOptions, required: true },
    ],
  },
  campaigns: {
    kind: 'campaigns',
    title: 'Campanas',
    eyebrow: 'Inicio',
    description: 'Publica campanas, eventos, novedades y llamados destacados para el inicio.',
    table: 'campaigns',
    orderBy: 'sort_order',
    select: 'id, title, subtitle, body, image_url, cta_label, cta_url, status, starts_at, ends_at, sort_order',
    displayTitle: (row) => String(row.title || 'Campana sin titulo'),
    displayMeta: (row) => `${row.status || 'draft'} / Orden ${row.sort_order ?? 0}`,
    createDefaults: {
      title: '',
      subtitle: '',
      body: '',
      image_url: '',
      cta_label: 'Abrir',
      cta_url: '/app/inicio',
      status: 'draft',
      starts_at: '',
      ends_at: '',
      sort_order: 0,
    },
    deactivate: () => ({ status: 'archived' }),
    searchableFields: ['title', 'subtitle', 'body'],
    filterField: 'status',
    filterOptions: statusOptions,
    fields: [
      { name: 'title', label: 'Titulo', kind: 'text', required: true },
      { name: 'subtitle', label: 'Subtitulo', kind: 'text' },
      { name: 'body', label: 'Descripcion', kind: 'textarea' },
      { name: 'image_upload', label: 'Subir imagen', kind: 'file', targetField: 'image_url', bucketId: 'campaigns', assetType: 'image', linkedEntityType: 'campaign' },
      { name: 'image_url', label: 'URL de imagen', kind: 'text' },
      { name: 'cta_label', label: 'Texto del boton', kind: 'text' },
      { name: 'cta_url', label: 'Ruta o URL del boton', kind: 'text' },
      { name: 'status', label: 'Estado', kind: 'select', options: statusOptions, required: true },
      { name: 'starts_at', label: 'Inicia', kind: 'datetime-local' },
      { name: 'ends_at', label: 'Termina', kind: 'datetime-local' },
      { name: 'sort_order', label: 'Orden', kind: 'number' },
    ],
  },
  advertisements: {
    kind: 'advertisements',
    title: 'Publicidad',
    eyebrow: 'Anuncios',
    description: 'LEGACY: usa Campañas patrocinadas y Ubicaciones sponsor. Administra anuncios visibles cuando esten activos.',
    table: 'advertisements',
    orderBy: 'created_at',
    orderAscending: false,
    select: 'id, title, sponsor_id, placement, image_url, target_url, status, starts_at, ends_at, views_count, clicks_count',
    displayTitle: (row) => String(row.title || 'Anuncio sin titulo'),
    displayMeta: (row) => `${row.placement || 'app'} / ${row.status || 'draft'}`,
    createDefaults: {
      title: '',
      sponsor_id: null,
      placement: 'home',
      image_url: '',
      target_url: '',
      status: 'draft',
      starts_at: '',
      ends_at: '',
      views_count: 0,
      clicks_count: 0,
    },
    deactivate: () => ({ status: 'ended' }),
    searchableFields: ['title', 'placement'],
    filterField: 'status',
    filterOptions: ['draft', 'active', 'paused', 'ended'],
    fields: [
      { name: 'title', label: 'Titulo', kind: 'text', required: true },
      { name: 'placement', label: 'Ubicacion', kind: 'text' },
      { name: 'image_upload', label: 'Subir imagen', kind: 'file', targetField: 'image_url', bucketId: 'sponsors', assetType: 'image', linkedEntityType: 'ad' },
      { name: 'image_url', label: 'URL de imagen', kind: 'text' },
      { name: 'target_url', label: 'URL destino', kind: 'text' },
      { name: 'status', label: 'Estado', kind: 'select', options: ['draft', 'active', 'paused', 'ended'], required: true },
      { name: 'starts_at', label: 'Inicia', kind: 'datetime-local' },
      { name: 'ends_at', label: 'Termina', kind: 'datetime-local' },
    ],
  },
  featured_videos: {
    kind: 'featured_videos',
    title: 'Videos destacados',
    eyebrow: 'Contenido',
    description: 'Gestiona videos destacados que aparecen en el inicio.',
    table: 'featured_videos',
    orderBy: 'sort_order',
    select: 'id, title, description, category, thumbnail_url, video_url, duration, status, is_featured, sort_order',
    displayTitle: (row) => String(row.title || 'Video sin titulo'),
    displayMeta: (row) => `${row.category || 'Video'} / ${row.status || 'draft'}`,
    createDefaults: {
      title: '',
      description: '',
      category: 'Clase',
      thumbnail_url: '',
      video_url: '',
      duration: '',
      status: 'draft',
      is_featured: true,
      sort_order: 0,
    },
    deactivate: () => ({ status: 'archived' }),
    searchableFields: ['title', 'description', 'category'],
    filterField: 'status',
    filterOptions: statusOptions,
    fields: [
      { name: 'title', label: 'Titulo', kind: 'text', required: true },
      { name: 'description', label: 'Descripcion', kind: 'textarea' },
      { name: 'category', label: 'Categoria', kind: 'text' },
      { name: 'thumbnail_upload', label: 'Subir miniatura', kind: 'file', targetField: 'thumbnail_url', bucketId: 'videos', assetType: 'image', linkedEntityType: 'featured_video' },
      { name: 'thumbnail_url', label: 'URL miniatura', kind: 'text' },
      { name: 'video_upload', label: 'Subir video', kind: 'file', targetField: 'video_url', bucketId: 'videos', assetType: 'video', linkedEntityType: 'featured_video' },
      { name: 'video_url', label: 'URL video', kind: 'text' },
      { name: 'duration', label: 'Duracion', kind: 'text' },
      { name: 'status', label: 'Estado', kind: 'select', options: statusOptions, required: true },
      { name: 'is_featured', label: 'Destacado', kind: 'boolean' },
      { name: 'sort_order', label: 'Orden', kind: 'number' },
    ],
  },
  home_banners: {
    kind: 'home_banners',
    title: 'Banners del inicio',
    eyebrow: 'Inicio',
    description: 'Controla los banners principales que alimentan la pantalla de inicio.',
    table: 'home_banners',
    orderBy: 'sort_order',
    select: 'id, title, subtitle, body, image_url, cta_label, cta_url, placement, status, sort_order',
    displayTitle: (row) => String(row.title || 'Banner sin titulo'),
    displayMeta: (row) => `${row.placement || 'home'} / ${row.status || 'draft'}`,
    createDefaults: {
      title: '',
      subtitle: '',
      body: '',
      image_url: '',
      cta_label: 'Abrir',
      cta_url: '/app/inicio',
      placement: 'home',
      status: 'draft',
      sort_order: 0,
    },
    deactivate: () => ({ status: 'archived' }),
    searchableFields: ['title', 'subtitle', 'body', 'placement'],
    filterField: 'status',
    filterOptions: statusOptions,
    fields: [
      { name: 'title', label: 'Titulo', kind: 'text', required: true },
      { name: 'subtitle', label: 'Subtitulo', kind: 'text' },
      { name: 'body', label: 'Descripcion', kind: 'textarea' },
      { name: 'image_upload', label: 'Subir imagen', kind: 'file', targetField: 'image_url', bucketId: 'banners', assetType: 'image', linkedEntityType: 'banner' },
      { name: 'image_url', label: 'URL de imagen', kind: 'text' },
      { name: 'cta_label', label: 'Texto del boton', kind: 'text' },
      { name: 'cta_url', label: 'Ruta o URL del boton', kind: 'text' },
      { name: 'placement', label: 'Ubicacion', kind: 'text' },
      { name: 'status', label: 'Estado', kind: 'select', options: statusOptions, required: true },
      { name: 'sort_order', label: 'Orden', kind: 'number' },
    ],
  },
  sponsor_campaigns: {
    kind:'sponsor_campaigns',title:'Campañas patrocinadas',eyebrow:'Monetización',description:'Gestiona campañas rotuladas, vigencia, prioridad y frecuencia.',table:'sponsor_campaigns',orderBy:'priority',orderAscending:false,
    select:'id, sponsor_name, label, title, body, image_url, destination_url, status, starts_at, ends_at, priority, frequency_cap_per_day',displayTitle:(row)=>String(row.title||'Campaña sin título'),displayMeta:(row)=>`${row.sponsor_name||'Sponsor'} / ${row.status||'draft'}`,
    createDefaults:{sponsor_name:'',label:'Contenido patrocinado',title:'',body:'',image_url:'',destination_url:'',status:'draft',starts_at:'',ends_at:'',priority:0,frequency_cap_per_day:3},deactivate:()=>({status:'archived'}),searchableFields:['sponsor_name','title','body'],filterField:'status',filterOptions:['draft','active','paused','archived'],
    fields:[{name:'sponsor_name',label:'Patrocinador',kind:'text',required:true},{name:'label',label:'Rótulo',kind:'text',required:true},{name:'title',label:'Título',kind:'text',required:true},{name:'body',label:'Descripción',kind:'textarea'},{name:'image_url',label:'URL imagen',kind:'text'},{name:'destination_url',label:'URL destino',kind:'text',required:true},{name:'status',label:'Estado',kind:'select',options:['draft','active','paused','archived'],required:true},{name:'starts_at',label:'Inicio',kind:'datetime-local'},{name:'ends_at',label:'Fin',kind:'datetime-local'},{name:'priority',label:'Prioridad',kind:'number'},{name:'frequency_cap_per_day',label:'Frecuencia diaria',kind:'number',required:true}],
  },
  sponsor_placements: {
    kind:'sponsor_placements',title:'Ubicaciones patrocinadas',eyebrow:'Monetización',description:'Asigna campañas únicamente a Home, Academia o Recursos.',table:'sponsor_placements',orderBy:'created_at',orderAscending:false,
    select:'id, campaign_id, placement, enabled, created_at',displayTitle:(row)=>String(row.placement||'Placement'),displayMeta:(row)=>`${row.campaign_id||''} / ${row.enabled?'activo':'inactivo'}`,
    createDefaults:{campaign_id:'',placement:'home',enabled:true},searchableFields:['campaign_id','placement'],filterField:'placement',filterOptions:['home','academia','recursos'],
    fields:[{name:'campaign_id',label:'ID campaña',kind:'text',required:true},{name:'placement',label:'Ubicación',kind:'select',options:['home','academia','recursos'],required:true},{name:'enabled',label:'Activo',kind:'boolean'}],
  },
  feed_posts: {
    kind: 'feed_posts',
    title: 'Feed curado',
    eyebrow: 'Experiencia inmersiva',
    description: 'Publica historias, anuncios y recursos en el feed inmersivo de CorAM.',
    table: 'feed_posts',
    orderBy: 'sort_order',
    select: 'id, title, body, media_url, media_type, cta_label, cta_url, author_name, status, sort_order, published_at',
    displayTitle: (row) => String(row.title || 'Publicacion sin titulo'),
    displayMeta: (row) => `${row.status || 'draft'} / Orden ${row.sort_order ?? 0}`,
    createDefaults: {
      title: '',
      body: '',
      media_url: '',
      media_type: 'image',
      cta_label: 'Abrir',
      cta_url: '',
      author_name: 'CorAM',
      status: 'draft',
      sort_order: 0,
      published_at: '',
    },
    deactivate: () => ({ status: 'archived' }),
    searchableFields: ['title', 'body', 'author_name'],
    filterField: 'status',
    filterOptions: statusOptions,
    fields: [
      { name: 'title', label: 'Titulo', kind: 'text', required: true },
      { name: 'body', label: 'Texto', kind: 'textarea' },
      { name: 'media_url', label: 'URL de imagen o video', kind: 'text' },
      { name: 'media_type', label: 'Tipo de medio', kind: 'select', options: ['image', 'video'], required: true },
      { name: 'cta_label', label: 'Texto del boton', kind: 'text' },
      { name: 'cta_url', label: 'Ruta interna o URL HTTPS', kind: 'text' },
      { name: 'author_name', label: 'Autor', kind: 'text', required: true },
      { name: 'status', label: 'Estado', kind: 'select', options: statusOptions, required: true },
      { name: 'published_at', label: 'Publicar desde', kind: 'datetime-local' },
      { name: 'sort_order', label: 'Orden', kind: 'number' },
    ],
  },
  affiliate_partners: {
    kind: 'affiliate_partners', title: 'Partners afiliados', eyebrow: 'Alianzas',
    description: 'Configura aliados, dominios permitidos y disclosure obligatorio.',
    table: 'affiliate_partners', orderBy: 'name',
    select: 'id, name, slug, allowed_domains, disclosure, status, created_at',
    displayTitle: (row) => String(row.name || 'Partner sin nombre'),
    displayMeta: (row) => `${row.status || 'draft'} / ${Array.isArray(row.allowed_domains) ? row.allowed_domains.join(', ') : ''}`,
    createDefaults: { name: '', slug: '', allowed_domains: [], disclosure: 'CorAM puede recibir una comisión si compras mediante este enlace.', status: 'draft' },
    deactivate: () => ({ status: 'archived' }), searchableFields: ['name', 'slug'], filterField: 'status', filterOptions: statusOptions,
    fields: [
      { name: 'name', label: 'Nombre', kind: 'text', required: true },
      { name: 'slug', label: 'Slug', kind: 'text', required: true },
      { name: 'allowed_domains', label: 'Dominios (formato {dominio.com})', kind: 'text', required: true },
      { name: 'disclosure', label: 'Disclosure de afiliado', kind: 'textarea', required: true },
      { name: 'status', label: 'Estado', kind: 'select', options: statusOptions, required: true },
    ],
  },
  affiliate_courses: {
    kind: 'affiliate_courses', title: 'Cursos afiliados', eyebrow: 'Alianzas',
    description: 'Publica recomendaciones verificadas; el destino se valida en el servidor.',
    table: 'affiliate_courses', orderBy: 'position',
    select: 'id, partner_id, title, description, thumbnail_url, video_url, destination_url, coupon_code, featured, position, status, published_at',
    displayTitle: (row) => String(row.title || 'Curso sin título'), displayMeta: (row) => `${row.status || 'draft'} / Orden ${row.position ?? 0}`,
    createDefaults: { partner_id: '', title: '', description: '', thumbnail_url: '', video_url: '', destination_url: '', coupon_code: '', featured: false, position: 0, status: 'draft', published_at: '' },
    deactivate: () => ({ status: 'archived' }), searchableFields: ['title', 'description'], filterField: 'status', filterOptions: statusOptions,
    fields: [
      { name: 'partner_id', label: 'ID del partner', kind: 'text', required: true },
      { name: 'title', label: 'Título', kind: 'text', required: true },
      { name: 'description', label: 'Descripción', kind: 'textarea' },
      { name: 'thumbnail_url', label: 'URL miniatura', kind: 'text' },
      { name: 'video_url', label: 'URL video', kind: 'text' },
      { name: 'destination_url', label: 'URL destino HTTPS', kind: 'text', required: true },
      { name: 'coupon_code', label: 'Cupón', kind: 'text' },
      { name: 'featured', label: 'Destacado', kind: 'boolean' },
      { name: 'position', label: 'Orden', kind: 'number' },
      { name: 'status', label: 'Estado', kind: 'select', options: statusOptions, required: true },
      { name: 'published_at', label: 'Publicado', kind: 'datetime-local' },
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
    displayMeta: (row) => `${row.role || 'member'} / ${row.auth_provider || 'email'}`,
    createDefaults: {
      email: '',
      full_name: '',
      auth_provider: 'email',
      is_premium: false,
      role: 'member',
    },
    allowCreate: false,
    searchableFields: ['email', 'full_name', 'role'],
    filterField: 'role',
    filterOptions: ['member', 'premium', 'admin'],
    fields: [
      { name: 'email', label: 'Correo', kind: 'text', required: true },
      { name: 'full_name', label: 'Nombre', kind: 'text' },
      { name: 'auth_provider', label: 'Proveedor', kind: 'text' },
      { name: 'role', label: 'Rol', kind: 'select', required: true, options: ['member', 'premium', 'admin'] },
      { name: 'is_premium', label: 'Premium', kind: 'boolean' },
    ],
  },
};
