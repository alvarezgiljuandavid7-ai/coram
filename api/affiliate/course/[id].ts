import { createHash, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { assertAllowedAffiliateDestination } from '../../../src/server/affiliate/redirectPolicy.js';

type RequestLike={method?:string;query:Record<string,string|string[]|undefined>;headers:Record<string,string|string[]|undefined>};
type ResponseLike={status:(code:number)=>ResponseLike;json:(body:unknown)=>void;setHeader:(name:string,value:string)=>void;end:()=>void};
const first=(value:string|string[]|undefined)=>Array.isArray(value)?value[0]:value;
const cookieValue=(cookie:string|undefined,name:string)=>cookie?.split(';').map((item)=>item.trim()).find((item)=>item.startsWith(`${name}=`))?.slice(name.length+1);
const referrerHost=(value:string|undefined)=>{if(!value)return null;try{return new URL(value).hostname;}catch{return null;}};

const UUID_PATTERN=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function sendJson(res:ResponseLike,code:number,body:unknown){res.status(code);res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.json(body);}
export default async function handler(req:RequestLike,res:ResponseLike){
  if(req.method!=='GET'){sendJson(res,405,{error:'method_not_allowed'});return;}
  const url=process.env.VITE_SUPABASE_URL;const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key){sendJson(res,503,{error:'affiliate_service_unconfigured'});return;}
  const courseId=first(req.query.id);if(!courseId||!UUID_PATTERN.test(courseId)){sendJson(res,404,{error:'affiliate_course_unavailable'});return;}
  const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const{data,error}=await client.from('affiliate_courses').select('id,destination_url,status,affiliate_partners!inner(allowed_domains,status)').eq('id',courseId).eq('status','published').eq('affiliate_partners.status','published').single();
  if(error||!data){sendJson(res,404,{error:'affiliate_course_unavailable'});return;}
  const partner=Array.isArray(data.affiliate_partners)?data.affiliate_partners[0]:data.affiliate_partners;
  try{
    const destination=assertAllowedAffiliateDestination(data.destination_url,partner?.allowed_domains??[]);
    const rawSession=cookieValue(first(req.headers.cookie),'coram_affiliate_session')||randomUUID();
    if(!cookieValue(first(req.headers.cookie),'coram_affiliate_session'))res.setHeader('Set-Cookie',`coram_affiliate_session=${rawSession}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
    const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
    await client.rpc('record_affiliate_click',{p_course_id:courseId,p_session_hash:hash(rawSession),p_referrer_host:referrerHost(first(req.headers.referer)),p_user_agent_hash:hash(first(req.headers['user-agent'])??'unknown')});
    res.status(302);res.setHeader('Location',destination.href);res.setHeader('Cache-Control','no-store');res.end();
  }catch{sendJson(res,404,{error:'affiliate_course_unavailable'});}
}
