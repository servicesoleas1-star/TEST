import { motion } from 'framer-motion';
import { getCommissionRate } from '../../data/commissionConfig';
import { illustration } from '../../config/media';

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

export default RateCards;
