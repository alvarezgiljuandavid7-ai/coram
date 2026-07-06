import { Link } from 'react-router-dom';

const legalContent = {
  privacidad: {
    title: 'Politica de privacidad',
    body: [
      'CorAM trata datos de cuenta como nombre, correo, rol de usuario, progreso y actividad basica necesaria para operar la plataforma.',
      'Los archivos, cursos, recursos y pagos se procesan mediante proveedores externos configurados para produccion, como Supabase y Stripe.',
      'No se deben almacenar claves privadas, contrasenas ni datos completos de tarjetas en el frontend.',
      'Puedes solicitar revision o eliminacion de datos escribiendo al administrador de CorAM.',
    ],
  },
  terminos: {
    title: 'Terminos y condiciones',
    body: [
      'CorAM es una plataforma ministerial para corarios, himnarios, academia, recursos y herramientas vocales.',
      'El acceso premium depende de pagos confirmados por el proveedor de pagos y de los roles guardados en Supabase.',
      'El usuario se compromete a usar el contenido de forma legal, respetando derechos de autor y licencias aplicables.',
      'CorAM puede suspender accesos que violen seguridad, propiedad intelectual o uso aceptable.',
    ],
  },
  cookies: {
    title: 'Politica de cookies',
    body: [
      'CorAM usa cookies tecnicas y almacenamiento local para recordar sesion, preferencias y consentimiento.',
      'Tambien registra eventos basicos de uso para diagnosticar errores y mejorar la experiencia.',
      'No usamos cookies para vender datos personales.',
      'Puedes borrar las cookies desde la configuracion del navegador.',
    ],
  },
  reembolsos: {
    title: 'Politica de reembolsos',
    body: [
      'Los pagos premium deben procesarse mediante Stripe u otro proveedor real habilitado.',
      'Las solicitudes de reembolso se revisan segun el estado del pago, consumo del servicio y normativa aplicable.',
      'Si un cobro fue duplicado o no se activo el acceso, el usuario debe contactar al administrador con el comprobante.',
      'Los reembolsos aprobados se ejecutan desde el proveedor de pago, no desde el frontend.',
    ],
  },
} as const;

interface LegalPageProps {
  type: keyof typeof legalContent;
}

export function LegalPage({ type }: LegalPageProps) {
  const content = legalContent[type];

  return (
    <main className="min-h-screen bg-[oklch(98%_0.006_90)] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link to="/app" className="text-sm font-bold text-[#0B2545]">Volver a CorAM</Link>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-[#0B2545]">{content.title}</h1>
        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {content.body.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-slate-600">{paragraph}</p>
          ))}
        </div>
      </div>
    </main>
  );
}
