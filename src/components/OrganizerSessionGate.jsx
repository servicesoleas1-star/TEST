import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { hydrateOrganizerSession } from "../lib/session.js";

/**
 * Enveloppe toutes les routes /dashboard* : avant de monter la page réelle,
 * tente de repeupler sessionStorage depuis la session serveur (cookie
 * httpOnly, voir lib/session.js -> hydrateOrganizerSession) si elle est vide
 * localement. Sans ce garde, un onglet fraîchement rouvert (sessionStorage
 * vidé) affichait "Session introuvable" même si la session serveur (2h
 * glissantes, jusqu'à 30 jours via refresh token) était toujours valide.
 *
 * Si, après cette tentative, aucune session n'est trouvée (ni locale, ni
 * serveur), l'utilisateur est redirigé vers /connexion avec un
 * redirect_to pour revenir automatiquement ici après connexion, au lieu de
 * simplement afficher une page vide/cassée.
 *
 * Le chargement est quasi instantané dans le cas courant (sessionStorage
 * déjà rempli, pas d'appel réseau) — le loader ne s'affiche visiblement que
 * lors d'un vrai nouvel onglet/navigateur.
 */
export default function OrganizerSessionGate({ children }) {
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    hydrateOrganizerSession().then((email) => {
      if (cancelled) return;
      if (!email) {
        const redirectTo = encodeURIComponent(location.pathname + location.search);
        navigate(`/connexion?redirect_to=${redirectTo}`, { replace: true });
        return;
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <svg className="animate-spin w-8 h-8 text-secondary" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return children;
}
