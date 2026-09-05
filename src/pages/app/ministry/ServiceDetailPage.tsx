import { type FormEvent, useEffect, useState } from 'react';
import { CalendarCheck, Check, UserPlus, X } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useCoramApp } from '../../../app/CoramAppContext';
import { EditorialCard, EditorialHeading, ExperienceCanvas, StatePanel } from '../../../components/experience-v2/ExperienceV2';
import { servicesRepository, type MinistryService, type ServiceAssignment } from '../../../domain/services/servicesRepository';
import styles from './Services.module.css';

export function ServiceDetailPage() {
  const { auth } = useCoramApp();
  const { serviceId = '' } = useParams(); const [params] = useSearchParams(); const organizationId = params.get('organization') ?? '';
  const [service, setService] = useState<MinistryService | null>(null); const [assignments, setAssignments] = useState<ServiceAssignment[]>([]); const [error, setError] = useState<string | null>(null);
  const reload = async () => { try { const [nextService, nextAssignments] = await Promise.all([servicesRepository.get(serviceId, organizationId), servicesRepository.listAssignments(serviceId, organizationId)]); setService(nextService); setAssignments(nextAssignments); } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible abrir el servicio.'); } };
  useEffect(() => { void reload(); }, [serviceId, organizationId]);
  async function assign(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { await servicesRepository.assign({ serviceId, organizationId, userId: String(form.get('userId')), assignmentRole: String(form.get('role')), instrument: String(form.get('instrument') ?? '') }); event.currentTarget.reset(); await reload(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible asignar el integrante.'); } }
  async function respond(id: string, status: 'confirmed' | 'declined') { try { await servicesRepository.respondToAssignment(id, status); await reload(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible responder.'); } }
  if (error) return <ExperienceCanvas><StatePanel icon={CalendarCheck} title="No pudimos abrir el servicio" body={error}/></ExperienceCanvas>;
  if (!service) return <ExperienceCanvas><StatePanel icon={CalendarCheck} title="Cargando servicio" body="Consultando equipo y repertorio."/></ExperienceCanvas>;
  return <ExperienceCanvas><Link className={styles.back} to="/app/ministerio/servicios">Volver a servicios</Link><EditorialHeading eyebrow="Servicio" title={service.title} body={`${new Date(service.startsAt).toLocaleString('es-CO')} · ${service.location ?? 'Sin ubicación'}`} icon={CalendarCheck}/><div className={styles.detailGrid}><EditorialCard className={styles.formCard}><h2>Asignar integrante</h2><form onSubmit={assign} className={styles.stack}><label>ID del usuario<input name="userId" required/></label><label>Responsabilidad<input name="role" required placeholder="Voz líder"/></label><label>Instrumento<input name="instrument" placeholder="Piano"/></label><button type="submit"><UserPlus size={17}/>Asignar</button></form></EditorialCard><EditorialCard className={styles.formCard}><h2>Equipo convocado</h2><div className={styles.assignmentList}>{assignments.map((item) => <article key={item.id}><div><strong>{item.assignmentRole}</strong><small>{item.instrument ?? item.vocalPart ?? item.userId}</small></div><span data-status={item.confirmationStatus}>{item.confirmationStatus}</span>{item.confirmationStatus === 'pending' && item.userId === auth.profile?.id && <div className={styles.actions}><button aria-label="Confirmar" onClick={() => void respond(item.id,'confirmed')}><Check/></button><button aria-label="Declinar" onClick={() => void respond(item.id,'declined')}><X/></button></div>}</article>)}</div></EditorialCard></div></ExperienceCanvas>;
}
