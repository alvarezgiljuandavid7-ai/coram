import { describe, expect, it } from 'vitest';
import { createAffiliateRepository } from './affiliateRepository';

function fakeClient(data:unknown=[]){const calls:Array<Record<string,unknown>>=[];const response=Promise.resolve({data,error:null});const chain={select:(v:string)=>{calls.push({kind:'select',v});return chain;},eq:(name:string,value:unknown)=>{calls.push({kind:'eq',name,value});return chain;},order:(name:string)=>{calls.push({kind:'order',name});return chain;},single:()=>response,then:response.then.bind(response)};return{calls,client:{from:(table:string)=>{calls.push({kind:'from',table});return chain;}}};}
describe('affiliateRepository',()=>{
  it('loads only published courses and published partners',async()=>{const{client,calls}=fakeClient();await createAffiliateRepository(client).listPublished();expect(calls).toContainEqual({kind:'from',table:'affiliate_courses'});expect(calls).toContainEqual({kind:'eq',name:'status',value:'published'});expect(calls).toContainEqual({kind:'eq',name:'affiliate_partners.status',value:'published'});});
  it('builds a same-origin redirect containing only the course id',()=>{const{client}=fakeClient();expect(createAffiliateRepository(client).buildRedirectUrl('course 1')).toBe('/api/affiliate/course/course%201');});
});
