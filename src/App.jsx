import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Tarifs from "./pages/Tarifs.jsx";
import Connexion from "./pages/Connexion.jsx";
import Confidentialite from "./pages/Confidentialite.jsx";
import ContactPage from "./pages/Contact.jsx";
import EmailVerificationPage from "./pages/EmailVerification.jsx";
import ProfileCompletionPage from "./pages/ProfileCompletion.jsx";
import ForgotPasswordPage from "./pages/ForgotPassword.jsx";
import ResetPasswordPage from "./pages/ResetPassword.jsx";
import PasswordChangedPage from "./pages/PasswordChanged.jsx";
import PollPage from "./pages/Poll.jsx";
import PaidVoteTunnel from "./pages/PaidVoteTunnel.jsx";
import FreeVoteTunnel from "./pages/FreeVoteTunnel.jsx";
import OrganizerDashboardPage from "./pages/OrganizerDashboard.jsx";
import OrganizerSettingsPage from "./pages/OrganizerSettings.jsx";
import ManageCandidatesPage from "./pages/ManageCandidates.jsx";
import ManageUniqueCodesPage from "./pages/ManageUniqueCodes.jsx";
import CampaignAnalyticsPage from "./pages/CampaignAnalytics.jsx";
import SupportTicketsPage from "./pages/SupportTickets.jsx";
import TicketDetailPage from "./pages/TicketDetail.jsx";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton.jsx";

function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#F8F7F4",
        color: "#1A1A2E",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        404 — Page introuvable
      </h1>
      <p style={{ opacity: 0.7 }}>
        <a href="/contact" style={{ color: "#1E3A8A", textDecoration: "underline" }}>
          Retour à la page de contact
        </a>
      </p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tarifs" element={<Tarifs />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/inscription/verification" element={<EmailVerificationPage />} />
        <Route path="/inscription/profil" element={<ProfileCompletionPage />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
        <Route path="/mot-de-passe-modifie" element={<PasswordChangedPage />} />
        <Route path="/vote/:slug" element={<PollPage />} />
        <Route path="/vote/:slug/voter/payer" element={<PaidVoteTunnel />} />
        <Route path="/vote/:slug/voter/gratuit" element={<FreeVoteTunnel />} />
        <Route path="/organisateur/tableau-de-bord" element={<OrganizerDashboardPage />} />
        <Route path="/organisateur/parametres" element={<OrganizerSettingsPage />} />
        <Route path="/organisateur/campagnes/:campaignId/candidats" element={<ManageCandidatesPage />} />
        <Route path="/organisateur/campagnes/:campaignId/codes-uniques" element={<ManageUniqueCodesPage />} />
        <Route path="/organisateur/campagnes/:campaignId/analytics" element={<CampaignAnalyticsPage />} />
        <Route path="/support/tickets" element={<SupportTicketsPage />} />
        <Route path="/support/tickets/:ticketId" element={<TicketDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <WhatsAppFloatingButton
        phoneNumber="237600000000"
        message="Bonjour, j'ai besoin d'aide sur Moledi Events."
      />
    </>
  );
}