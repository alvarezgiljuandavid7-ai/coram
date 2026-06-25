import { useEffect, useState } from 'react';
import { trackAnalyticsEvent } from '../domain/observability/observabilityRepository';

const COOKIE_KEY = 'coram_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(COOKIE_KEY) !== 'accepted');
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
    void trackAnalyticsEvent({ eventName: 'cookies_accepted' });
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[80] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10 md:left-auto md:max-w-md">
      <p className="text-sm font-bold text-[#0B2545]">Cookies y analitica basica</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        Usamos cookies tecnicas y eventos basicos para mejorar CorAM y diagnosticar errores. No guardamos tarjetas ni claves privadas en el navegador.
      </p>
      <button type="button" onClick={accept} className="mt-3 rounded-xl bg-[#0B2545] px-4 py-2 text-xs font-black text-white">
        Aceptar
      </button>
    </div>
  );
}
