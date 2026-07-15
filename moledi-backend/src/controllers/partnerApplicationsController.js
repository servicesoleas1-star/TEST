import { createPartnerApplication, getAdminNotificationEmail } from "../store/partnerApplicationsStore.js";
import { sendMail } from "../utils/mailer.js";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const MIN_DESCRIPTION_LENGTH = 20;

/**
 * POST /api/partner-applications
 * Body: { organizationName, email, phone, type, description }
 * Revalide côté serveur les mêmes règles que le formulaire (voir
 * services/partnerApplicationService.js côté frontend), enregistre la
 * candidature, PUIS envoie les deux emails (admin + candidat) en best
 * effort : un échec d'email ne doit jamais faire perdre la candidature déjà
 * enregistrée.
 */
export async function submitPartnerApplication(req, res) {
  const { organizationName, email, phone, type, description } = req.body;

  if (!organizationName || typeof organizationName !== "string" || !organizationName.trim()) {
    return res.status(400).json({ error: "Le nom de l'organisation est requis." });
  }
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }
  if (!phone || typeof phone !== "string" || phone.trim().length < 8) {
    return res.status(400).json({ error: "Numéro de téléphone invalide." });
  }
  if (!type || typeof type !== "string") {
    return res.status(400).json({ error: "Merci de choisir un type de partenariat." });
  }
  if (!description || typeof description !== "string" || description.trim().length < MIN_DESCRIPTION_LENGTH) {
    return res.status(400).json({ error: `La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères.` });
  }

  const application = await createPartnerApplication({
    organizationName: organizationName.trim(),
    email,
    phone: phone.trim(),
    partnershipType: type,
    description: description.trim(),
  });

  try {
    const adminEmail = await getAdminNotificationEmail();
    const emailJobs = [
      sendMail({
        to: email,
        subject: "Votre candidature partenaire — Moledi Events",
        html: `<p>Bonjour,</p><p>Nous avons bien reçu votre candidature de partenariat (${type}) pour <strong>${organizationName}</strong>. Notre équipe reviendra vers vous rapidement.</p>`,
      }),
    ];
    if (adminEmail) {
      emailJobs.push(
        sendMail({
          to: adminEmail,
          subject: `Nouvelle candidature partenaire : ${organizationName}`,
          html: `<p>Nouvelle candidature reçue :</p><ul><li>Organisation : ${organizationName}</li><li>Email : ${email}</li><li>Téléphone : ${phone}</li><li>Type : ${type}</li><li>Description : ${description}</li></ul>`,
        })
      );
    }
    await Promise.all(emailJobs);
  } catch (err) {
    console.warn("Envoi des emails de candidature partenaire échoué :", err.message);
  }

  return res.status(201).json({ success: true, applicationId: application.application_id });
}
