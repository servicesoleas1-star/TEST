import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { campaignTypes, getCommissionRate } from '../../data/commissionConfig';
import { useCountries } from '../../hooks/useCountries';
import CountrySelect from './CountrySelect';

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

export default FeeCalculator;
