import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import Footer from '../components/Footer';

/**
 * Privacy policy — content is written to match what the platform actually
 * collects per the UML data model (Visitor, GDPRConsent, User, Transaction,
 * PublicAction, ...), not a generic boilerplate. `LAST_UPDATED` mirrors what
 * would sit on the real `LegalPage` row (type = PRIVACY) so a future CMS
 * hookup only needs to swap the content source, not the layout.
 */
const LAST_UPDATED = '5 juillet 2026';
const CONTACT_EMAIL = 'contact@moledievent.com';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    body: [
      `Moledi Event ("nous", "notre plateforme") accorde une importance particulière à la protection des données personnelles de ses visiteurs, organisateurs et participants. Cette politique explique quelles données nous collectons, pourquoi, combien de temps nous les conservons, et quels droits vous pouvez exercer.`,
      `Elle s'applique à l'ensemble du site, à ses pages d'événements, de votes, de cagnottes, de crowdfunding, de concours et de loteries, ainsi qu'à l'espace organisateur.`,
    ],
  },
  {
    id: 'responsable',
    title: '2. Responsable du traitement',
    body: [
      `Le responsable du traitement des données est Moledi Event. Pour toute question relative à cette politique ou à vos données, vous pouvez nous contacter à ${CONTACT_EMAIL}.`,
    ],
  },
  {
    id: 'donnees',
    title: '3. Données que nous collectons',
    list: [
      { label: 'Données de visite (visiteur anonyme)', detail: "navigateur, système d'exploitation, langue, résolution d'écran et adresse IP hachée — associées à un identifiant visiteur technique, dès votre première visite, avant toute création de compte." },
      { label: 'Données de compte (organisateurs & administrateurs)', detail: 'nom complet, email, téléphone, mot de passe (haché, jamais stocké en clair), avatar, préférences de notification et de langue.' },
      { label: 'Données de paiement et de reversement', detail: "numéro de téléphone mobile money utilisé pour recevoir vos gains ou reversements, opérateur associé, et historique des numéros utilisés." },
      { label: 'Données liées à vos participations', detail: 'votes, achats de billets, dons, contributions de cagnotte, participations à un concours ou à une loterie, avec le montant et le moyen de paiement utilisé.' },
      { label: 'Échanges avec le support', detail: 'messages envoyés à notre service client, pièces jointes associées.' },
      { label: 'Consentement', detail: 'la trace de votre acceptation (ou refus) de cette politique, horodatée, avec la version acceptée.' },
    ],
  },
  {
    id: 'finalites',
    title: '4. Pourquoi nous traitons ces données',
    list: [
      { label: 'Fournir le service', detail: 'créer et afficher vos événements, comptabiliser les votes, traiter les paiements et reversements, générer vos billets.' },
      { label: 'Sécurité et lutte contre la fraude', detail: 'détecter les votes ou paiements anormaux, limiter les tentatives de connexion abusives, bloquer les doublons.' },
      { label: 'Communication', detail: 'vous informer de la validation, du rejet ou du statut de votre campagne, envoyer vos billets ou reçus par email ou WhatsApp.' },
      { label: 'Amélioration du service', detail: 'statistiques agrégées et anonymisées sur l\'usage de la plateforme.' },
      { label: 'Obligations légales', detail: 'conservation des preuves de transaction, réponse aux réquisitions des autorités compétentes.' },
    ],
  },
  {
    id: 'base-legale',
    title: '5. Base légale des traitements',
    body: [
      `Selon les cas, le traitement de vos données repose sur : l'exécution du contrat qui nous lie à vous (organiser un événement, valider un vote, livrer un billet), votre consentement (dépôt de cookies non essentiels, communications marketing), notre intérêt légitime (sécurité, prévention de la fraude), ou le respect d'une obligation légale (comptabilité, lutte contre le blanchiment).`,
    ],
  },
  {
    id: 'destinataires',
    title: '6. À qui vos données sont-elles transmises',
    list: [
      { label: 'Agrégateurs de paiement mobile money et carte bancaire', detail: 'pour exécuter vos transactions, dans les pays où votre événement est actif.' },
      { label: "Green API (WhatsApp)", detail: 'pour l\'envoi de codes de vérification et de notifications transactionnelles.' },
      { label: 'Prestataire d\'envoi d\'emails (SMTP)', detail: 'pour les emails transactionnels (billets, reçus, réinitialisation de mot de passe).' },
      { label: 'Hébergeur et prestataires d\'infrastructure', detail: 'stockage sécurisé de la base de données et des fichiers (photos, billets PDF, justificatifs).' },
    ],
  },
  {
    id: 'conservation',
    title: '7. Durée de conservation',
    body: [
      `Les données de compte sont conservées tant que le compte est actif, puis archivées ou pseudonymisées après suppression selon les obligations comptables et légales en vigueur. Les données de simple visite (visiteur anonyme) sont conservées pour une durée limitée à des fins de sécurité, puis purgées ou anonymisées. Le journal d'audit (traçabilité des actions administratives) est conservé de façon permanente et ne peut être ni modifié ni supprimé, y compris par nos équipes.`,
    ],
  },
  {
    id: 'cookies',
    title: '8. Cookies et identifiant visiteur',
    body: [
      `Un identifiant technique ("visitor_id") est déposé dès votre arrivée sur le site pour assurer la continuité de votre session, empêcher les votes ou participations en double, et sécuriser les paiements en cours. Il ne sert pas à vous suivre en dehors du site. Vous pouvez à tout moment gérer votre consentement aux cookies non essentiels via le bandeau affiché en bas de page.`,
    ],
  },
  {
    id: 'securite',
    title: '9. Sécurité',
    body: [
      `Les mots de passe sont hachés et jamais stockés en clair. Les adresses IP sont hachées avant stockage lorsqu'elles sont utilisées à des fins de sécurité. L'accès aux données par nos équipes est limité par des permissions différenciées, et l'authentification des comptes administrateurs peut être renforcée par une double authentification (2FA).`,
    ],
  },
  {
    id: 'droits',
    title: '10. Vos droits',
    list: [
      { label: "Droit d'accès", detail: 'obtenir une copie des données que nous détenons sur vous.' },
      { label: 'Droit de rectification', detail: 'corriger des données inexactes ou incomplètes.' },
      { label: "Droit à l'effacement", detail: "demander la suppression de vos données, sous réserve des obligations légales de conservation." },
      { label: 'Droit d\'opposition', detail: 'vous opposer à un traitement fondé sur notre intérêt légitime.' },
      { label: 'Droit à la portabilité', detail: 'recevoir vos données dans un format structuré et lisible par machine.' },
      { label: 'Retrait du consentement', detail: 'retirer à tout moment un consentement précédemment donné, sans effet rétroactif.' },
    ],
  },
  {
    id: 'mineurs',
    title: '11. Mineurs',
    body: [
      `La création d'un compte organisateur ou administrateur est réservée aux personnes majeures. La participation ponctuelle à un vote, un concours ou l'achat d'un billet par un mineur doit se faire sous la supervision d'un représentant légal.`,
    ],
  },
  {
    id: 'modifications',
    title: '12. Modifications de cette politique',
    body: [
      `Cette politique peut être mise à jour pour refléter une évolution du service ou de la réglementation. La date de dernière mise à jour est indiquée en haut de page ; en cas de changement substantiel, nous vous en informerons par un moyen approprié.`,
    ],
  },
  {
    id: 'contact',
    title: '13. Nous contacter',
    body: [
      `Pour toute question sur cette politique ou pour exercer l'un de vos droits, écrivez-nous à ${CONTACT_EMAIL}. Nous nous engageons à répondre dans les meilleurs délais.`,
    ],
  },
];

function Confidentialite() {
  const [activeId, setActiveId] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <SiteHeader activeHref="/confidentialite" />
      <main className="pt-16 sm:pt-20">
        <section className="py-14 sm:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-3">
              Confidentialité
            </p>
            <h1 className="text-3xl sm:text-5xl text-ink-900 mb-4">Politique de confidentialité</h1>
            <p className="text-ink-700 normal-case text-sm">Dernière mise à jour : {LAST_UPDATED}</p>
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 grid lg:grid-cols-[240px_1fr] gap-12">
          {/* Table of contents */}
          <nav className="hidden lg:block sticky top-28 self-start">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-700 mb-3">Sommaire</p>
            <ul className="space-y-1 border-l border-ink-200">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setActiveId(s.id)}
                    className={`block pl-4 -ml-px py-1.5 text-sm border-l-2 transition-colors ${
                      activeId === s.id
                        ? 'border-primary text-primary-600 font-semibold'
                        : 'border-transparent text-ink-700 hover:text-ink-900'
                    }`}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="space-y-14">
            {sections.map((s, i) => (
              <motion.div
                key={s.id}
                id={s.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -28 : 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="scroll-mt-28"
              >
                <h2 className="text-xl sm:text-2xl text-ink-900 mb-4 normal-case font-heading tracking-wide">
                  {s.title}
                </h2>
                {s.body?.map((p, pi) => (
                  <p key={pi} className="text-ink-700 normal-case leading-relaxed mb-3">
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul className="space-y-3 mt-2">
                    {s.list.map((item) => (
                      <li key={item.label} className="flex gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <p className="text-ink-700 normal-case leading-relaxed">
                          <span className="font-semibold text-ink-900">{item.label}</span> — {item.detail}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </motion.div>
  );
}

export default Confidentialite;
