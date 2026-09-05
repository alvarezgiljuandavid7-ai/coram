import { type FormEvent, useEffect, useState } from 'react';
import { CalendarDays, Clock3, MapPin, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditorialCard, EditorialHeading, ExperienceCanvas, StatePanel } from '../../../components/experience-v2/ExperienceV2';
import { organizationsRepository, type Organization } from '../../../domain/organizations/organizationsRepository';
import { servicesRepository, type MinistryService } from '../../../domain/services/servicesRepository';
import styles from './Services.module.css';

export function ServicesPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [services, setServices] = useState<MinistryService[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { organizationsRepository.list().then((items) => { setOrganizations(items); setOrganizationId(items[0]?.id ?? ''); }).catch((reason) => setError(reason.message)); }, []);
  const reload = async (id = organizationId) => { if (!id) return; try { setServices(await servicesRepository.listUpcoming(id)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible cargar servicios.'); } };
  useEffect(() => { void reload(); }, [organizationId]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try {
      await servicesRepository.create({ organizationId, title: String(form.get('title') ?? ''), startsAt: new Date(String(form.get('startsAt'))).toISOString(), location: String(form.get('location') ?? '') });
      event.currentTarget.reset(); await reload();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible crear el servicio.'); }
  }

  return <ExperienceCanvas><EditorialHeading eyebrow="Planificación" title="Próximos servicios" body="Coordina fechas, equipo y repertorio dentro de cada ministerio." icon={CalendarDays} />{organizations.length === 0 ? <StatePanel icon={CalendarDays} title="Primero crea un ministerio" body="Necesitas una organización para planificar servicios compartidos." /> : <><EditorialCard className={styles.formCard}><form onSubmit={create} className={styles.serviceForm}><label>Ministerio<select value={organizationId} onChange={(event) => setOrganizationId(event.target.value)}>{organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Nombre<input name="title" required placeholder="Culto del domingo" /></label><label>Fecha y hora<input name="startsAt" type="datetime-local" required /></label><label>Lugar<input name="location" placeholder="Templo principal" /></label><button type="submit"><Plus size={18}/> Crear</button></form></EditorialCard>{error && <p className={styles.error}>{error}</p>}<div className={styles.serviceGrid}>{services.length === 0 ? <StatePanel icon={Clock3} title="Sin servicios próximos" body="Crea el primer servicio para comenzar a coordinar." /> : services.map((service) => <Link key={service.id} to={`/app/ministerio/servicios/${service.id}?organization=${organizationId}`} className={styles.serviceCard}><span><CalendarDays size={20}/></span><div><strong>{service.title}</strong><p><Clock3 size={14}/>{new Date(service.startsAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</p>{service.location && <p><MapPin size={14}/>{service.location}</p>}</div><small>{service.status}</small></Link>)}</div></>}</ExperienceCanvas>;
}
