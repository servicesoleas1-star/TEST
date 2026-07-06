import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { media, illustration } from '../config/media';

/**
 * Connexion — same split-screen layout, wave divider and Ken-Burns
 * slideshow as the reference PHP login page, re-skinned with the Moledi
 * brand (logo, colours, fonts). Unlike the reference, this page has no
 * "mot de passe oublié" or "inscription" panel built in: both actions
 * simply link out to the pages already dedicated to them elsewhere in the
 * product (reset-password flow, /inscription). This page only owns the
 * actual sign-in check against the database.
 *
 * Visitor/session bootstrapping (the anonymous `visitor_id` cookie) is a
 * separate workstream owned by another teammate — this page only *reads*
 * it if already present, to let the backend link the session to the
 * account being logged into; it never creates or manages that cookie.
 */
const slides = [illustration.ticketing, illustration.votes, illustration.crowdfunding, illustration.contests];

function readVisitorId() {
  try {
    return localStorage.getItem('moledi_visitor_id') || null;
  } catch {
    return null;
  }
}

function Connexion() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);

    if (!email || !password) {
      setErrors(['Email et mot de passe requis.']);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, visitorId: readVisitorId() }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrors(data.errors || ["Une erreur est survenue, réessayez."]);
        return;
      }

      window.location.href = data.redirect || '/';
    } catch {
      setErrors(['Impossible de contacter le serveur. Réessayez.']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Visual column */}
      <div className="hidden lg:flex relative overflow-hidden bg-ink-900">
        <AnimatePresence mode="sync">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.14 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.2 }, scale: { duration: 7, ease: 'linear' } }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[slide]})` }}
          />
        </AnimatePresence>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(11,19,36,.7) 0%, rgba(11,19,36,.15) 60%, transparent 100%), linear-gradient(to top, rgba(11,19,36,.85) 0%, rgba(11,19,36,.15) 45%, transparent 100%)',
          }}
        />
        {/* Wave divider meeting the white form column */}
        <svg
          className="absolute right-[-1px] top-0 bottom-0 w-[55px] h-full"
          viewBox="0 0 60 900"
          preserveAspectRatio="none"
        >
          <path d="M60,0 Q18,225 38,450 Q58,675 16,900 L60,900 L60,0 Z" fill="white" />
        </svg>

        <div className="relative z-10 flex flex-col h-full w-full px-12 py-11">
          <a href="/" className="mb-auto inline-block">
            <img src={media.logo} alt="Moledi Event" className="h-12 w-auto object-contain" />
          </a>
          <div className="flex-1 flex flex-col justify-center py-10 max-w-md">
            <h2 className="font-heading text-4xl sm:text-5xl normal-case text-white leading-tight mb-4">
              Bon retour <em className="italic text-primary-100 not-italic text-primary-300">parmi nous</em>.
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Retrouvez vos événements, vos votes et vos cagnottes en un seul endroit.
            </p>
          </div>
        </div>
      </div>

      {/* Form column */}
      <div className="flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="flex lg:hidden items-center justify-between px-5 py-4 border-b border-ink-200 sticky top-0 bg-white z-10">
          <img src={media.logo} alt="Moledi Event" className="h-9 w-auto object-contain" />
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-ink-700 hover:text-primary flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left" /> Retour
          </button>
        </header>

        <div className="flex-1 flex items-start lg:items-center justify-center px-6 sm:px-14 pt-6 sm:pt-10 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            <h1 className="font-heading text-3xl sm:text-4xl normal-case text-ink-900 mb-2">Connexion</h1>
            <p className="text-sm text-ink-700 normal-case mb-8">
              Entrez vos identifiants pour accéder à votre compte.
            </p>

            {errors.length > 0 && (
              <div className="mb-6 flex gap-3 items-start rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
                <i className="fa-solid fa-circle-exclamation text-red-500 mt-0.5" />
                <ul className="space-y-1">
                  {errors.map((e, i) => (
                    <li key={i} className="text-sm text-red-700">
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-900 mb-2">
                  <i className="fa-solid fa-envelope text-primary text-[11px]" /> Adresse email
                </label>
                <div className="relative">
                  <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-ink-700/50 text-sm" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full h-[50px] rounded-xl border border-ink-200 pl-11 pr-4 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-900 mb-2">
                  <i className="fa-solid fa-lock text-primary text-[11px]" /> Mot de passe
                </label>
                <div className="relative">
                  <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-ink-700/50 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full h-[50px] rounded-xl border border-ink-200 pl-11 pr-11 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-0 top-0 h-[50px] w-11 flex items-center justify-center text-ink-700/50 hover:text-primary transition-colors"
                  >
                    <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full !rounded-full h-[52px] mt-2 disabled:opacity-60"
              >
                {loading ? (
                  'Connexion en cours…'
                ) : (
                  <>
                    Se connecter <i className="fa-solid fa-right-to-bracket" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-ink-700 mt-4">
              Mot de passe oublié ?{' '}
              <a href="/mot-de-passe-oublie" className="text-primary font-semibold hover:underline">
                Réinitialisez-le
              </a>
            </p>

            <div className="flex items-center gap-3 my-6 text-ink-700 text-xs">
              <span className="flex-1 h-px bg-ink-200" />
              ou
              <span className="flex-1 h-px bg-ink-200" />
            </div>

            <p className="text-center text-sm text-ink-700 pt-5 border-t border-ink-200">
              Pas encore de compte ?{' '}
              <a href="/inscription" className="text-primary font-semibold hover:underline">
                S'inscrire gratuitement
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Connexion;
