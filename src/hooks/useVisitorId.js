import { useEffect, useState } from "react";
import { initVisitorId } from "../lib/visitorId.js";

/**
 * À appeler UNE SEULE FOIS, dans le composant racine de l'app (App.jsx ou
 * équivalent) — pas dans chaque page individuellement, sinon le cookie serait
 * relu/renouvelé inutilement à chaque navigation interne.
 *
 * Exemple d'utilisation :
 *   function App() {
 *     const visitorId = useVisitorId();
 *     return <ContactPage />;
 *   }
 */
export default function useVisitorId() {
  const [visitorId, setVisitorId] = useState(null);

  useEffect(() => {
    setVisitorId(initVisitorId());
  }, []);

  return visitorId;
}
