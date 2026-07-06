import { motion } from 'framer-motion';
import { flag } from '../../config/media';
import { countryConfigs } from '../../data/countryConfig';

/**
 * Coverage strip — driven by the aggregator module's CountryConfig records
 * (UML DC-08: country_code, country_name, methods_available). A simple,
 * sober left-to-right scroll of country flags + names, and a second strip
 * of the payment operator wordmarks. No currencies, no cards, no clutter.
 */

// Real payment-method wordmarks — official brand colours + typography,
// rendered as styled chips (no network image needed).
const operatorMarks = [
  { name: 'Orange Money', bg: '#FF7900', fg: '#000000' },
  { name: 'Wave',          bg: '#1DC4FF', fg: '#001B44' },
  { name: 'MTN MoMo',      bg: '#FFCB05', fg: '#00256B' },
  { name: 'Moov Money',    bg: '#F58220', fg: '#FFFFFF' },
  { name: 'Free Money',    bg: '#E2001A', fg: '#FFFFFF' },
  { name: 'Airtel Money',  bg: '#ED1C24', fg: '#FFFFFF' },
  { name: 'Wizall',        bg: '#0072BC', fg: '#FFFFFF' },
  { name: 'Visa',          bg: '#1A1F71', fg: '#F7B600' },
  { name: 'Mastercard',    bg: '#111111', fg: '#FF5F00' },
  { name: 'PayPal',        bg: '#003087', fg: '#009CDE' },
];

function CountryChip({ c }) {
  return (
    <div className="shrink-0 flex items-center gap-2.5 px-1">
      <img
        src={flag(c.country_code.toLowerCase(), 80)}
        alt={c.country_name}
        width="28"
        height="20"
        className="w-7 h-5 object-cover rounded shadow-sm"
        loading="lazy"
      />
      <span className="text-sm font-semibold text-ink-900 whitespace-nowrap">
        {c.country_name}
      </span>
    </div>
  );
}

function MethodChip({ m }) {
  return (
    <div
      className="shrink-0 flex items-center rounded-xl px-6 py-3 font-heading text-sm sm:text-base normal-case tracking-wide"
      style={{ backgroundColor: m.bg, color: m.fg }}
      title={m.name}
    >
      {m.name}
    </div>
  );
}

function Coverage() {
  const active = countryConfigs.filter((c) => c.active);

  return (
    <section id="couverture" className="relative py-20 sm:py-24 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12"
      >
        <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2">
          Couverture géographique
        </p>
        <h2 className="text-3xl sm:text-5xl text-ink-900">Toute l'Afrique francophone</h2>
        <p className="text-ink-700 normal-case mt-4 max-w-xl mx-auto">
          Des paiements locaux, via les opérateurs que vos participants
          utilisent déjà au quotidien.
        </p>
      </motion.div>

      {/* Countries — flag + name, scrolling left to right */}
      <div className="relative mb-8">
        <div className="flex gap-8 w-max animate-marquee">
          {[...active, ...active].map((c, i) => (
            <CountryChip key={`c-${i}`} c={c} />
          ))}
        </div>
      </div>

      {/* Payment operators — brand wordmark chips (their "logos") */}
      <div className="relative">
        <div className="flex gap-3 w-max animate-marquee-slow">
          {[...operatorMarks, ...operatorMarks].map((m, i) => (
            <MethodChip key={`m-${i}`} m={m} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent" />
    </section>
  );
}

export default Coverage;
