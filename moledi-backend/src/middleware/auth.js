import {
  findSessionByAccessToken,
  findSessionByRefreshToken,
  touchSession,
  rotateAccessToken,
} from "../store/sessionStore.js";
import { setSessionCookies, clearSessionCookies, ACCESS_TOKEN_MAX_AGE_MS } from "../utils/cookies.js";

/**
 * Middleware global (monté sur toute l'app) : lit les cookies de session
 * httpOnly et peuple req.authUser si une session valide est trouvée. Ne
 * bloque JAMAIS la requête (contrairement à requireAuth ci-dessous) — les
 * routes historiques identifiant l'utilisateur par email en paramètre
 * continuent de fonctionner à l'identique ; req.authUser est disponible en
 * complément pour les routes qui veulent s'appuyer dessus (dashboard V2).
 *
 * Fenêtre glissante de 12h : toute requête avec un access token encore valide
 * relance son expiration de 12h. Si l'access token est expiré/absent mais
 * qu'un refresh token valide est présent (< 30 jours, session non invalidée),
 * un nouvel access token est émis silencieusement — permet de fermer le
 * navigateur et de revenir plus tard sans être déconnecté.
 */
export async function attachAuthUser(req, res, next) {
  req.authUser = null;

  try {
    const accessToken = req.cookies?.moledi_session;
    if (accessToken) {
      const session = await findSessionByAccessToken(accessToken);
      if (session) {
        await touchSession(session.session_id);
        res.cookie("moledi_session", accessToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: ACCESS_TOKEN_MAX_AGE_MS,
        });
        req.authUser = toAuthUser(session);
        return next();
      }
    }

    const refreshToken = req.cookies?.moledi_refresh;
    if (refreshToken) {
      const session = await findSessionByRefreshToken(refreshToken);
      if (session) {
        const newAccessToken = await rotateAccessToken(session.session_id);
        setSessionCookies(res, { accessToken: newAccessToken, refreshToken: null });
        req.authUser = toAuthUser(session);
        return next();
      }
      // Refresh token présent mais invalide/expiré : on nettoie pour éviter
      // de retenter cette recherche à chaque requête suivante.
      clearSessionCookies(res);
    }
  } catch (err) {
    console.warn("attachAuthUser error:", err.message);
  }

  next();
}

function toAuthUser(session) {
  return {
    user_id: session.user_id,
    email: session.email,
    full_name: session.full_name,
    role: session.role,
    avatar_url: session.avatar_url,
    pseudonymised: session.pseudonymised,
  };
}

/**
 * À utiliser sur les routes qui exigent une session valide (ex: dashboard
 * V2). Doit être monté après attachAuthUser.
 */
export function requireAuth(req, res, next) {
  if (!req.authUser) {
    return res.status(401).json({ error: "Session expirée ou invalide. Veuillez vous reconnecter." });
  }
  next();
}
