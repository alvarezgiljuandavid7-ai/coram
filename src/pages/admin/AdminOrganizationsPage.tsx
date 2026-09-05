import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { organizationsRepository, type Organization } from '../../domain/organizations/organizationsRepository';

export function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { organizationsRepository.list().then(setOrganizations).catch((reason) => setError(reason instanceof Error ? reason.message : 'Error al cargar organizaciones.')); }, []);
  return <section className="space-y-5"><header><p className="text-xs font-black uppercase tracking-[0.2em] text-[#a56b09]">Equipos</p><h1 className="font-serif text-4xl text-[#0B2545]">Organizaciones</h1></header>{error ? <p className="rounded-2xl bg-rose-50 p-4 text-rose-700">{error}</p> : organizations.length === 0 ? <div className="rounded-2xl border border-[#0B2545]/10 bg-white p-8 text-center"><Building2 className="mx-auto mb-3"/><p>No hay organizaciones disponibles.</p></div> : <div className="overflow-x-auto rounded-2xl bg-white shadow-sm"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-4">Nombre</th><th className="p-4">Plan</th><th className="p-4">Estado</th><th className="p-4">Creada</th></tr></thead><tbody>{organizations.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-4 font-bold">{item.name}</td><td className="p-4">{item.planId}</td><td className="p-4">{item.status}</td><td className="p-4">{new Date(item.createdAt).toLocaleDateString('es-CO')}</td></tr>)}</tbody></table></div>}</section>;
}
