import { motion } from 'framer-motion';
import { africanCountries } from '../../data/africanCountries';
import { useCountries } from '../../hooks/useCountries';
import { flag } from '../../config/media';

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

export default CountryCoverage;
