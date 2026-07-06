import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';

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

export default PaymentMethodsGrid;
