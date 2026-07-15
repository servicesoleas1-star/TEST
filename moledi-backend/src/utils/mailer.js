import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Envoi d'emails réel via SMTP (nodemailer). Tant que SMTP_HOST/SMTP_USER/
// SMTP_PASS ne sont pas renseignés dans .env (valeurs par défaut de
// .env.example, ex. "your_email@gmail.com"), aucun transporteur n'est créé
// et sendMail() se contente de logguer en console — mêmes messages
// [EMAIL]/[EMAIL SKIPPED] qu'avant, pour ne jamais casser le flux
// d'inscription/reset en dev local sans SMTP configuré.
// ---------------------------------------------------------------------------

const SMTP_PLACEHOLDER_VALUES = ["your_email@gmail.com", "your_app_password_here", ""];

function isSmtpConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return (
    SMTP_HOST &&
    SMTP_USER &&
    SMTP_PASS &&
    !SMTP_PLACEHOLDER_VALUES.includes(SMTP_USER) &&
    !SMTP_PLACEHOLDER_VALUES.includes(SMTP_PASS)
  );
}

let transporter = null;

function getTransporter() {
  if (!isSmtpConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_PORT === "465",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Envoie un email si SMTP est configuré, sinon logue son contenu en
 * console (dev local / SMTP pas encore renseigné). N'a jamais vocation à
 * faire échouer le flux appelant : les appelants (auth, candidature
 * partenaire...) doivent traiter l'envoi comme un best effort et ne jamais
 * bloquer l'action principale (création de compte, enregistrement...) sur
 * une erreur d'email.
 *
 * @param {{ to: string, subject: string, html: string }} options
 */
export async function sendMail({ to, subject, html }) {
  const from = process.env.SMTP_FROM || "noreply@moledievents.cm";
  const smtp = getTransporter();

  if (!smtp) {
    console.log(`[EMAIL SKIPPED — SMTP non configuré] À: ${to} | Sujet: ${subject}`);
    return;
  }

  await smtp.sendMail({ from, to, subject, html });
}
