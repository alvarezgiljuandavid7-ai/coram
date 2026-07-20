import { supabase } from '../../shared/supabase/client';

export interface RepertoireSong {
  id: string;
  ownerUserId: string | null;
  organizationId: string | null;
  title: string;
  artist: string | null;
  musicalKey: string | null;
  bpm: number | null;
  lyrics: string | null;
  chords: string | null;
  notes: string | null;
  status: 'active' | 'archived';
  updatedAt: string;
}

export interface SongInput {
  title: string;
  artist?: string;
  musicalKey?: string;
  bpm?: number | null;
  lyrics?: string;
  chords?: string;
  notes?: string;
}

type ClientLike = { from: (table: string) => any; rpc: (name: string, args?: Record<string, unknown>) => any };
export interface RepertoireError extends Error { code: 'PERSONAL_SONG_LIMIT' | 'FORBIDDEN' | 'UNKNOWN' }

export function mapRepertoireError(error: { message?: string; code?: string }): RepertoireError {
  const message = error.message ?? 'No fue posible completar la operación.';
  let code: RepertoireError['code'] = 'UNKNOWN';
  if (message.includes('personal_song_limit_reached')) code = 'PERSONAL_SONG_LIMIT';
  if (error.code === '42501' || message.includes('forbidden')) code = 'FORBIDDEN';
  return Object.assign(new Error(message), { code });
}

const select = 'id, owner_user_id, organization_id, title, artist, musical_key, bpm, lyrics, chords, notes, status, updated_at';
function mapSong(row: any): RepertoireSong { return { id:row.id, ownerUserId:row.owner_user_id, organizationId:row.organization_id, title:row.title, artist:row.artist, musicalKey:row.musical_key, bpm:row.bpm, lyrics:row.lyrics, chords:row.chords, notes:row.notes, status:row.status, updatedAt:row.updated_at }; }
function requireClient(client: ClientLike | null): asserts client is ClientLike { if (!client) throw mapRepertoireError({message:'Supabase no está configurado.'}); }
const rpcInput = (input: SongInput) => ({ p_title:input.title, p_artist:input.artist ?? null, p_musical_key:input.musicalKey ?? null, p_bpm:input.bpm ?? null, p_lyrics:input.lyrics ?? null, p_chords:input.chords ?? null, p_notes:input.notes ?? null });
const updateInput = (input: Partial<SongInput>) => ({ ...(input.title!==undefined?{title:input.title}:{}), ...(input.artist!==undefined?{artist:input.artist||null}:{}), ...(input.musicalKey!==undefined?{musical_key:input.musicalKey||null}:{}), ...(input.bpm!==undefined?{bpm:input.bpm}:{}), ...(input.lyrics!==undefined?{lyrics:input.lyrics||null}:{}), ...(input.chords!==undefined?{chords:input.chords||null}:{}), ...(input.notes!==undefined?{notes:input.notes||null}:{}) });

export function createRepertoireRepository(client: ClientLike | null) {
  async function listBy(column: 'owner_user_id' | 'organization_id', id: string, search?: string) {
    requireClient(client); let query = client.from('songs').select(select).eq(column,id).eq('status','active');
    if (search?.trim()) query = query.ilike('title',`%${search.trim()}%`);
    const {data,error}=await query.order('updated_at'); if(error) throw mapRepertoireError(error); return (data??[]).map(mapSong);
  }
  return {
    listPersonalSongs: (userId:string,search?:string)=>listBy('owner_user_id',userId,search),
    listOrganizationSongs: (organizationId:string,search?:string)=>listBy('organization_id',organizationId,search),
    async getPersonalSong(songId:string,userId:string){requireClient(client);const {data,error}=await client.from('songs').select(select).eq('id',songId).eq('owner_user_id',userId).single();if(error)throw mapRepertoireError(error);return mapSong(data);},
    async getOrganizationSong(songId:string,organizationId:string){requireClient(client);const {data,error}=await client.from('songs').select(select).eq('id',songId).eq('organization_id',organizationId).single();if(error)throw mapRepertoireError(error);return mapSong(data);},
    async createPersonalSong(input:SongInput){requireClient(client);const {data,error}=await client.rpc('create_personal_song',rpcInput(input));if(error)throw mapRepertoireError(error);return mapSong(data);},
    async createOrganizationSong(organizationId:string,input:SongInput){requireClient(client);const {data,error}=await client.rpc('create_organization_song',{p_organization_id:organizationId,...rpcInput(input)});if(error)throw mapRepertoireError(error);return mapSong(data);},
    async updatePersonalSong(songId:string,userId:string,input:Partial<SongInput>){requireClient(client);const {error}=await client.from('songs').update(updateInput(input)).eq('id',songId).eq('owner_user_id',userId);if(error)throw mapRepertoireError(error);},
    async updateOrganizationSong(songId:string,organizationId:string,input:Partial<SongInput>){requireClient(client);const {error}=await client.from('songs').update(updateInput(input)).eq('id',songId).eq('organization_id',organizationId);if(error)throw mapRepertoireError(error);},
    async deletePersonalSong(songId:string,userId:string){requireClient(client);const {error}=await client.from('songs').delete().eq('id',songId).eq('owner_user_id',userId);if(error)throw mapRepertoireError(error);},
    async deleteOrganizationSong(songId:string,organizationId:string){requireClient(client);const {error}=await client.from('songs').delete().eq('id',songId).eq('organization_id',organizationId);if(error)throw mapRepertoireError(error);},
    async addSongToService(serviceId:string,organizationId:string,songId:string,position=0){requireClient(client);const {error}=await client.from('service_songs').upsert({service_id:serviceId,organization_id:organizationId,song_id:songId,position});if(error)throw mapRepertoireError(error);},
  };
}
export const repertoireRepository=createRepertoireRepository(supabase);
