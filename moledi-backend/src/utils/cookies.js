// ---------------------------------------------------------------------------
// Cookies de session organisateur (httpOnly). Deux cookies distincts :
//   - moledi_session : access token, durée glissante (12h), envoyé sur
//     toutes les routes (path=/) car lu par le middleware attachAuthUser sur
//     chaque requête API.
//   - moledi_refresh : refresh token, longue durée (30 jours), restreint à
//     /api/auth pour limiter son exposition — seul le middleware d'auth (via
//     un appel serveur-à-serveur interne, pas une route publique) et le
//     endpoint logout en ont besoin.
// `Secure` est ajouté automatiquement hors développement local (NODE_ENV
// production), pour continuer à fonctionner en http://localhost en dev.
// ---------------------------------------------------------------------------

export const ACCESS_TOKEN_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12h glissantes
export const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

const isProd = process.env.NODE_ENV === "production";

export function setSessionCookies(res, { accessToken, refreshToken }) {
  res.cookie("moledi_session", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });
  if (refreshToken) {
    res.cookie("moledi_refresh", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/api/auth",
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
  }
}

export function clearSessionCookies(res) {
  res.clearCookie("moledi_session", { path: "/" });
  res.clearCookie("moledi_refresh", { path: "/api/auth" });
}
