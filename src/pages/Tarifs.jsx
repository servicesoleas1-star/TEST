import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import { flag, illustration } from '../config/media';

// --- Barème de commission (backlog LAN-08, Tarifs & Couverture) ---
// Mirrors UML DC-08 `CommissionConfig`. Public pricing page = anonymous
// visitors, so it always reads this global table (no UserCommissionConfig
// override here, that only applies to logged-in organizers).
const commissionConfigs = [
  { config_id: 'cc-vote', type: 'VOTE', rate: 10, active: true },
  { config_id: 'cc-contest', type: 'CONTEST', rate: 10, active: true },
  { config_id: 'cc-ticket', type: 'TICKET', rate: 7, active: true },
  { config_id: 'cc-donation', type: 'DONATION', rate: 7, active: true },
  { config_id: 'cc-cf', type: 'CF', rate: 7, active: true },
  { config_id: 'cc-lottery', type: 'LOTTERY', rate: 7, active: true },
  { config_id: 'cc-sponsorship', type: 'SPONSORSHIP', rate: 7, active: true },
];

const campaignTypes = [
  { key: 'VOTE', label: 'Votes & scrutins', icon: 'fa-check-to-slot' },
  { key: 'TICKET', label: 'Billetterie', icon: 'fa-ticket' },
  { key: 'DONATION', label: 'Dons & cagnottes', icon: 'fa-hand-holding-heart' },
  { key: 'CF', label: 'Crowdfunding', icon: 'fa-people-group' },
  { key: 'CONTEST', label: 'Concours', icon: 'fa-trophy' },
  { key: 'LOTTERY', label: 'Loteries', icon: 'fa-dice' },
  { key: 'SPONSORSHIP', label: 'Sponsoring', icon: 'fa-handshake' },
];

// If the table has no active row for a type, render an empty state rather
// than invent a number — this is the only lookup helper.
function getCommissionRate(type) {
  const row = commissionConfigs.find((c) => c.type === type && c.active);
  return row ? row.rate : null;
}

// Full African reference mapping (ISO 3166-1 alpha-2 + French name), used to
// label whatever country_code the real CountryConfig table returns.
const africanCountries = [
  { code: 'DZ', name: 'Algérie' }, { code: 'AO', name: 'Angola' }, { code: 'BJ', name: 'Bénin' },
  { code: 'BW', name: 'Botswana' }, { code: 'BF', name: 'Burkina Faso' }, { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cap-Vert' }, { code: 'CM', name: 'Cameroun' }, { code: 'CF', name: 'République centrafricaine' },
  { code: 'TD', name: 'Tchad' }, { code: 'KM', name: 'Comores' }, { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'RD Congo' }, { code: 'CI', name: "Côte d'Ivoire" }, { code: 'DJ', name: 'Djibouti' },
  { code: 'EG', name: 'Égypte' }, { code: 'GQ', name: 'Guinée équatoriale' }, { code: 'ER', name: 'Érythrée' },
  { code: 'SZ', name: 'Eswatini' }, { code: 'ET', name: 'Éthiopie' }, { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambie' }, { code: 'GH', name: 'Ghana' }, { code: 'GN', name: 'Guinée' },
  { code: 'GW', name: 'Guinée-Bissau' }, { code: 'KE', name: 'Kenya' }, { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' }, { code: 'LY', name: 'Libye' }, { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' }, { code: 'ML', name: 'Mali' }, { code: 'MR', name: 'Mauritanie' },
  { code: 'MU', name: 'Maurice' }, { code: 'MA', name: 'Maroc' }, { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibie' }, { code: 'NE', name: 'Niger' }, { code: 'NG', name: 'Nigeria' },
  { code: 'RW', name: 'Rwanda' }, { code: 'ST', name: 'Sao Tomé-et-Principe' }, { code: 'SN', name: 'Sénégal' },
  { code: 'SC', name: 'Seychelles' }, { code: 'SL', name: 'Sierra Leone' }, { code: 'SO', name: 'Somalie' },
  { code: 'ZA', name: 'Afrique du Sud' }, { code: 'SS', name: 'Soudan du Sud' }, { code: 'SD', name: 'Soudan' },
  { code: 'TZ', name: 'Tanzanie' }, { code: 'TG', name: 'Togo' }, { code: 'TN', name: 'Tunisie' },
  { code: 'UG', name: 'Ouganda' }, { code: 'ZM', name: 'Zambie' }, { code: 'ZW', name: 'Zimbabwe' },
];

// Preloads countries from `/api/countries` (`country_config` table). Empty
// table → empty array, nothing invented client-side.
function useCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/countries')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setCountries(data.ok ? data.countries : []);
      })
      .catch(() => {
        if (!cancelled) setCountries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { countries, loading };
}

// Preloads payment operators from `/api/payment-methods` (Aggregator table).
// Each row is expected to carry a `logo_url`; the UI falls back to initials
// only if that logo fails to load.
function usePaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/payment-methods')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMethods(data.ok ? data.methods : []);
      })
      .catch(() => {
        if (!cancelled) setMethods([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { methods, loading };
}

/**
 * Searchable country dropdown — replaces the cramped tile grid with a single
 * button that opens a scrollable, filterable list. Much easier to scan once
 * the active-country list grows past a handful of entries.
 */
function CountrySelect({ countries, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const selected = countries.find((c) => c.country_code === value);
  const filtered = countries.filter((c) =>
    c.country_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 h-14 rounded-xl border border-ink-200 px-4 text-left hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {selected ? (
          <>
            <img src={flag(selected.country_code.toLowerCase(), 40)} alt="" className="w-7 h-5 object-cover rounded shadow-sm" />
            <span className="font-semibold text-ink-900 text-sm">{selected.country_name}</span>
          </>
        ) : (
          <span className="text-sm text-ink-700">Sélectionnez un pays</span>
        )}
        <svg
          className={`ml-auto w-4 h-4 text-ink-700 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 mt-2 w-full rounded-xl border border-ink-200 bg-white shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-ink-200">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full h-9 rounded-lg bg-ink-100/70 px-3 text-sm text-ink-900 focus:outline-none"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-sm text-ink-700">Aucun pays trouvé.</li>
              )}
              {filtered.map((c) => (
                <li key={c.country_code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c.country_code);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-ink-100 transition-colors ${
                      value === c.country_code ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-ink-900'
                    }`}
                  >
                    <img src={flag(c.country_code.toLowerCase(), 40)} alt="" className="w-6 h-4.5 object-cover rounded shadow-sm" />
                    {c.country_name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


const cards = [
  {
    rateType: 'TICKET',
    title: 'Tarif standard',
    desc: 'Billetterie, dons & cagnottes, crowdfunding, loteries, sponsoring.',
    tone: 'primary',
    image: illustration.ticketing,
  },
  {
    rateType: 'VOTE',
    title: 'Votes & concours',
    desc: 'Scrutins publics, votes payants et concours à participation payante.',
    tone: 'secondary',
    image: illustration.votes,
  },
  {
    rateType: 'FLAT',
    rate: 0,
    title: 'Retrait & carte',
    desc: 'Aucun frais de retrait vers votre mobile money, aucun frais de transaction sur les paiements par carte.',
    tone: 'ink',
    image: illustration.cashout,
  },
];

const N = cards.length;

/**
 * Rate cards stack one after another: card 0 sticks in place, then card 1
 * scrolls up and sits fully on top of it (opaque, same sticky position,
 * higher z-index), then card 2 does the same on top of card 1 — a plain
 * sequential cover, no peeking edges or scale/blur effects. Once the last
 * card has covered the stack, the page continues to the rest of the site.
 * Full-width, tall panels on desktop (not a small centered card).
 */
function RateCards() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {cards.map((c, i) => {
          const rate = c.rateType === 'FLAT' ? c.rate : getCommissionRate(c.rateType);
          const isLast = i === N - 1;
          return (
            <div key={c.rateType} className={isLast ? '' : 'h-[75vh] sm:h-[65vh]'}>
              <div className="sticky top-20 sm:top-24" style={{ zIndex: i + 1 }}>
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col-reverse sm:flex-row items-center gap-6 sm:gap-10 lg:gap-16 rounded-2xl sm:rounded-3xl border border-ink-200 bg-white p-6 sm:p-10 lg:p-14 min-h-[280px] sm:min-h-[340px] lg:min-h-[400px] shadow-[0_35px_80px_-30px_rgba(11,19,36,0.35)]"
                >
                  <div className="flex-1 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full inline-block mb-3 sm:mb-5 ${
                        c.tone === 'primary' ? 'bg-primary' : c.tone === 'secondary' ? 'bg-secondary' : 'bg-ink-900'
                      }`}
                    />
                    <p className="text-5xl sm:text-7xl lg:text-8xl font-heading normal-case text-ink-900 mb-2 sm:mb-4">
                      {rate != null ? `${rate}%` : '—'}
                    </p>
                    <h3 className="text-lg sm:text-2xl lg:text-3xl font-semibold text-ink-900 mb-2 sm:mb-3">{c.title}</h3>
                    <p className="text-sm sm:text-base text-ink-700 normal-case leading-relaxed max-w-md">{c.desc}</p>
                  </div>
                  <img
                    src={c.image}
                    alt=""
                    className="w-28 h-28 sm:w-56 sm:h-56 lg:w-72 lg:h-72 rounded-2xl object-cover shrink-0"
                  />
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


const formatAmount = (n) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n));

/**
 * Interactive simulator — reads its rate from `commissionConfig.js` (the
 * CommissionConfig table stand-in) and its country/currency/methods from
 * `/api/countries` (the real CountryConfig table, admin-configured). If that
 * table is empty, the country picker and result panel simply have nothing
 * to show — no fallback country is invented client-side. Laid directly on
 * the page background (no enclosing mega-card) — only the input group and
 * the result panel get their own light block.
 */
function FeeCalculator() {
  const { countries } = useCountries();
  const activeCountries = countries.filter((c) => c.active);

  const [amount, setAmount] = useState('10000');
  const [campaignType, setCampaignType] = useState(campaignTypes[0].key);
  const [countryCode, setCountryCode] = useState('');

  useEffect(() => {
    if (!countryCode && activeCountries[0]) setCountryCode(activeCountries[0].country_code);
  }, [activeCountries, countryCode]);

  const country = activeCountries.find((c) => c.country_code === countryCode);
  const rate = getCommissionRate(campaignType);

  const { gross, commission, net } = useMemo(() => {
    const g = Number(amount) || 0;
    const c = rate != null ? (g * rate) / 100 : 0;
    return { gross: g, commission: c, net: g - c };
  }, [amount, rate]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-10"
      >
        <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
          Simulateur
        </p>
        <h3 className="text-3xl sm:text-4xl text-ink-900">Calculez vos frais</h3>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* Inputs */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8"
        >
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700 mb-2">
            Montant de la transaction
          </label>
          <div className="relative mb-6">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-14 rounded-xl border border-ink-200 pl-5 pr-16 text-lg font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              placeholder="10000"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-700">
              {country?.currency || ''}
            </span>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700 mb-2">
            Type d'événement
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            {campaignTypes.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setCampaignType(t.key)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 px-2 text-center transition-colors ${
                  campaignType === t.key
                    ? 'bg-ink-900 text-white border-ink-900'
                    : 'bg-white text-ink-700 border-ink-200 hover:border-ink-900/40'
                }`}
              >
                <i className={`fa-solid ${t.icon} text-base ${campaignType === t.key ? 'text-primary-300' : 'text-primary'}`} />
                <span className="text-[11px] font-semibold leading-tight">{t.label}</span>
              </button>
            ))}
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-700 mb-2">
            Pays
          </label>
          {activeCountries.length > 0 ? (
            <CountrySelect countries={activeCountries} value={countryCode} onChange={setCountryCode} />
          ) : (
            <p className="text-sm text-ink-700 italic">Aucun pays configuré pour le moment.</p>
          )}
        </motion.div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl bg-ink-100/70 border border-ink-200 p-6 sm:p-8 flex flex-col justify-between lg:min-h-[320px]"
        >
          <div>
            <div className="flex items-center justify-between py-3 border-b border-ink-200">
              <span className="text-sm text-ink-700">Montant brut</span>
              <span className="font-semibold text-ink-900">
                {formatAmount(gross)} {country?.currency}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-ink-200">
              <span className="text-sm text-ink-700">
                Commission Moledi {rate != null ? `(${rate}%)` : ''}
              </span>
              <span className="font-semibold text-primary-600">
                − {formatAmount(commission)} {country?.currency}
              </span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-sm font-semibold text-ink-900">Net organisateur</span>
              <span className="text-2xl font-heading normal-case text-ink-900">
                {formatAmount(net)} {country?.currency}
              </span>
            </div>
          </div>

          {country && country.methods_available?.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-wide font-semibold text-ink-700 mb-2">
                Moyens de paiement disponibles en {country.country_name}
              </p>
              <div className="flex flex-wrap gap-2">
                {country.methods_available.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1.5 rounded-lg bg-white border border-ink-200 text-xs font-semibold text-ink-900"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}


function CountryPill({ code, name, active }) {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0 px-6">
      <img
        src={flag(code.toLowerCase(), 160)}
        alt=""
        className={`w-20 h-14 object-cover rounded-lg shadow-sm ${!active ? 'grayscale opacity-60' : ''}`}
        loading="lazy"
      />
      <span className={`text-sm font-semibold whitespace-nowrap ${active ? 'text-ink-900' : 'text-ink-700/70'}`}>
        {name}
      </span>
      {!active && (
        <span className="text-[10px] uppercase tracking-wide text-ink-700/60 font-semibold">Bientôt</span>
      )}
    </div>
  );
}

/**
 * Continent coverage — a single, never-stopping horizontal marquee. Active
 * countries come from `/api/countries` (the CountryConfig table). Only when
 * that table has zero active rows does every country show a "Bientôt" tag;
 * otherwise the marquee reflects exactly what's configured.
 */
function CountryCoverage() {
  const { countries } = useCountries();
  const activeCodes = new Set(
    countries.filter((c) => c.active).map((c) => String(c.country_code).toUpperCase())
  );
  const noneConfigured = activeCodes.size === 0;

  const track = [...africanCountries, ...africanCountries];

  return (
    <section id="couverture-pays" className="py-16 sm:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
            Couverture géographique
          </p>
          <h2 className="text-3xl sm:text-5xl text-ink-900 mb-4">Une plateforme, tout un continent</h2>
          <p className="text-ink-700 normal-case max-w-xl mx-auto">
            {noneConfigured
              ? 'Le déploiement se poursuit à travers le continent.'
              : `${activeCodes.size} pays sont d'ores et déjà actifs. Le déploiement se poursuit sur le reste du continent.`}
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10" />
        <motion.div
          className="flex items-center py-2"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        >
          {track.map((c, i) => (
            <CountryPill key={`${c.code}-${i}`} code={c.code} name={c.name} active={!noneConfigured && activeCodes.has(c.code)} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}


function OperatorLogo({ m }) {
  const [failed, setFailed] = useState(!m.logo_url);

  if (failed) {
    return (
      <span
        className="w-11 h-11 shrink-0 rounded-lg flex items-center justify-center font-heading text-[11px] normal-case tracking-wide text-center leading-tight"
        style={{ backgroundColor: m.bg || '#F2F2F2', color: m.fg || '#0B1324' }}
      >
        {String(m.operator || '')
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      src={m.logo_url}
      alt={m.operator}
      onError={() => setFailed(true)}
      className="w-11 h-11 shrink-0 rounded-lg object-contain bg-white border border-ink-200 p-1.5"
      loading="lazy"
    />
  );
}

function MethodCard({ m }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 shrink-0 w-64 transition-transform ${
        m.integrated ? 'border-ink-200 bg-white hover:-translate-y-0.5' : 'border-ink-200 bg-ink-100/60 opacity-70'
      }`}
    >
      <OperatorLogo m={m} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-900 truncate">{m.operator}</p>
        <p className="text-[11px] text-ink-700">
          {m.method_label || m.method} {!m.integrated && '· Bientôt disponible'}
        </p>
      </div>
    </div>
  );
}

function MethodMarquee({ items, duration }) {
  const track = [...items, ...items];
  return (
    <div className="relative overflow-hidden mb-8 last:mb-0">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-ink-100/50 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-ink-100/50 to-transparent z-10" />
      <motion.div
        className="flex gap-3"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {track.map((m, i) => (
          <MethodCard key={`${m.operator}-${i}`} m={m} />
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Payment operators — every row comes from `/api/payment-methods` (the
 * Aggregator table, admin-configured). Empty table = empty section, no
 * fallback list. Real brand logos are loaded in the background and shown
 * once available; initials only render if a logo fails to load. Both rows
 * are continuously auto-scrolling marquees, same as the country strip.
 */
function PaymentMethodsGrid() {
  const { methods } = usePaymentMethods();
  const live = methods.filter((m) => m.integrated);
  const upcoming = methods.filter((m) => !m.integrated);
  const empty = live.length === 0 && upcoming.length === 0;

  return (
    <section className="py-16 sm:py-20 bg-ink-100/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
            Moyens de paiement
          </p>
          <h2 className="text-3xl sm:text-5xl text-ink-900">Les opérateurs que vous utilisez déjà</h2>
        </motion.div>

        {empty && (
          <p className="text-center text-sm text-ink-700 italic">
            Aucun opérateur disponible pour le moment.
          </p>
        )}

        {live.length > 0 && <MethodMarquee items={live} duration={22} />}

        {upcoming.length > 0 && (
          <>
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-ink-700 mb-4">
              Prochainement
            </p>
            <MethodMarquee items={upcoming} duration={26} />
          </>
        )}
      </div>
    </section>
  );
}


function Tarifs() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <SiteHeader activeHref="/tarifs" />
      <main className="pt-16 sm:pt-20">
        {/* Hero */}
        <section className="relative py-16 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-3">
              Tarifs & couverture
            </p>
            <h1 className="text-4xl sm:text-6xl text-ink-900 mb-5">Simple et transparent</h1>
            <p className="text-ink-700 normal-case max-w-xl mx-auto">
              Une seule commission, prélevée uniquement quand vous encaissez. Pas de frais fixes,
              pas d'abonnement.
            </p>
          </motion.div>
        </section>

        <RateCards />

        <section className="py-4 sm:py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FeeCalculator />
          </div>
        </section>

        <CountryCoverage />
        <PaymentMethodsGrid />
      </main>
      <Footer />
    </motion.div>
  );
}

export default Tarifs;
