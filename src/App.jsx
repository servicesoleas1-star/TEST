import { Routes, Route } from 'react-router-dom';
import Home1 from './pages/Home1';
import Home2 from './pages/Home2';
import Tarifs from './pages/Tarifs';
import Confidentialite from './pages/Confidentialite';
import Connexion from './pages/Connexion';
import Contact from './pages/Contact';
import EmailVerification from './pages/EmailVerification';
import ProfileCompletion from './pages/ProfileCompletion';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PasswordChanged from './pages/PasswordChanged';
import Poll from './pages/Poll';
import PaidVoteTunnel from './pages/PaidVoteTunnel';
import FreeVoteTunnel from './pages/FreeVoteTunnel';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerSettings from './pages/OrganizerSettings';
import ManageCandidates from './pages/ManageCandidates';
import ManageUniqueCodes from './pages/ManageUniqueCodes';
import CampaignAnalytics from './pages/CampaignAnalytics';
import SupportTickets from './pages/SupportTickets';
import TicketDetail from './pages/TicketDetail';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import { getPlatformConfig } from './components/PlatformConfig';

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

function App() {
  const { supportWhatsAppNumber } = getPlatformConfig();

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* Two homepage variants: `/` is Proposition 1 (parallax stacked
            panels), `/v2` is Proposition 2 (the original ZUI 6-universes
            zoom animation). Everything below the storytelling section is
            identical between the two. */}
        <Route path="/" element={<Home1 />} />
        <Route path="/v2" element={<Home2 />} />
        <Route path="/tarifs" element={<Tarifs />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/contact" element={<Contact />} />

        {/* Inscription / mot de passe */}
        <Route path="/inscription/verification" element={<EmailVerification />} />
        <Route path="/inscription/profil" element={<ProfileCompletion />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
        <Route path="/mot-de-passe-modifie" element={<PasswordChanged />} />

        {/* Scrutins / vote */}
        <Route path="/vote/:slug" element={<Poll />} />
        <Route path="/vote/:slug/voter/payer" element={<PaidVoteTunnel />} />
        <Route path="/vote/:slug/voter/gratuit" element={<FreeVoteTunnel />} />

        {/* Espace organisateur */}
        <Route path="/organisateur/tableau-de-bord" element={<OrganizerDashboard />} />
        <Route path="/organisateur/parametres" element={<OrganizerSettings />} />
        <Route path="/organisateur/campagnes/:campaignId/candidats" element={<ManageCandidates />} />
        <Route path="/organisateur/campagnes/:campaignId/codes-uniques" element={<ManageUniqueCodes />} />
        <Route path="/organisateur/campagnes/:campaignId/analytics" element={<CampaignAnalytics />} />

        {/* Support */}
        <Route path="/support/tickets" element={<SupportTickets />} />
        <Route path="/support/tickets/:ticketId" element={<TicketDetail />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <WhatsAppFloatingButton
        phoneNumber={supportWhatsAppNumber}
        message="Bonjour, j'ai besoin d'aide sur Moledi Events."
      />
    </div>
  );
}

export default App;
