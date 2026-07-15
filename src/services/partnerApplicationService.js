// services/partnerApplicationService.js
//
// Contient toute la logique métier du formulaire "Devenir partenaire" :
// validation des champs + soumission (POST /api/partner-applications, qui
// enregistre la candidature en base et envoie les emails admin + candidat
// -- voir moledi-backend/src/controllers/partnerApplicationsController.js).
//
// Pourquoi un fichier "service" séparé du composant de formulaire : le
// formulaire (components/PartnerApplicationForm.jsx) ne doit s'occuper que
// de l'affichage et des interactions utilisateur. Toute la logique qui
// pourrait être testée indépendamment d'un rendu React (validation,
// construction de la requête) vit ici.

// --- Validation ---------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_DESCRIPTION_LENGTH = 20;

/**
 * Valide les champs du formulaire côté client.
 * ⚠️ Cette validation est un CONFORT pour l'utilisateur (retour immédiat),
 * elle ne remplace jamais une revalidation côté serveur — cf. Definition of
 * Done commune du module Landing Pages ("toute validation client est
 * revalidée côté serveur"). Le jour où le vrai endpoint existe, il doit
 * refaire exactement ces mêmes vérifications de son côté.
 *
 * @param {{ organizationName: string, email: string, phone: string, type: string, description: string }} data
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validatePartnerApplication(data) {
  const errors = {};

  if (!data.organizationName || data.organizationName.trim().length === 0) {
    errors.organizationName = "Le nom de l'organisation est requis.";
  }

  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errors.email = 'Adresse email invalide.';
  }

  if (!data.phone || data.phone.trim().length < 8) {
    errors.phone = 'Numéro de téléphone invalide.';
  }

  if (!data.type) {
    errors.type = 'Merci de choisir un type de partenariat.';
  }

  if (!data.description || data.description.trim().length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// --- Point d'entrée public ------------------------------------------------

/**
 * Soumet une candidature partenaire au backend : POST /api/partner-applications
 * enregistre la candidature en base PUIS envoie les deux emails (admin +
 * candidat) en best effort côté serveur — un échec d'email n'y fait jamais
 * échouer la requête (voir partnerApplicationsController.js).
 *
 * @param {{ organizationName: string, email: string, phone: string, type: string, description: string }} data
 * @returns {Promise<{ success: boolean, applicationId?: string }>}
 */
export async function submitPartnerApplication(data) {
  const { valid, errors } = validatePartnerApplication(data);
  if (!valid) {
    // Le composant appelant est censé avoir déjà validé avant d'arriver
    // ici, mais on ne fait jamais confiance uniquement au flux normal :
    // double vérification ici aussi.
    throw new Error('INVALID_APPLICATION: ' + JSON.stringify(errors));
  }

  const res = await fetch('/api/partner-applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const responseData = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(responseData.error || 'PARTNER_APPLICATION_FAILED');
  }

  return { success: true, applicationId: responseData.applicationId };
}
