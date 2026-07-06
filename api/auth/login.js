import bcrypt from 'bcryptjs';
import { getSupabase } from '../_supabase.js';

// Per-instance only: serverless functions don't share memory across cold
// starts or concurrent instances, so this throttles best-effort rather than
// globally. For a hard guarantee, move this to Vercel KV / Upstash Redis.
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    attempts.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, errors: ['Méthode non autorisée.'] });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, errors: ['Trop de tentatives. Réessayez dans quelques minutes.'] });
  }

  const { email, password, visitorId } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ ok: false, errors: ['Email et mot de passe requis.'] });
  }

  const supabase = getSupabase();

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, role, full_name, email, password_hash, status')
      .eq('email', String(email).trim().toLowerCase())
      .maybeSingle();

    if (error) throw error;

    const invalidCredentials = () =>
      res.status(401).json({ ok: false, errors: ['Email ou mot de passe incorrect.'] });

    if (!user) {
      // Still run bcrypt against a dummy hash so the response time doesn't
      // leak whether the email exists.
      await bcrypt.compare(password, '$2a$10$CwTycUXWue0Thq9StjUM0uJ8lVQaGjkC3f6dGxjmqhF6xUwsr2gqK');
      return invalidCredentials();
    }
    if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
      return res.status(403).json({ ok: false, errors: ['Ce compte a été suspendu. Contactez le support.'] });
    }

    const valid = await bcrypt.compare(password, user.password_hash || '');

    await supabase.from('login_logs').insert({
      user_id: user.user_id,
      success: valid,
      ip,
      browser: req.headers['user-agent'] || '',
    }).then(null, () => {}); // best-effort audit trail, never blocks the response

    if (!valid) {
      return invalidCredentials();
    }

    if (visitorId) {
      await supabase
        .from('visitors')
        .update({ account_id: user.user_id })
        .eq('visitor_id', visitorId)
        .then(null, () => {});
    }

    const redirect = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin' : '/compte';
    return res.status(200).json({ ok: true, role: user.role, redirect });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ ok: false, errors: ["Une erreur est survenue, réessayez."] });
  }
}
