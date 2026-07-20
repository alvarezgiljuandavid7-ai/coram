begin;

create or replace function public.create_personal_song(
  p_title text, p_artist text default null, p_musical_key text default null,
  p_bpm integer default null, p_lyrics text default null, p_chords text default null,
  p_notes text default null
)
returns public.songs
language plpgsql security definer set search_path = public
as $$
declare created_song public.songs;
begin
  if auth.uid() is null then raise exception using errcode='42501',message='personal_song_create_forbidden'; end if;
  insert into public.songs(owner_user_id,organization_id,created_by,title,artist,musical_key,bpm,lyrics,chords,notes)
  values(auth.uid(),null,auth.uid(),trim(p_title),nullif(trim(p_artist),''),nullif(trim(p_musical_key),''),p_bpm,nullif(trim(p_lyrics),''),nullif(trim(p_chords),''),nullif(trim(p_notes),''))
  returning * into created_song;
  return created_song;
end;
$$;

create or replace function public.create_organization_song(
  p_organization_id uuid, p_title text, p_artist text default null,
  p_musical_key text default null, p_bpm integer default null, p_lyrics text default null,
  p_chords text default null, p_notes text default null
)
returns public.songs
language plpgsql security definer set search_path = public
as $$
declare created_song public.songs;
begin
  if auth.uid() is null or not public.has_organization_role(p_organization_id,array['owner','admin','leader']) then
    raise exception using errcode='42501',message='organization_song_create_forbidden';
  end if;
  insert into public.songs(owner_user_id,organization_id,created_by,title,artist,musical_key,bpm,lyrics,chords,notes)
  values(null,p_organization_id,auth.uid(),trim(p_title),nullif(trim(p_artist),''),nullif(trim(p_musical_key),''),p_bpm,nullif(trim(p_lyrics),''),nullif(trim(p_chords),''),nullif(trim(p_notes),''))
  returning * into created_song;
  return created_song;
end;
$$;

revoke all on function public.create_personal_song(text,text,text,integer,text,text,text) from public;
grant execute on function public.create_personal_song(text,text,text,integer,text,text,text) to authenticated;
revoke all on function public.create_organization_song(uuid,text,text,text,integer,text,text,text) from public;
grant execute on function public.create_organization_song(uuid,text,text,text,integer,text,text,text) to authenticated;

commit;
