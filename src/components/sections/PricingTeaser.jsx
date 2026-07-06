import { motion } from 'framer-motion';
import { illustration } from '../../config/media';

/**
 * Pricing teaser — a light, airy interlude pointing to /tarifs. No numbers,
 * no commission breakdown here (that detail lives on the pricing page
 * itself, driven by CommissionConfig / UserCommissionConfig — UML DC-08).
 */

function PricingTeaser() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mb-10 w-40 h-40 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border border-ink-200 shadow-[0_18px_40px_-20px_rgba(11,19,36,0.3)]"
        >
          <img
            src={illustration.pricing}
            alt="Tarifs Moledi Event"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-3">
            Tarification claire
          </p>
          <h2 className="text-3xl sm:text-5xl text-ink-900 mb-8">Découvrez nos tarifs</h2>

          <a href="/tarifs" className="btn btn-secondary">
            Voir le détail
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default PricingTeaser;
