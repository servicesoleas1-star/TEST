// pages/PollFaq.jsx — Route publique : /vote/:slug/faq
//
// Vraie page FAQ (plus un simple bloc résumé) : les questions propres à ce
// scrutin (table poll_faqs, saisies par l'organisateur) apparaissent en
// premier, puis les questions générales sur les scrutins (global_faqs,
// type POLL_TEMPLATE) -- avec une recherche texte qui filtre les deux.

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HelpCircle, Search } from 'lucide-react';
import PollHeader from '../components/poll/PollHeader';
import PollFooter from '../components/poll/PollFooter';
import PollSubHero from '../components/poll/PollSubHero';
import PollLoadingScreen from '../components/poll/PollLoadingScreen';
import PollBackdrop from '../components/poll/PollBackdrop';
import FAQAccordion from '../components/FAQAccordion';
import { fetchAllFAQ, getGlobalFAQ } from '../components/config/faqConfig';
import { useFetch } from '../lib/pollApi';

export default function PollFaqPage() {
  const { slug } = useParams();
  const { data: poll } = useFetch(`/api/polls/${slug}`, [slug]);
  const { data: faqData } = useFetch(`/api/polls/${slug}/faq`, [slug]);
  const [generalFaq, setGeneralFaq] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchAllFAQ().then((all) => setGeneralFaq(getGlobalFAQ(all, 'POLL_TEMPLATE')));
  }, []);

  const pollFaq = faqData?.faq || [];

  const filter = (items) => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((i) => i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q));
  };

  const filteredPollFaq = useMemo(() => filter(pollFaq), [pollFaq, query]);
  const filteredGeneralFaq = useMemo(() => filter(generalFaq), [generalFaq, query]);

  if (!poll) {
    return (
      <PollLoadingScreen />
    );
  }

  const nothingFound = filteredPollFaq.length === 0 && filteredGeneralFaq.length === 0;

  return (
    <div className="min-h-screen isolate">
      <PollBackdrop image={poll.cover_photo_url} />
      <PollHeader poll={poll} slug={slug} active="FAQ" solid />
      <PollSubHero poll={poll} slug={slug} icon={HelpCircle} title="Questions fréquentes" subtitle="Tout ce qu'il faut savoir avant de participer" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-10">
          <Search size={16} className="text-white/40 shrink-0" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une question..."
            className="bg-transparent text-white text-sm placeholder-white/30 outline-none flex-1 min-w-0"
          />
        </div>

        {nothingFound && <p className="text-white/50 text-center py-10">Aucune question ne correspond à votre recherche.</p>}

        {filteredPollFaq.length > 0 && (
          <div className="mb-10">
            <p className="text-primary-300 font-semibold tracking-[0.2em] uppercase text-[10px] mb-4">Questions sur ce scrutin</p>
            <div
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-6"
              style={{ '--color-ink': '#fff', '--color-border': 'rgba(255,255,255,0.1)', '--color-slate': 'rgba(255,255,255,0.65)' }}
            >
              <FAQAccordion items={filteredPollFaq.map((f) => ({ faq_id: f.faq_id, question: f.question, answer: f.answer }))} />
            </div>
          </div>
        )}

        {filteredGeneralFaq.length > 0 && (
          <div>
            <p className="text-primary-300 font-semibold tracking-[0.2em] uppercase text-[10px] mb-4">Questions générales sur les scrutins</p>
            <div
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-6"
              style={{ '--color-ink': '#fff', '--color-border': 'rgba(255,255,255,0.1)', '--color-slate': 'rgba(255,255,255,0.65)' }}
            >
              <FAQAccordion items={filteredGeneralFaq.map((f) => ({ faq_id: f.faq_id, question: f.question, answer: f.answer }))} />
            </div>
          </div>
        )}
      </main>

      <PollFooter poll={poll} />
    </div>
  );
}
