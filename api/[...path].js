import app from '../moledi-backend/src/app.js';
import { ConfigManager } from '../moledi-backend/lib/payment/configManager.js';

// This catch-all picks up every /api/* route that ISN'T handled by a more
// specific file in this folder (Vercel always resolves the more specific
// static route first — e.g. api/auth/login.js wins over this file for
// exactly `/api/auth/login`, api/health.js wins for `/api/health`, etc.).
// Everything else (polls, votes, dashboard, support tickets, admin
// payment...) is the team's Express app from moledi-backend/, mounted here
// so it deploys as part of this same Vercel project instead of needing a
// separate server.
//
// Note: moledi-backend/src/server.js's `app.listen(...)` and its
// `setInterval` cron for expiring pending transactions are NOT used here —
// serverless functions don't keep a process alive. The cron's own route
// (`POST/GET /api/internal/cron/expire-pending`) is still reachable through
// this catch-all; wire it to a Vercel Cron Job (see vercel.json) to get the
// same periodic behavior.

// Mirrors server.js's startup validation of the payment aggregator config —
// runs once per cold start, logs instead of crashing the whole function if
// the config is invalid (a bad payment config shouldn't take down every
// other route too).
let configChecked = false;
function ensureConfigLoaded() {
  if (configChecked) return;
  configChecked = true;
  try {
    ConfigManager.loadConfigAtStartup();
  } catch (err) {
    console.error('[moledi-backend] Payment config invalid at cold start:', err.message);
  }
}

export default function handler(req, res) {
  ensureConfigLoaded();
  return app(req, res);
}
