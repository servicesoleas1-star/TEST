// ---------------------------------------------------------------------------
// Déduit un nom d'appareil lisible ("Chrome sur Windows", "Safari sur
// iPhone"...) à partir du User-Agent brut, pour l'afficher dans le journal
// de connexion (paramètres du compte). Analyse manuelle volontairement
// simple (pas de dépendance externe type ua-parser-js) : seuls les cas
// courants (desktop + mobile, principaux navigateurs) ont besoin d'être
// couverts pour cet usage d'affichage, pas pour une détection de sécurité.
// ---------------------------------------------------------------------------

function detectOs(ua) {
  if (/windows nt/i.test(ua)) return "Windows";
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/mac os x/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/linux/i.test(ua)) return "Linux";
  return null;
}

function detectBrowser(ua) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) return "Chrome";
  if (/crios\//i.test(ua)) return "Chrome";
  if (/fxios\//i.test(ua)) return "Firefox";
  if (/firefox\//i.test(ua)) return "Firefox";
  if (/safari\//i.test(ua) && /version\//i.test(ua)) return "Safari";
  return null;
}

/**
 * Retourne un libellé du type "Chrome sur Windows" à partir d'un User-Agent.
 * Retourne "Appareil inconnu" si le User-Agent est absent ou non reconnu.
 */
export function getDeviceName(userAgent) {
  if (!userAgent || typeof userAgent !== "string") return "Appareil inconnu";

  const browser = detectBrowser(userAgent);
  const os = detectOs(userAgent);

  if (browser && os) return `${browser} sur ${os}`;
  if (browser) return browser;
  if (os) return os;
  return "Appareil inconnu";
}
