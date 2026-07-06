import { motion } from 'framer-motion';
import { illustration } from '../../config/media';

/**
 * Featured events — a conceptual teaser, not a live feed. Per spec: no
 * invented dates, vote counts or amounts here (that data belongs to real
 * event pages, once they exist) — just event visuals presented as
 * partially overlapping tickets, each labelled with its category only,
 * inviting the visitor to the full catalog.
 */

const TICKETS = [
  { image: illustration.ticketing, label: 'Billetterie', rotate: -10, z: 1, tone: 'orange' },
  { image: illustration.votes, label: 'Votes', rotate: 0, z: 3, tone: 'blue' },
  { image: illustration.crowdfunding, label: 'Cagnottes', rotate: 9, z: 2, tone: 'orange' },
];

function Ticket({ image, label, rotate, z, tone, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, margin: '-15% 0px' }}
      transition={{ duration: 0.75, delay: index * 0.14, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10, rotate: 0, zIndex: 10 }}
      style={{ zIndex: z, marginLeft: index === 0 ? 0 : '-4.5rem' }}
      className="group relative w-48 sm:w-60 lg:w-64 aspect-[3/4.2] rounded-[1.75rem] overflow-hidden border-[6px] border-white shadow-[0_30px_60px_-20px_rgba(11,19,36,0.45)] shrink-0 transition-shadow hover:shadow-[0_36px_70px_-16px_rgba(11,19,36,0.55)]"
    >
      <img
        src={image}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/10 to-transparent" />
      {/* Perforated ticket stub line */}
      <div className="absolute inset-x-0 top-8 border-t-2 border-dashed border-white/60" />
      <span className="absolute -left-2.5 top-8 w-5 h-5 rounded-full bg-white -translate-y-1/2" />
      <span className="absolute -right-2.5 top-8 w-5 h-5 rounded-full bg-white -translate-y-1/2" />

      <span
        className={`absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide rounded-lg px-2.5 py-1.5 text-white ${
          tone === 'blue' ? 'bg-secondary' : 'bg-primary'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
        {label}
      </span>
    </motion.div>
  );
}

function FeaturedMarquee() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Restrained backdrop glow — orange + light blue only */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute top-0 right-0 w-[28rem] h-[28rem] rounded-full bg-secondary/5 blur-[100px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* Ticket fan — order-2 on mobile so the headline reads first */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-start pl-8 sm:pl-14 lg:pl-0">
            {TICKETS.map((t, i) => (
              <Ticket key={t.label} {...t} index={i} />
            ))}
          </div>

          <div className="order-1 lg:order-2 text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 0.5 }}
              className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-2"
            >
              En ce moment
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-3xl sm:text-4xl lg:text-5xl text-ink-900 mb-5"
            >
              Événements en vedette
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-ink-700 text-base sm:text-lg normal-case mb-8 max-w-md mx-auto lg:mx-0"
            >
              Concerts, votes, cagnottes, projets — de nouveaux événements
              rejoignent la plateforme chaque semaine.
            </motion.p>
            <motion.a
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
              href="/evenements"
              className="btn btn-secondary"
            >
              Découvrir tous les événements
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedMarquee;
