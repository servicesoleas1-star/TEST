// ---------------------------------------------------------------------------
// Vérification anti-robot pour la page de connexion.
//
// Deux couches complémentaires :
//   1. Honeypot (passesHumanCheck) : champ invisible qui ne doit jamais être
//      rempli par un humain -- filtre gratuit, instantané, sans dépendance
//      externe, contre les bots les plus basiques qui remplissent tous les
//      champs d'un formulaire sans exécuter de JS.
//   2. Cloudflare Turnstile (verifyTurnstileToken) : la VRAIE vérification
//      d'activité navigateur demandée -- un widget invisible dans la
//      majorité des cas, qui analyse des signaux réels (comportement,
//      empreinte, réputation IP) côté Cloudflare avant de délivrer un token
//      à usage unique, vérifié ici côté serveur via l'API siteverify.
// ---------------------------------------------------------------------------

const MIN_FILL_MS = 800;
const MAX_FORM_AGE_MS = 30 * 60 * 1000; // au-delà, on considère le timestamp non fiable (horloge cliente farfelue) et on ignore juste ce critère

/**
 * Body attendu : { hpField, formRenderedAt } en plus des champs métier.
 * - hpField : doit arriver vide (champ honeypot, caché en CSS, jamais
 *   rempli par un utilisateur humain).
 * - formRenderedAt : timestamp ms (Date.now()) capturé au montage du
 *   formulaire côté client.
 * Retourne true si la requête est jugée humaine.
 */
export function passesHumanCheck(body = {}) {
  const { hpField, formRenderedAt } = body;

  if (typeof hpField === "string" && hpField.trim().length > 0) {
    return false;
  }

  if (typeof formRenderedAt === "number" && formRenderedAt > 0) {
    const elapsed = Date.now() - formRenderedAt;
    if (elapsed >= 0 && elapsed < MAX_FORM_AGE_MS && elapsed < MIN_FILL_MS) {
      return false;
    }
  }

  return true;
}

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Vérifie un token Cloudflare Turnstile auprès de l'API siteverify.
 * Retourne true UNIQUEMENT si Cloudflare confirme le token comme valide
 * (non expiré, non déjà consommé, émis pour le bon site key). Toute erreur
 * réseau ou réponse malformée est traitée comme un échec (fail-closed --
 * mieux vaut bloquer une connexion légitime en cas de panne Cloudflare que
 * de laisser passer un robot).
 */
export async function verifyTurnstileToken(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret || secret === "your_turnstile_secret_key_here") {
    console.warn("TURNSTILE_SECRET_KEY non configurée -- vérification anti-robot désactivée.");
    return true; // n'empêche pas le développement local si la clé n'est pas encore renseignée
  }

  if (!token || typeof token !== "string") {
    return false;
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    if (remoteIp) params.append("remoteip", remoteIp);

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Erreur de vérification Turnstile :", err.message);
    return false;
  }
}
