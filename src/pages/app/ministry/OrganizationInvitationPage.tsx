import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExperienceCanvas, StatePanel } from '../../../components/experience-v2/ExperienceV2';
import { organizationsRepository } from '../../../domain/organizations/organizationsRepository';

export function OrganizationInvitationPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState<'loading' | 'accepted' | 'error'>('loading');
  const [message, setMessage] = useState('Validando tu invitación de forma segura.');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setState('error'); setMessage('La invitación no contiene un token válido.'); return; }
    organizationsRepository.acceptInvitation(token)
      .then(() => { setState('accepted'); setMessage('Ya haces parte del ministerio.'); })
      .catch((error) => { setState('error'); setMessage(error instanceof Error ? error.message : 'La invitación no es válida o expiró.'); });
  }, [params]);

  return <ExperienceCanvas><StatePanel icon={state === 'error' ? ShieldAlert : CheckCircle2} title={state === 'loading' ? 'Aceptando invitación' : state === 'accepted' ? 'Invitación aceptada' : 'No pudimos aceptar la invitación'} body={message} />{state !== 'loading' && <Link className="mx-auto inline-flex min-h-12 items-center rounded-full bg-[#2563eb] px-6 font-bold text-white" to="/app/ministerio">Ir a Ministerio</Link>}</ExperienceCanvas>;
}
