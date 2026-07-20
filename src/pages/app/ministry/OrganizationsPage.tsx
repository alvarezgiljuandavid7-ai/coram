import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Building2, Copy, MailPlus, ShieldCheck, UsersRound } from 'lucide-react';
import { CORAM_PLANS } from '@coram/shared-domain';
import { useCoramApp } from '../../../app/CoramAppContext';
import { EditorialCard, EditorialHeading, ExperienceCanvas, MetricTile, StatePanel } from '../../../components/experience-v2/ExperienceV2';
import {
  organizationsRepository,
  type Organization,
  type OrganizationMember,
  type OrganizationRole,
} from '../../../domain/organizations/organizationsRepository';
import styles from './OrganizationsPage.module.css';

const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function OrganizationsPage() {
  const { auth } = useCoramApp();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  const selected = useMemo(() => organizations.find((item) => item.id === selectedId) ?? organizations[0], [organizations, selectedId]);

  const reload = async () => {
    setLoading(true); setError(null);
    try {
      const next = await organizationsRepository.list();
      setOrganizations(next);
      setSelectedId((current) => current ?? next[0]?.id ?? null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'No fue posible cargar tus ministerios.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void reload(); }, []);
  useEffect(() => {
    if (!selected?.id) { setMembers([]); return; }
    organizationsRepository.listMembers(selected.id).then(setMembers).catch((nextError) => {
      setError(nextError instanceof Error ? nextError.message : 'No fue posible cargar el equipo.');
    });
  }, [selected?.id]);

  async function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.profile?.id) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    if (!name) return;
    try {
      await organizationsRepository.create({ name, slug: slugify(name), ownerUserId: auth.profile.id });
      event.currentTarget.reset(); await reload();
    } catch (nextError) { setError(nextError instanceof Error ? nextError.message : 'No fue posible crear el ministerio.'); }
  }

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    try {
      const result = await organizationsRepository.invite({
        organizationId: selected.id,
        email: String(form.get('email') ?? ''),
        role: String(form.get('role') ?? 'member') as Exclude<OrganizationRole, 'owner'>,
        instrument: String(form.get('instrument') ?? ''),
        vocalPart: String(form.get('vocalPart') ?? ''),
      });
      setInviteLink(`${window.location.origin}/app/ministerio/invitacion?token=${result.token}`);
      event.currentTarget.reset();
    } catch (nextError) { setError(nextError instanceof Error ? nextError.message : 'No fue posible crear la invitación.'); }
  }

  const limit = selected ? CORAM_PLANS[selected.planId].limits.organizationMembers : 5;

  return <ExperienceCanvas>
    <EditorialHeading eyebrow="Trabajo en equipo" title="Ministerio" body="Organiza tu equipo, sus roles e instrumentos desde un espacio compartido y protegido." icon={Building2} />
    {loading ? <StatePanel icon={Building2} title="Cargando ministerios" body="Estamos preparando tu espacio de trabajo." /> : error ? <StatePanel icon={ShieldCheck} title="No pudimos completar la operación" body={error} /> : organizations.length === 0 ? (
      <EditorialCard className={styles.formCard}>
        <h2>Crea tu primer ministerio</h2><p>El plan Free permite un equipo inicial de hasta cinco integrantes.</p>
        <form onSubmit={createOrganization} className={styles.inlineForm}><label>Nombre<input name="name" required minLength={2} placeholder="Ministerio de alabanza" /></label><button type="submit">Crear ministerio</button></form>
      </EditorialCard>
    ) : <>
      <section className={styles.metrics}><MetricTile label="Plan" value={selected?.planId.replace('_', ' ') ?? 'Free'} detail="Activo" icon={ShieldCheck} /><MetricTile label="Equipo" value={members.length} detail={limit === null ? 'Sin límite' : `de ${limit}`} icon={UsersRound} tone="gold" /><MetricTile label="Organizaciones" value={organizations.length} detail="Máximo 1" icon={Building2} tone="lilac" /></section>
      <div className={styles.grid}>
        <EditorialCard className={styles.formCard}><h2>Invita a tu equipo</h2><form onSubmit={invite} className={styles.stack}><label>Correo<input name="email" type="email" required autoComplete="email" /></label><label>Rol<select name="role"><option value="member">Miembro</option><option value="leader">Líder</option><option value="admin">Administrador</option></select></label><label>Instrumento<input name="instrument" placeholder="Piano, voz, guitarra..." /></label><label>Registro vocal<input name="vocalPart" placeholder="Soprano, alto, tenor, bajo" /></label><button type="submit"><MailPlus size={18} /> Crear invitación</button></form>{inviteLink && <div className={styles.invite}><span>{inviteLink}</span><button type="button" aria-label="Copiar invitación" onClick={() => void navigator.clipboard.writeText(inviteLink)}><Copy size={17} /></button></div>}</EditorialCard>
        <EditorialCard className={styles.formCard}><h2>Integrantes</h2><div className={styles.memberList}>{members.map((member) => <article key={member.id}><span className={styles.avatar}>{member.role.slice(0,1).toUpperCase()}</span><div><strong>{member.role}</strong><small>{[member.instrument, member.vocalPart].filter(Boolean).join(' · ') || 'Sin asignación musical'}</small></div></article>)}</div></EditorialCard>
      </div>
    </>}
  </ExperienceCanvas>;
}
