import { supabase } from '../../shared/supabase/client';

export interface AffiliateCourse {
  id:string; partnerId:string; partnerName:string; title:string; description:string|null;
  thumbnailUrl:string|null; videoUrl:string|null; couponCode:string|null; disclosure:string; featured:boolean;
}
type ClientLike={from:(table:string)=>any};
const select='id, partner_id, title, description, thumbnail_url, video_url, coupon_code, featured, position, affiliate_partners!inner(name, disclosure, status)';
function map(row:any):AffiliateCourse{const partner=Array.isArray(row.affiliate_partners)?row.affiliate_partners[0]:row.affiliate_partners;return{id:row.id,partnerId:row.partner_id,partnerName:partner?.name??'Partner',title:row.title,description:row.description,thumbnailUrl:row.thumbnail_url,videoUrl:row.video_url,couponCode:row.coupon_code,disclosure:partner?.disclosure??'Este enlace puede generar una comisión para CorAM.',featured:Boolean(row.featured)};}
export function createAffiliateRepository(client:ClientLike|null){return{
  async listPublished():Promise<AffiliateCourse[]>{if(!client)return[];const{data,error}=await client.from('affiliate_courses').select(select).eq('status','published').eq('affiliate_partners.status','published').order('position');if(error)throw error;return(data??[]).map(map);},
  async getPublished(id:string):Promise<AffiliateCourse>{if(!client)throw new Error('Supabase no está configurado.');const{data,error}=await client.from('affiliate_courses').select(select).eq('id',id).eq('status','published').eq('affiliate_partners.status','published').single();if(error)throw error;return map(data);},
  buildRedirectUrl:(courseId:string)=>`/api/affiliate/course/${encodeURIComponent(courseId)}`,
};}
export const affiliateRepository=createAffiliateRepository(supabase);
