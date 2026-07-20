import { useEffect, useState } from 'react';
import { CalendarCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { organizationsRepository } from '../../domain/organizations/organizationsRepository';
import { servicesRepository, type MinistryService } from '../../domain/services/servicesRepository';

export function NextServiceSummary() {
  const [service, setService] = useState<MinistryService | null>(null);
  useEffect(() => { organizationsRepository.list().then(async (organizations) => { const organization = organizations[0]; if (!organization) return; const services = await servicesRepository.listUpcoming(organization.id); setService(services[0] ?? null); }).catch(() => undefined); }, []);
  if (!service) return null;
  return <Link to={`/app/ministerio/servicios/${service.id}?organization=${service.organizationId}`} className="flex items-center gap-4 rounded-[1.45rem] border border-white bg-[linear-gradient(120deg,#edf3e8,#fffaf0)] p-4 shadow-[0_10px_26px_rgba(24,45,71,0.06)]"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#4a8a55]"><CalendarCheck/></span><span className="min-w-0 flex-1"><small className="font-black uppercase tracking-[.14em] text-[#a56b09]">Próximo servicio</small><strong className="mt-1 block truncate text-[#0B2545]">{service.title}</strong><span className="text-xs text-[#596576]">{new Date(service.startsAt).toLocaleString('es-CO',{dateStyle:'medium',timeStyle:'short'})}</span></span><ChevronRight className="shrink-0 text-[#0B2545]"/></Link>;
}
