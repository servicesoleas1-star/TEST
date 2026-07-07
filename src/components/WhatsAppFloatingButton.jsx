import { MessageCircle } from 'lucide-react';

/**
 * Bouton flottant WhatsApp support
 * Ticket: Bouton flottant WhatsApp support (Module Landing Pages - MVP)
 *
 * Affiche un bouton fixe en bas a droite sur toutes les pages publiques.
 * Au clic, ouvre WhatsApp avec le numero de support pre-charge.
 *
 * Le numero N'EST PAS code en dur : il est recu en prop, lui-meme
 * recupere depuis la config admin (back-office) cote parent.
 * Ne jamais importer ce composant dans le layout du back-office admin.
 *
 * @param {string} phoneNumber - Numero WhatsApp au format international sans "+" ni espaces (ex: "237600000000")
 * @param {string} message - Message pre-rempli optionnel
 */
export default function WhatsAppFloatingButton({
  phoneNumber,
  message = "Bonjour, j'ai besoin d'aide sur Moledi Events.",
}) {
  if (!phoneNumber) {
    // Si aucun numero n'est configure en admin, on n'affiche rien
    // plutot que d'afficher un bouton casse.
    return null;
  }

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter le support via WhatsApp"
      className="
        fixed z-50
        bottom-4 right-4
        sm:bottom-5 sm:right-5
        lg:bottom-6 lg:right-6
        w-14 h-14
        rounded-full
        bg-[#25D366]
        hover:bg-[#1EBE5A]
        active:scale-95
        transition-all duration-150
        shadow-lg
        flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]
      "
    >
      <MessageCircle
        className="w-7 h-7 text-white"
        strokeWidth={2}
        aria-hidden="true"
      />
    </a>
  );
}
