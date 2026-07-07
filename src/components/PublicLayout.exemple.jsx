import WhatsAppFloatingButton from './WhatsAppFloatingButton';
import { getPlatformConfig } from './config/platformConfig';

/**
 * EXEMPLE d'integration dans le layout des pages PUBLIQUES uniquement.
 *
 * IMPORTANT (critere du ticket) :
 * Ce composant ne doit JAMAIS etre importe dans le layout du
 * back-office admin (/admin/...). Il va uniquement dans le layout
 * qui enveloppe les pages publiques (/, /evenements, /vote/[slug], etc.)
 */
export default function PublicLayout({ children }) {
  const { supportWhatsAppNumber } = getPlatformConfig();

  return (
    <div>
      {/* Header / navigation ici */}

      <main>{children}</main>

      {/* Footer ici */}

      <WhatsAppFloatingButton phoneNumber={supportWhatsAppNumber} />
    </div>
  );
}
