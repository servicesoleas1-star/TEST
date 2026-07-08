import React from "react";
 
// ---------------------------------------------------------------------------
// Moledi Events — Confirmation de réinitialisation (/mot-de-passe-modifie)
// ---------------------------------------------------------------------------
 
export default function PasswordChangedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 md:p-10 text-center border border-ink-200">
        <div className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-primary-50">
          <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-primary" fill="none" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2 text-ink-900">
          Mot de passe modifié
        </h1>
        <p className="text-sm mb-6 text-ink-700">
          Votre mot de passe a été mis à jour avec succès. Vous avez été déconnecté de tous vos
          appareils par sécurité — reconnectez-vous avec votre nouveau mot de passe.
        </p>
        <a
          href="/connexion"
          className="btn btn-primary inline-block"
        >
          Se connecter
        </a>
      </div>
    </div>
  );
}