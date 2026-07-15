import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import SparkleCursor from './components/SparkleCursor';
import CookieConsentBanner from './components/CookieConsentBanner';
import OrganizerSessionGate from './components/OrganizerSessionGate';
import DashboardV2Layout from './pages/dashboard-v2/DashboardV2Layout';
import { usePlatformConfig } from './components/PlatformConfig';

// Chargement paresseux (React.lazy) par route : chaque page devient son
// propre chunk JS, téléchargé uniquement quand cette route est visitée.
// Avant ce changement, les ~34 routes ci-dessous étaient importées de façon
// statique (import direct en haut de fichier) : CHAQUE chargement de page
// re-téléchargeait et ré-exécutait l'intégralité du site (toutes les pages
// + toutes les librairies lourdes qu'elles utilisent -- GSAP/ScrollTrigger/
// Lenis pour Home1/Home2, Recharts pour CampaignAnalytics, Framer Motion
// partout...), même pour une page aussi simple que /cookies. Comme toute la
// navigation publique se fait en rechargement complet de page (liens <a
// href>, requis pour Google Translate -- voir googleTranslateService.js),
// ce coût se répétait à CHAQUE clic, ce qui explique la lenteur perçue.
const Home1 = lazy(() => import('./pages/Home1'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const Tarifs = lazy(() => import('./pages/Tarifs'));
const Confidentialite = lazy(() => import('./pages/Confidentialite'));
const Connexion = lazy(() => import('./pages/Connexion'));
const Contact = lazy(() => import('./pages/Contact'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const ProfileCompletion = lazy(() => import('./pages/ProfileCompletion'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const PasswordChanged = lazy(() => import('./pages/PasswordChanged'));
const Poll = lazy(() => import('./pages/Poll'));
const PollCandidates = lazy(() => import('./pages/PollCandidates'));
const PollRules = lazy(() => import('./pages/PollRules'));
const PollFaq = lazy(() => import('./pages/PollFaq'));
const PollNews = lazy(() => import('./pages/PollNews'));
const PollGallery = lazy(() => import('./pages/PollGallery'));
const PollPartners = lazy(() => import('./pages/PollPartners'));
const PollContact = lazy(() => import('./pages/PollContact'));
const PollResults = lazy(() => import('./pages/PollResults'));
const PollRanking = lazy(() => import('./pages/PollRanking'));
const CandidateDetail = lazy(() => import('./pages/CandidateDetail'));
const PollHelp = lazy(() => import('./pages/PollHelp'));
const PollPv = lazy(() => import('./pages/PollPv'));
const PaidVoteTunnel = lazy(() => import('./pages/PaidVoteTunnel'));
const FreeVoteTunnel = lazy(() => import('./pages/FreeVoteTunnel'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));
const DashboardV2Home = lazy(() => import('./pages/dashboard-v2/DashboardV2Home'));
const DashboardV2ActivityIndex = lazy(() => import('./pages/dashboard-v2/DashboardV2Activity').then((m) => ({ default: m.DashboardV2ActivityIndex })));
const DashboardV2Votes = lazy(() => import('./pages/dashboard-v2/DashboardV2Activity').then((m) => ({ default: m.DashboardV2Votes })));
const DashboardV2Tickets = lazy(() => import('./pages/dashboard-v2/DashboardV2Activity').then((m) => ({ default: m.DashboardV2Tickets })));
const DashboardV2Donations = lazy(() => import('./pages/dashboard-v2/DashboardV2Activity').then((m) => ({ default: m.DashboardV2Donations })));
const DashboardV2Participations = lazy(() => import('./pages/dashboard-v2/DashboardV2Activity').then((m) => ({ default: m.DashboardV2Participations })));
const DashboardV2CampaignsList = lazy(() => import('./pages/dashboard-v2/DashboardV2Campaigns').then((m) => ({ default: m.DashboardV2CampaignsList })));
const DashboardV2CampaignDetail = lazy(() => import('./pages/dashboard-v2/DashboardV2Campaigns').then((m) => ({ default: m.DashboardV2CampaignDetail })));
const DashboardV2CampaignTypeSelector = lazy(() => import('./pages/dashboard-v2/DashboardV2CampaignsNew').then((m) => ({ default: m.DashboardV2CampaignTypeSelector })));
const DashboardV2CreatePoll = lazy(() => import('./pages/dashboard-v2/DashboardV2CampaignsNew').then((m) => ({ default: m.DashboardV2CreatePoll })));
const DashboardV2Finances = lazy(() => import('./pages/dashboard-v2/DashboardV2Finances'));
const DashboardV2Notifications = lazy(() => import('./pages/dashboard-v2/DashboardV2Notifications'));
const DashboardV2Profile = lazy(() => import('./pages/dashboard-v2/DashboardV2Profile'));
const DashboardV2Settings = lazy(() => import('./pages/dashboard-v2/DashboardV2Settings'));
const DashboardV2SupportList = lazy(() => import('./pages/dashboard-v2/DashboardV2Support').then((m) => ({ default: m.DashboardV2SupportList })));
const DashboardV2TicketDetail = lazy(() => import('./pages/dashboard-v2/DashboardV2Support').then((m) => ({ default: m.DashboardV2TicketDetail })));
const OrganizerSettings = lazy(() => import('./pages/OrganizerSettings'));
const ManageCandidates = lazy(() => import('./pages/ManageCandidates'));
const ManageUniqueCodes = lazy(() => import('./pages/ManageUniqueCodes'));
const CampaignAnalytics = lazy(() => import('./pages/CampaignAnalytics'));
// Réutilisées telles quelles dans le shell V2 (mêmes composants, layout
// commun) -- imports séparés pour ne pas dupliquer les chunks lazy.
const ManageCandidatesV2 = lazy(() => import('./pages/ManageCandidates'));
const ManageUniqueCodesV2 = lazy(() => import('./pages/ManageUniqueCodes'));
const CampaignAnalyticsV2 = lazy(() => import('./pages/CampaignAnalytics'));
const DashboardV2CampaignContent = lazy(() => import('./pages/dashboard-v2/DashboardV2CampaignContent'));
const SupportTickets = lazy(() => import('./pages/SupportTickets'));
const TicketDetail = lazy(() => import('./pages/TicketDetail'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const PartnerPage = lazy(() => import('./pages/PartnerPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CguPage = lazy(() => import('./pages/CguPage'));
const CgvPage = lazy(() => import('./pages/CgvPage'));
const MentionsLegalesPage = lazy(() => import('./pages/MentionsLegalesPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));
const HowItWorksPageV2 = lazy(() => import('./pages/HowItWorksPageV2'));
const AboutPageV2 = lazy(() => import('./pages/AboutPageV2'));
const PartnerPageV2 = lazy(() => import('./pages/PartnerPageV2'));
const RegisterPageV2 = lazy(() => import('./pages/RegisterPageV2'));
const MentionsLegalesPageV2 = lazy(() => import('./pages/MentionsLegalesPageV2'));

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white">
      <h1 className="text-3xl font-heading text-ink-900 mb-2">404 — Page introuvable</h1>
      <p className="text-ink-700">
        <a href="/contact" className="text-blue-500 underline">Retour à la page de contact</a>
      </p>
    </div>
  );
}

// Tout le système d'authentification (connexion, inscription, vérification
// email, mot de passe oublié/réinitialisé) n'affiche jamais le bouton
// WhatsApp flottant -- demandé explicitement, ces pages sont des tunnels
// dédiés (pas des pages de contenu landing) où ce bouton n'a pas sa place.
const AUTH_ROUTE_PREFIXES = [
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
  '/reinitialiser-mot-de-passe',
  '/mot-de-passe-modifie',
];

// La section Scrutin & Vote a son propre contact/support intégré à chaque
// page (footer de campagne, page Contact dédiée, page Aide/Signalement) --
// le bouton WhatsApp flottant du site vitrine n'y correspond à rien de
// configuré pour la campagne affichée et n'a plus lieu d'être ici.
const POLL_ROUTE_PREFIX = '/vote/';

// Dashboard V2 a son propre bouton flottant "Créer une campagne" (voir
// DashboardV2Layout) qui remplace le WhatsApp flottant sur ces pages --
// jamais les deux affichés ensemble.
const DASHBOARD_V2_PREFIX = '/dashboard-v2';

function App() {
  const { supportWhatsAppNumber } = usePlatformConfig();
  const location = useLocation();
  const isAuthRoute = AUTH_ROUTE_PREFIXES.some(
    (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
  );
  const isPollRoute = location.pathname.startsWith(POLL_ROUTE_PREFIX);
  const isDashboardV2Route = location.pathname === DASHBOARD_V2_PREFIX || location.pathname.startsWith(`${DASHBOARD_V2_PREFIX}/`);

  return (
    <div className="min-h-screen bg-white">
      {/* Ancre requise par le widget Google Translate (google.translate.TranslateElement
          s'attache à cet id) -- une seule fois, globalement, sinon le widget
          ne s'initialise jamais et applyLanguage() se rabat systématiquement
          sur un rechargement complet de page (lent) au lieu de traduire en
          place. Volontairement invisible : on n'affiche jamais l'UI de Google. */}
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
      <SparkleCursor />
      <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home1 />} />
        <Route path="/evenements" element={<EventsPage />} />
        <Route path="/tarifs" element={<Tarifs />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/a-propos" element={<AboutPage />} />
        <Route path="/comment-ca-marche" element={<HowItWorksPage />} />
        <Route path="/partenaire" element={<PartnerPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/cgu" element={<CguPage />} />
        <Route path="/cgv" element={<CgvPage />} />
        <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
        <Route path="/cookies" element={<CookiesPage />} />

        {/* V2 — refontes des pages non conçues par le CPO, V1 inchangées */}
        <Route path="/comment-ca-marche/v2" element={<HowItWorksPageV2 />} />
        <Route path="/a-propos/v2" element={<AboutPageV2 />} />
        <Route path="/partenaire/v2" element={<PartnerPageV2 />} />
        <Route path="/inscription/v2" element={<RegisterPageV2 />} />
        <Route path="/mentions-legales/v2" element={<MentionsLegalesPageV2 />} />

        {/* Inscription / mot de passe */}
        <Route path="/inscription/verification" element={<EmailVerification />} />
        <Route path="/inscription/profil" element={<ProfileCompletion />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
        <Route path="/mot-de-passe-modifie" element={<PasswordChanged />} />

        {/* Scrutins / vote */}
        <Route path="/vote/:slug" element={<Poll />} />
        <Route path="/vote/:slug/candidats" element={<PollCandidates />} />
        <Route path="/vote/:slug/regles" element={<PollRules />} />
        <Route path="/vote/:slug/faq" element={<PollFaq />} />
        <Route path="/vote/:slug/actualites" element={<PollNews />} />
        <Route path="/vote/:slug/galerie" element={<PollGallery />} />
        <Route path="/vote/:slug/partenaires" element={<PollPartners />} />
        <Route path="/vote/:slug/contact" element={<PollContact />} />
        <Route path="/vote/:slug/resultats" element={<PollResults />} />
        <Route path="/vote/:slug/classement" element={<PollRanking />} />
        <Route path="/vote/:slug/candidat/:candidateId" element={<CandidateDetail />} />
        <Route path="/vote/:slug/aide" element={<PollHelp />} />
        <Route path="/vote/:slug/pv" element={<PollPv />} />
        <Route path="/vote/:slug/voter/payer" element={<PaidVoteTunnel />} />
        <Route path="/vote/:slug/voter/gratuit" element={<FreeVoteTunnel />} />

        {/* Espace organisateur — OrganizerSessionGate repeuple la session
            depuis le cookie serveur (2h glissantes) si sessionStorage a été
            vidé (nouvel onglet / navigateur rouvert), pour ne jamais éjecter
            un organisateur encore valablement connecté. */}
        <Route path="/dashboard" element={<OrganizerSessionGate><OrganizerDashboard /></OrganizerSessionGate>} />
        <Route path="/dashboard/parametres" element={<OrganizerSessionGate><OrganizerSettings /></OrganizerSessionGate>} />
        <Route path="/dashboard/campagnes/:campaignId/candidats" element={<OrganizerSessionGate><ManageCandidates /></OrganizerSessionGate>} />
        <Route path="/dashboard/campagnes/:campaignId/codes" element={<OrganizerSessionGate><ManageUniqueCodes /></OrganizerSessionGate>} />
        <Route path="/dashboard/campagnes/:campaignId/analytics" element={<OrganizerSessionGate><CampaignAnalytics /></OrganizerSessionGate>} />

        {/* Support */}
        <Route path="/dashboard/support" element={<OrganizerSessionGate><SupportTickets /></OrganizerSessionGate>} />
        <Route path="/dashboard/support/:ticketId" element={<OrganizerSessionGate><TicketDetail /></OrganizerSessionGate>} />

        {/* Espace organisateur V2 -- refonte complète (menu, widgets), V1
            ci-dessus reste intacte et accessible. */}
        <Route path="/dashboard-v2" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2Home /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/activite" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2ActivityIndex /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/votes" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2Votes /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/billets" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2Tickets /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/dons" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2Donations /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/participations" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2Participations /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/campagnes" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2CampaignsList /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/campagnes/nouvelle" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2CampaignTypeSelector /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/campagnes/nouvelle/scrutin" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2CreatePoll /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/campagnes/:campaignId" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2CampaignDetail /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/campagnes/:campaignId/candidats" element={<OrganizerSessionGate><DashboardV2Layout><ManageCandidatesV2 /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/campagnes/:campaignId/codes" element={<OrganizerSessionGate><DashboardV2Layout><ManageUniqueCodesV2 /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/campagnes/:campaignId/analytics" element={<OrganizerSessionGate><DashboardV2Layout><CampaignAnalyticsV2 /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/campagnes/:campaignId/contenu" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2CampaignContent /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/finances" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2Finances /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/notifications" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2Notifications /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/profil" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2Profile /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/parametres" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2Settings /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/support" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2SupportList /></DashboardV2Layout></OrganizerSessionGate>} />
        <Route path="/dashboard-v2/support/:ticketId" element={<OrganizerSessionGate><DashboardV2Layout><DashboardV2TicketDetail /></DashboardV2Layout></OrganizerSessionGate>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>

      {!isAuthRoute && !isPollRoute && !isDashboardV2Route && (
        <WhatsAppFloatingButton
          phoneNumber={supportWhatsAppNumber}
          message="Bonjour, j'ai besoin d'aide sur Moledi Events."
        />
      )}
      <CookieConsentBanner />
    </div>
  );
}

export default App;
