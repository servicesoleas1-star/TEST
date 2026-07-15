// components/RegistrationForm.jsx
//
// Formulaire d'inscription organisateur. Gère :
//  - validation synchrone (voir registrationService.validateRegistration)
//  - vérification d'unicité de l'email en temps réel, avec debounce 500ms
//  - indicateur de robustesse du mot de passe (PasswordStrengthMeter)
//  - soumission (registrationService.submitRegistration)
//
// Comme sur les formulaires du module Landing Pages : ce composant ne
// contient aucune règle métier lui-même, il appelle uniquement les
// fonctions exportées par services/registrationService.js.

import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getActiveAcquisitionSources } from './config/acquisitionSourcesConfig';
import { DEFAULT_PHONE_COUNTRY_CODE } from './config/phoneCountriesConfig';
import {
  validateRegistration,
  checkEmailAvailability,
  submitRegistration,
} from '../services/registrationService';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import PhoneCountrySelect from './PhoneCountrySelect';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
  phone: '',
  password: '',
  acquisitionSourceId: '',
  cguAccepted: false,
};

const EMAIL_CHECK_DEBOUNCE_MS = 500;

export default function RegistrationForm() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  // status global de soumission : 'idle' | 'submitting' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');

  // état de la vérification email temps réel :
  // 'idle' | 'checking' | 'available' | 'taken'
  const [emailCheckStatus, setEmailCheckStatus] = useState('idle');
  const emailCheckTimeoutRef = useRef(null);

  const [acquisitionSources, setAcquisitionSources] = useState([]);
  useEffect(() => {
    getActiveAcquisitionSources().then(setAcquisitionSources);
  }, []);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  // Vérification d'unicité de l'email avec debounce : on ne veut pas
  // interroger le serveur à chaque frappe, seulement 500ms après la
  // dernière frappe.
  useEffect(() => {
    clearTimeout(emailCheckTimeoutRef.current);

    const isFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    if (!isFormatValid) {
      setEmailCheckStatus('idle');
      return;
    }

    setEmailCheckStatus('checking');
    emailCheckTimeoutRef.current = setTimeout(async () => {
      const { available } = await checkEmailAvailability(formData.email);
      setEmailCheckStatus(available ? 'available' : 'taken');
    }, EMAIL_CHECK_DEBOUNCE_MS);

    return () => clearTimeout(emailCheckTimeoutRef.current);
  }, [formData.email]);

  async function handleSubmit(event) {
    event.preventDefault();

    const { valid, errors: validationErrors } = validateRegistration(formData);
    if (!valid || emailCheckStatus === 'taken') {
      setErrors(validationErrors);
      return;
    }

    setStatus('submitting');
    setSubmitErrorMessage('');
    try {
      await submitRegistration(formData);
      setStatus('success');
    } catch (err) {
      if (err.message === 'EMAIL_ALREADY_USED') {
        setSubmitErrorMessage('Cet email est déjà utilisé par un autre compte.');
      } else {
        setSubmitErrorMessage("Une erreur est survenue. Merci de réessayer.");
      }
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="text-center">
        <CheckCircle2
          size={48}
          className="mx-auto mb-4 text-[color:var(--color-primary,#FF6A00)]"
        />
        <p className="text-xl font-semibold text-[color:var(--color-ink,#0B1324)]">
          Compte créé avec succès !
        </p>
        <p className="mt-2 text-[color:var(--color-slate,#475569)]">
          Un email de vérification a été envoyé à <strong>{formData.email}</strong>.
          Cliquez sur le lien qu'il contient pour activer votre compte.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {status === 'error' && submitErrorMessage && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {submitErrorMessage}
        </p>
      )}

      {/* Nom complet */}
      <Field label="Nom complet" error={errors.fullName}>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          className={inputClass(errors.fullName)}
          autoComplete="name"
        />
      </Field>

      {/* Email avec vérification temps réel */}
      <Field label="Email" error={errors.email}>
        <div className="relative">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputClass(errors.email || emailCheckStatus === 'taken')}
            autoComplete="email"
          />
          <EmailCheckIcon status={emailCheckStatus} />
        </div>
        {emailCheckStatus === 'taken' && (
          <p className="mt-1 text-sm text-red-600">Cet email est déjà utilisé.</p>
        )}
        {emailCheckStatus === 'available' && (
          <p className="mt-1 text-sm text-green-600">Email disponible.</p>
        )}
      </Field>

      {/* Pays + téléphone */}
      <PhoneCountrySelect
        countryCode={formData.phoneCountryCode}
        phone={formData.phone}
        onCountryChange={(code) => handleChange('phoneCountryCode', code)}
        onPhoneChange={(phone) => handleChange('phone', phone)}
        error={errors.phone}
      />

      {/* Mot de passe + indicateur de robustesse */}
      <Field label="Mot de passe" error={errors.password}>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={inputClass(errors.password)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-slate,#475569)]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <PasswordStrengthMeter password={formData.password} />
      </Field>

      {/* Source d'acquisition */}
      <Field label="Comment avez-vous connu Moledi Events ?" error={errors.acquisitionSourceId}>
        <select
          value={formData.acquisitionSourceId}
          onChange={(e) => handleChange('acquisitionSourceId', e.target.value)}
          className={inputClass(errors.acquisitionSourceId)}
        >
          <option value="">-- Choisir --</option>
          {acquisitionSources.map((s) => (
            <option key={s.source_id} value={s.source_id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      {/* Case CGU -- lien vers la page /cgu déjà livrée sur le ticket LAN-14 */}
      <div>
        <label className="flex items-start gap-2 text-sm text-[color:var(--color-slate,#475569)]">
          <input
            type="checkbox"
            checked={formData.cguAccepted}
            onChange={(e) => handleChange('cguAccepted', e.target.checked)}
            className="mt-0.5"
          />
          <span>
            J'ai lu et j'accepte les{' '}
            <a
              href="/cgu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[color:var(--color-secondary,#2B6BFF)] underline"
            >
              Conditions Générales d'Utilisation
            </a>
            .
          </span>
        </label>
        {errors.cguAccepted && (
          <p className="mt-1 text-sm text-red-600">{errors.cguAccepted}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="flex w-full items-center justify-center gap-2 rounded-full
                   bg-[color:var(--color-primary,#FF6A00)] px-6 py-3 font-semibold text-white
                   transition hover:bg-[color:var(--color-orange-900,#F8533A)]
                   disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' && <Loader2 size={18} className="animate-spin" />}
        {status === 'submitting' ? 'Création en cours...' : 'Créer mon compte'}
      </button>
    </form>
  );
}

// --- Petits composants internes ---------------------------------------------

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
  return `w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-red-400 focus:ring-red-400'
      : 'border-[color:var(--color-border,#E2E8F0)] focus:ring-[color:var(--color-secondary,#2B6BFF)]'
  }`;
}

function EmailCheckIcon({ status }) {
  const baseClass = 'absolute right-3 top-1/2 -translate-y-1/2';
  if (status === 'checking') {
    return <Loader2 size={18} className={`${baseClass} animate-spin text-[color:var(--color-slate,#475569)]`} />;
  }
  if (status === 'available') {
    return <CheckCircle2 size={18} className={`${baseClass} text-green-600`} />;
  }
  if (status === 'taken') {
    return <XCircle size={18} className={`${baseClass} text-red-600`} />;
  }
  return null;
}
