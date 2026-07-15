// components/PartnerApplicationForm.jsx
//
// Formulaire de candidature "Devenir partenaire". Gère 4 états d'affichage :
// idle (formulaire normal) -> submitting (bouton désactivé) -> success
// (message de confirmation) ou error (message d'erreur, formulaire
// réaffiché pour correction).
//
// Toute la logique de validation/soumission vit dans
// services/partnerApplicationService.js -- ce composant ne fait
// qu'appeler ces fonctions et afficher le résultat.

import { useState } from 'react';
import { getPartnershipTypes } from './config/partnershipTypesConfig';
import {
  validatePartnerApplication,
  submitPartnerApplication,
} from '../services/partnerApplicationService';

const EMPTY_FORM = {
  organizationName: '',
  email: '',
  phone: '',
  type: '',
  description: '',
};

export default function PartnerApplicationForm() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  // status : 'idle' | 'submitting' | 'success' | 'error'
  const [status, setStatus] = useState('idle');

  const partnershipTypes = getPartnershipTypes();

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // On efface l'erreur du champ dès que l'utilisateur recommence à taper,
    // pour ne pas laisser un message d'erreur obsolète affiché inutilement.
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const { valid, errors: validationErrors } = validatePartnerApplication(formData);
    if (!valid) {
      setErrors(validationErrors);
      return;
    }

    setStatus('submitting');
    try {
      await submitPartnerApplication(formData);
      setStatus('success');
      setFormData(EMPTY_FORM);
    } catch (err) {
      console.error('Échec de la soumission de candidature partenaire :', err);
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="rounded-2xl bg-[color:var(--color-surface,#F5F6F8)] p-8 text-center"
      >
        <p className="text-lg font-semibold text-[color:var(--color-ink,#0B1324)]">
          Merci pour votre candidature !
        </p>
        <p className="mt-2 text-[color:var(--color-slate,#475569)]">
          Un email de confirmation vous a été envoyé. Notre équipe reviendra vers vous
          rapidement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {status === 'error' && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques instants.
        </p>
      )}

      <Field label="Nom de l'organisation" error={errors.organizationName}>
        <input
          type="text"
          value={formData.organizationName}
          onChange={(e) => handleChange('organizationName', e.target.value)}
          className={inputClass(errors.organizationName)}
        />
      </Field>

      <Field label="Email" error={errors.email}>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={inputClass(errors.email)}
        />
      </Field>

      <Field label="Téléphone" error={errors.phone}>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          className={inputClass(errors.phone)}
        />
      </Field>

      <Field label="Type de partenariat souhaité" error={errors.type}>
        <select
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className={inputClass(errors.type)}
        >
          <option value="">-- Choisir --</option>
          {partnershipTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Description de votre proposition" error={errors.description}>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className={inputClass(errors.description)}
        />
      </Field>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-full bg-[color:var(--color-primary,#FF6A00)] px-6 py-3
                   font-semibold text-white transition hover:bg-[color:var(--color-orange-900,#F8533A)]
                   disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' ? 'Envoi en cours...' : 'Envoyer ma candidature'}
      </button>
    </form>
  );
}

// --- Petits composants internes, pas exportés : pas besoin d'être
// réutilisables ailleurs, ils ne servent qu'à ce formulaire précis. ---

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[color:var(--color-ink,#0B1324)]">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(hasError) {
  return `w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2
          ${
            hasError
              ? 'border-red-400 focus:ring-red-400'
              : 'border-[color:var(--color-border,#E2E8F0)] focus:ring-[color:var(--color-secondary,#2B6BFF)]'
          }`;
}
