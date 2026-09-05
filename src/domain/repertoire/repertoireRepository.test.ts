import { describe, expect, it } from 'vitest';
import { createRepertoireRepository, mapRepertoireError } from './repertoireRepository';

type Call = { kind: string; table?: string; name?: string; values?: unknown; args?: unknown };
function fakeClient(data: unknown = []) {
  const calls: Call[] = []; const response = Promise.resolve({ data, error: null });
  const chain = { select:(v?:string)=>{calls.push({kind:'select',values:v});return chain;}, update:(v:unknown)=>{calls.push({kind:'update',values:v});return chain;}, delete:()=>{calls.push({kind:'delete'});return chain;}, eq:(name:string,v:unknown)=>{calls.push({kind:'eq',name,values:v});return chain;}, ilike:(name:string,v:unknown)=>{calls.push({kind:'ilike',name,values:v});return chain;}, order:(name:string)=>{calls.push({kind:'order',name});return chain;}, single:()=>response, then:response.then.bind(response) };
  return { calls, client: { from(table:string){calls.push({kind:'from',table});return chain;}, rpc(name:string,args:unknown){calls.push({kind:'rpc',name,args});return response;} } };
}

describe('repertoireRepository ownership', () => {
  it('lists personal songs only by owner_user_id', async () => {
    const { client, calls } = fakeClient(); await createRepertoireRepository(client).listPersonalSongs('user-a');
    expect(calls).toContainEqual({kind:'eq',name:'owner_user_id',values:'user-a'});
    expect(calls.some((call)=>call.name==='organization_id')).toBe(false);
  });
  it('lists ministry songs only by organization_id', async () => {
    const { client, calls } = fakeClient(); await createRepertoireRepository(client).listOrganizationSongs('org-a');
    expect(calls).toContainEqual({kind:'eq',name:'organization_id',values:'org-a'});
    expect(calls.some((call)=>call.name==='owner_user_id')).toBe(false);
  });
  it('creates personal songs through an authenticated RPC without owner input', async () => {
    const { client, calls } = fakeClient({id:'song-1',title:'Santo'}); await createRepertoireRepository(client).createPersonalSong({title:'Santo', musicalKey:'C'});
    expect(calls).toContainEqual({kind:'rpc',name:'create_personal_song',args:expect.objectContaining({p_title:'Santo',p_musical_key:'C'})});
  });
  it('creates ministry songs with organization scope and server-authenticated creator', async () => {
    const { client, calls } = fakeClient({id:'song-2',title:'Digno'}); await createRepertoireRepository(client).createOrganizationSong('org-a',{title:'Digno'});
    expect(calls).toContainEqual({kind:'rpc',name:'create_organization_song',args:expect.objectContaining({p_organization_id:'org-a',p_title:'Digno'})});
  });
});

describe('mapRepertoireError', () => {
  it('maps the Free hard limit without discarding existing songs', () => {
    expect(mapRepertoireError({message:'personal_song_limit_reached'}).code).toBe('PERSONAL_SONG_LIMIT');
  });
});
