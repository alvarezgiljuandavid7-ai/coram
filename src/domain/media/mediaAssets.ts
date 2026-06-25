import { supabase } from '../../shared/supabase/client';

export type MediaAssetType = 'image' | 'video' | 'pdf' | 'audio' | 'document';
export type MediaAssetVisibility = 'public' | 'private' | 'premium';
export type CoramMediaBucket = 'course-images' | 'course-videos' | 'resources' | 'avatars' | 'sponsors';

export interface UploadMediaAssetInput {
  file: File;
  bucketId: CoramMediaBucket;
  assetType: MediaAssetType;
  visibility: MediaAssetVisibility;
  linkedEntityType?: 'course' | 'lesson' | 'resource' | 'profile' | 'sponsor' | 'ad';
  linkedEntityId?: string;
}

export interface UploadedMediaAsset {
  id: string;
  bucketId: CoramMediaBucket;
  objectPath: string;
  publicUrl: string | null;
}

interface MediaAssetRow {
  id: string;
  bucket_id: CoramMediaBucket;
  object_path: string;
  public_url: string | null;
}

const extensionFallbacks: Record<MediaAssetType, string> = {
  image: 'jpg',
  video: 'mp4',
  pdf: 'pdf',
  audio: 'mp3',
  document: 'bin',
};

function sanitizeFileSegment(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 72);
}

export function buildMediaObjectPath(fileName: string, assetType: MediaAssetType, ownerId: string): string {
  const cleanOwnerId = sanitizeFileSegment(ownerId) || 'anonymous';
  const rawName = fileName.trim() || `asset.${extensionFallbacks[assetType]}`;
  const extension = rawName.includes('.') ? rawName.split('.').pop() : extensionFallbacks[assetType];
  const baseName = sanitizeFileSegment(rawName.replace(/\.[^.]+$/, '')) || 'asset';
  const uniqueSuffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;

  return `${cleanOwnerId}/${assetType}/${baseName}-${uniqueSuffix}.${extension}`;
}

export async function uploadMediaAsset(input: UploadMediaAssetInput): Promise<UploadedMediaAsset> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('Debes iniciar sesión como administrador para subir archivos.');
  }

  const objectPath = buildMediaObjectPath(input.file.name, input.assetType, userData.user.id);
  const { error: uploadError } = await supabase.storage
    .from(input.bucketId)
    .upload(objectPath, input.file, {
      cacheControl: '3600',
      upsert: false,
      contentType: input.file.type || undefined,
    });

  if (uploadError) {
    throw uploadError;
  }

  const publicUrl =
    input.visibility === 'public'
      ? supabase.storage.from(input.bucketId).getPublicUrl(objectPath).data.publicUrl
      : null;

  const { data, error: metadataError } = await supabase
    .from('media_assets')
    .insert({
      bucket_id: input.bucketId,
      object_path: objectPath,
      original_name: input.file.name,
      mime_type: input.file.type || 'application/octet-stream',
      size_bytes: input.file.size,
      asset_type: input.assetType,
      visibility: input.visibility,
      owner_id: userData.user.id,
      linked_entity_type: input.linkedEntityType ?? null,
      linked_entity_id: input.linkedEntityId ?? null,
      public_url: publicUrl,
    })
    .select('id, bucket_id, object_path, public_url')
    .single();

  if (metadataError) {
    await supabase.storage.from(input.bucketId).remove([objectPath]);
    throw metadataError;
  }

  const row = data as MediaAssetRow;

  return {
    id: row.id,
    bucketId: row.bucket_id,
    objectPath: row.object_path,
    publicUrl: row.public_url,
  };
}
