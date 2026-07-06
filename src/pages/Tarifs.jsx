import { motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';
import RateCards from '../components/pricing/RateCards';
import FeeCalculator from '../components/pricing/FeeCalculator';
import CountryCoverage from '../components/pricing/CountryCoverage';
import PaymentMethodsGrid from '../components/pricing/PaymentMethodsGrid';

/**
 * Tarifs & Couverture — everything below reads from the same "table" data
 * files (`commissionConfig.js`, `countryConfig.js`, `paymentMethods.js`) so
 * the page always mirrors what CommissionConfig / CountryConfig / Aggregator
 * would actually contain: empty tables render empty sections, populated
 * tables render their real values — nothing here is a hardcoded mock UI.
 */
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
