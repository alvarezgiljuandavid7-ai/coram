import { FoundationScreen } from '../../src/components/FoundationScreen';

export default function AuthFoundationRoute() {
  return (
    <FoundationScreen
      eyebrow="Acceso nativo"
      title="Autenticación preparada como módulo independiente"
      description="La integración real con Supabase Auth se habilitará en una entrega específica y se probará en dispositivos antes de publicarse."
      status="Sin cambios en Auth de producción"
    />
  );
}
