import React, { useState } from "react";
import WhatsAppFloatingButton from "../components/WhatsAppFloatingButton.jsx";

// ---------------------------------------------------------------------------
// Moledi Events — Page Contact (/contact)
// Palette dérivée du logo : bleu nuit #1E3A8A, orange #E8651A
// Le logo doit se trouver dans public/logo-moledi-events.png
// Le bouton WhatsApp flottant vient du composant partagé de l'équipe
// (WhatsAppFloatingButton.jsx, backlog LAN-05).
// ---------------------------------------------------------------------------

const NAVY = "#1E3A8A";
const ORANGE = "#E8651A";
const BG = "#F8F7F4";
const INK = "#1A1A2E";
const LINE = "#E4E2DC";
const LOGO_SRC = "/logo-moledi-events.png";

const SOCIALS_DEFAULT = [
  { key: "facebook", label: "Facebook", url: "https://facebook.com/moledievents" },
  { key: "instagram", label: "Instagram", url: "https://instagram.com/moledievents" },
  { key: "x", label: "X", url: "https://x.com/moledievents" },
];

// Support config (backlog: coordonnées de contact) — inlined here since it's
// only ever read by this page.
const WHATSAPP_NUMBER = '237697123456'; // Format: country code without +, then phone number

const TRANSLATIONS = {
  fr: {
    nav: { home: "Accueil", events: "Événements", pricing: "Tarifs", contact: "Contact" },
    badge: "Nous sommes là pour vous",
    title: "Contactez l'équipe Moledi Events",
    subtitle:
      "Une question, un projet d'événement, un partenariat ? Écrivez-nous ou parlez-nous directement sur WhatsApp — on vous répond vite.",
    formTitle: "Envoyez-nous un message",
    formSubtitle: "Réponse sous 24h ouvrées.",
    fields: {
      name: "Nom complet",
      namePh: "Votre nom",
      phone: "Téléphone",
      email: "Email",
      subject: "Objet",
      subjectPh: "Sélectionnez un objet",
      subjectOptions: {
        support: "Support technique",
        partnership: "Devenir partenaire",
        billing: "Question de facturation",
        other: "Autre",
      },
      message: "Message",
      messagePh: "Décrivez votre demande...",
    },
    errors: {
      name: "Le nom est requis.",
      email: "L'email est requis.",
      emailFormat: "Format d'email invalide.",
      phone: "Le téléphone est requis.",
      subject: "L'objet est requis.",
      message: "Le message est requis.",
    },
    submit: "Envoyer le message",
    sending: "Envoi en cours...",
    sentTitle: "Message envoyé",
    sentBody: "Notre équipe vous répond sous 24h ouvrées.",
    sentAnother: "Envoyer un autre message",
    contactCards: { whatsapp: "WhatsApp", email: "Email", office: "Bureau", officeValue: "Douala, Cameroun" },
    followUs: "Suivez-nous",
    footer: { rights: "Tous droits réservés.", privacy: "Confidentialité", legal: "Mentions légales", about: "À propos" },
    cookie: {
      text: "Nous utilisons des cookies pour améliorer votre expérience sur Moledi Events. En continuant, vous acceptez notre",
      link: "politique de confidentialité",
      accept: "J'accepte",
    },
  },
  en: {
    nav: { home: "Home", events: "Events", pricing: "Pricing", contact: "Contact" },
    badge: "We're here for you",
    title: "Contact the Moledi Events team",
    subtitle:
      "A question, an event project, a partnership? Write to us or reach us directly on WhatsApp — we reply fast.",
    formTitle: "Send us a message",
    formSubtitle: "Response within 24 business hours.",
    fields: {
      name: "Full name",
      namePh: "Your name",
      phone: "Phone",
      email: "Email",
      subject: "Subject",
      subjectPh: "Select a subject",
      subjectOptions: {
        support: "Technical support",
        partnership: "Become a partner",
        billing: "Billing question",
        other: "Other",
      },
      message: "Message",
      messagePh: "Describe your request...",
    },
    errors: {
      name: "Name is required.",
      email: "Email is required.",
      emailFormat: "Invalid email format.",
      phone: "Phone is required.",
      subject: "Subject is required.",
      message: "Message is required.",
    },
    submit: "Send message",
    sending: "Sending...",
    sentTitle: "Message sent",
    sentBody: "Our team will get back to you within 24 business hours.",
    sentAnother: "Send another message",
    contactCards: { whatsapp: "WhatsApp", email: "Email", office: "Office", officeValue: "Douala, Cameroon" },
    followUs: "Follow us",
    footer: { rights: "All rights reserved.", privacy: "Privacy", legal: "Legal notice", about: "About" },
    cookie: {
      text: "We use cookies to improve your experience on Moledi Events. By continuing, you accept our",
      link: "privacy policy",
      accept: "Accept",
    },
  },
};

function WaveDivider() {
  return (
    <svg
      className="w-full h-16 md:h-24"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,60 C220,10 420,110 620,60 C820,10 980,90 1200,40 L1200,0 L0,0 Z"
        fill={NAVY}
        opacity="0.06"
      />
      <path
        d="M0,80 C240,30 440,120 660,70 C860,25 1000,95 1200,55"
        fill="none"
        stroke={ORANGE}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ContactForm({ t }) {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    objet: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.nom.trim()) next.nom = t.errors.name;
    if (!form.email.trim()) next.email = t.errors.email;
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      next.email = t.errors.emailFormat;
    if (!form.telephone.trim()) next.telephone = t.errors.phone;
    if (!form.objet.trim()) next.objet = t.errors.subject;
    if (!form.message.trim()) next.message = t.errors.message;
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    // Emplacement d'intégration API : POST /api/contact
    setTimeout(() => setStatus("sent"), 800);
  };

  if (status === "sent") {
    return (
      <div className="rounded-2xl border p-8 md:p-10 text-center" style={{ borderColor: LINE }}>
        <div
          className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full"
          style={{ backgroundColor: `${ORANGE}1A` }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke={ORANGE} strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: INK }}>
          {t.sentTitle}
        </h3>
        <p className="text-sm" style={{ color: `${INK}99` }}>
          {t.sentBody}
        </p>
        <button
          onClick={() => {
            setForm({ nom: "", email: "", telephone: "", objet: "", message: "" });
            setStatus("idle");
          }}
          className="mt-6 text-sm font-semibold underline"
          style={{ color: NAVY }}
        >
          {t.sentAnother}
        </button>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:ring-2";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nom" className="block text-sm font-semibold mb-1.5" style={{ color: INK }}>
            {t.fields.name}
          </label>
          <input
            id="nom"
            type="text"
            value={form.nom}
            onChange={handleChange("nom")}
            placeholder={t.fields.namePh}
            className={fieldClass}
            style={{
              borderColor: errors.nom ? "#DC2626" : LINE,
              backgroundColor: "white",
            }}
          />
          {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom}</p>}
        </div>

        <div>
          <label htmlFor="telephone" className="block text-sm font-semibold mb-1.5" style={{ color: INK }}>
            {t.fields.phone}
          </label>
          <input
            id="telephone"
            type="tel"
            value={form.telephone}
            onChange={handleChange("telephone")}
            placeholder="+237 6XX XXX XXX"
            className={fieldClass}
            style={{
              borderColor: errors.telephone ? "#DC2626" : LINE,
              backgroundColor: "white",
            }}
          />
          {errors.telephone && <p className="mt-1 text-xs text-red-600">{errors.telephone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: INK }}>
          {t.fields.email}
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="vous@exemple.com"
          className={fieldClass}
          style={{
            borderColor: errors.email ? "#DC2626" : LINE,
            backgroundColor: "white",
          }}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="objet" className="block text-sm font-semibold mb-1.5" style={{ color: INK }}>
          {t.fields.subject}
        </label>
        <select
          id="objet"
          value={form.objet}
          onChange={handleChange("objet")}
          className={fieldClass}
          style={{
            borderColor: errors.objet ? "#DC2626" : LINE,
            backgroundColor: "white",
            color: form.objet ? INK : "#9CA3AF",
          }}
        >
          <option value="">{t.fields.subjectPh}</option>
          <option value="support">{t.fields.subjectOptions.support}</option>
          <option value="partenariat">{t.fields.subjectOptions.partnership}</option>
          <option value="facturation">{t.fields.subjectOptions.billing}</option>
          <option value="autre">{t.fields.subjectOptions.other}</option>
        </select>
        {errors.objet && <p className="mt-1 text-xs text-red-600">{errors.objet}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold mb-1.5" style={{ color: INK }}>
          {t.fields.message}
        </label>
        <textarea
          id="message"
          rows={5}
          value={form.message}
          onChange={handleChange("message")}
          placeholder={t.fields.messagePh}
          className={fieldClass + " resize-none"}
          style={{
            borderColor: errors.message ? "#DC2626" : LINE,
            backgroundColor: "white",
          }}
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full md:w-auto px-8 py-3.5 rounded-full font-semibold text-white text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        style={{ backgroundColor: ORANGE }}
      >
        {status === "sending" ? t.sending : t.submit}
      </button>
    </form>
  );
}

function ContactInfoCard({ icon, title, value, href }) {
  const content = (
    <div className="flex items-start gap-4 p-5 rounded-xl transition-colors hover:bg-black/[0.02]">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
        style={{ backgroundColor: `${NAVY}0F` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: `${INK}66` }}>
          {title}
        </p>
        <p className="text-sm font-medium mt-0.5" style={{ color: INK }}>
          {value}
        </p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    content
  );
}

function SocialLinks({ socials = SOCIALS_DEFAULT }) {
  const icons = {
    facebook: (
      <path d="M13 22v-8h2.7l.4-3.3H13V8.6c0-.95.26-1.6 1.63-1.6H16V4.1C15.7 4.07 14.68 4 13.5 4 11 4 9.3 5.5 9.3 8.3v2.4H6.6V14h2.7v8h3.7z" />
    ),
    instagram: (
      <path d="M12 2.2c2.7 0 3 0 4.1.06 1.1.05 1.8.22 2.2.37.55.2.95.46 1.36.87.41.41.67.81.87 1.36.15.4.32 1.1.37 2.2.06 1.1.06 1.4.06 4.1s0 3-.06 4.1c-.05 1.1-.22 1.8-.37 2.2-.2.55-.46.95-.87 1.36-.41.41-.81.67-1.36.87-.4.15-1.1.32-2.2.37-1.1.06-1.4.06-4.1.06s-3 0-4.1-.06c-1.1-.05-1.8-.22-2.2-.37a3.7 3.7 0 01-1.36-.87 3.7 3.7 0 01-.87-1.36c-.15-.4-.32-1.1-.37-2.2C2.2 15 2.2 14.7 2.2 12s0-3 .06-4.1c.05-1.1.22-1.8.37-2.2.2-.55.46-.95.87-1.36.41-.41.81-.67 1.36-.87.4-.15 1.1-.32 2.2-.37C8.2 2.2 8.5 2.2 12 2.2zm0 1.8c-2.66 0-2.97 0-4.02.06-.97.04-1.5.2-1.85.34-.46.18-.79.4-1.14.75-.35.35-.57.68-.75 1.14-.14.35-.3.88-.34 1.85C3.8 9.03 3.8 9.34 3.8 12s0 2.97.06 4.02c.04.97.2 1.5.34 1.85.18.46.4.79.75 1.14.35.35.68.57 1.14.75.35.14.88.3 1.85.34C9.03 20.16 9.34 20.2 12 20.2s2.97 0 4.02-.06c.97-.04 1.5-.2 1.85-.34.46-.18.79-.4 1.14-.75.35-.35.57-.68.75-1.14.14-.35.3-.88.34-1.85.06-1.05.06-1.36.06-4.02s0-2.97-.06-4.02c-.04-.97-.2-1.5-.34-1.85a3 3 0 00-.75-1.14 3 3 0 00-1.14-.75c-.35-.14-.88-.3-1.85-.34C14.97 4 14.66 4 12 4zm0 3.4a4.6 4.6 0 110 9.2 4.6 4.6 0 010-9.2zm0 1.8a2.8 2.8 0 100 5.6 2.8 2.8 0 000-5.6zm4.8-2a1.07 1.07 0 110 2.14 1.07 1.07 0 010-2.14z" />
    ),
    x: (
      <path d="M18.9 3H22l-7.6 8.7L23 21h-6.8l-5.3-6.5L4.8 21H1.7l8.1-9.3L1 3h7l4.8 5.9L18.9 3zM17.6 19h1.9L6.5 5H4.5l13.1 14z" />
    ),
  };

  return (
    <div className="flex gap-3">
      {socials.map((s) => (
        <a
          key={s.key}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
          style={{ backgroundColor: `${NAVY}0F` }}
        >
          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" style={{ fill: NAVY }} width="18" height="18">
            {icons[s.key]}
          </svg>
        </a>
      ))}
    </div>
  );
}

export default function ContactPage() {
  const [lang, setLang] = useState("fr");
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}>
      <WhatsAppFloatingButton phoneNumber={WHATSAPP_NUMBER} />

      {/* Header */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${NAVY} 0%, #14265C 100%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-16 md:pt-10 md:pb-24">
          <nav className="flex items-center justify-between mb-10 md:mb-16">
            <a href="/" className="flex items-center bg-white rounded-lg px-3 py-1.5">
              <img
                src={LOGO_SRC}
                alt="Moledi Events"
                className="h-8 md:h-9 w-auto object-contain"
              />
            </a>
            <div className="hidden md:flex items-center gap-8 text-sm text-white/80">
              <a href="/" className="hover:text-white transition-colors">{t.nav.home}</a>
              <a href="/evenements" className="hover:text-white transition-colors">{t.nav.events}</a>
              <a href="/tarifs" className="hover:text-white transition-colors">{t.nav.pricing}</a>
              <a href="/contact" className="text-white font-semibold">{t.nav.contact}</a>
            </div>
            <select
              aria-label="Langue / Language"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="text-xs bg-white/10 text-white rounded-full px-3 py-1.5 border border-white/20 outline-none cursor-pointer"
            >
              <option value="fr" style={{ color: INK }}>FR</option>
              <option value="en" style={{ color: INK }}>EN</option>
            </select>
          </nav>

          <div className="max-w-xl">
            <p
              className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{ backgroundColor: `${ORANGE}26`, color: "#FFD9BC" }}
            >
              {t.badge}
            </p>
            <h1
              className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {t.title}
            </h1>
            <p className="text-white/80 text-base md:text-lg">
              {t.subtitle}
            </p>
          </div>
        </div>
        <WaveDivider />
      </header>

      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto px-5 md:px-8 -mt-6 md:-mt-10 pb-20 relative z-10">
        <div className="grid md:grid-cols-5 gap-6 md:gap-8">
          {/* Formulaire */}
          <div
            className="md:col-span-3 bg-white rounded-2xl shadow-sm p-6 md:p-9"
            style={{ border: `1px solid ${LINE}` }}
          >
            <h2 className="text-xl font-bold mb-1" style={{ color: INK }}>
              {t.formTitle}
            </h2>
            <p className="text-sm mb-6" style={{ color: `${INK}80` }}>
              {t.formSubtitle}
            </p>
            <ContactForm t={t} />
          </div>

          {/* Sidebar infos */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-2 md:p-3" style={{ border: `1px solid ${LINE}` }}>
              <ContactInfoCard
                title={t.contactCards.whatsapp}
                value={WHATSAPP_NUMBER}
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                icon={
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill={NAVY}>
                    <path d="M12.03 2.5c-5.24 0-9.5 4.26-9.5 9.5 0 1.68.44 3.25 1.2 4.62L2.5 21.5l5.02-1.19a9.44 9.44 0 004.51 1.15h.01c5.24 0 9.5-4.26 9.5-9.5s-4.26-9.46-9.51-9.46z" opacity=".15"/>
                    <path d="M16.9 14.4c-.23.65-1.15 1.19-1.88 1.34-.5.1-1.16.19-3.38-.73-2.84-1.17-4.66-4.04-4.8-4.22-.14-.19-1.15-1.53-1.15-2.92s.73-2.07.99-2.36c.23-.25.5-.31.67-.31h.48c.15 0 .36-.01.56.43.23.55.78 1.93.85 2.07.07.14.11.3.02.48-.09.19-.14.3-.27.46-.13.16-.28.36-.4.49-.14.14-.27.29-.12.57.16.28.7 1.15 1.5 1.86 1.04.92 1.9 1.21 2.18 1.34.28.14.44.12.6-.07.16-.19.7-.82.89-1.1.19-.28.37-.23.62-.14.25.09 1.63.77 1.9.91.28.14.46.21.53.33.07.12.07.68-.16 1.34z"/>
                  </svg>
                }
              />
              <div className="h-px" style={{ backgroundColor: LINE }} />
              <ContactInfoCard
                title={t.contactCards.email}
                value="contact@moledievents.com"
                href="mailto:contact@moledievents.com"
                icon={
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={NAVY} strokeWidth="1.8">
                    <path d="M3 6h18v12H3z" strokeLinejoin="round" />
                    <path d="M3 7l9 6 9-6" strokeLinejoin="round" />
                  </svg>
                }
              />
              <div className="h-px" style={{ backgroundColor: LINE }} />
              <ContactInfoCard
                title={t.contactCards.office}
                value={t.contactCards.officeValue}
                icon={
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={NAVY} strokeWidth="1.8">
                    <path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.3" />
                  </svg>
                }
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: `1px solid ${LINE}` }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: `${INK}66` }}>
                {t.followUs}
              </p>
              <SocialLinks />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={LOGO_SRC} alt="Moledi Events" className="h-6 w-auto object-contain opacity-70" />
          <p className="text-xs" style={{ color: `${INK}66` }}>
            © {new Date().getFullYear()} Moledi Events — {t.footer.rights}
          </p>
          <div className="flex gap-5 text-xs" style={{ color: `${INK}80` }}>
            <a href="/confidentialite" className="hover:underline">{t.footer.privacy}</a>
            <a href="/legal" className="hover:underline">{t.footer.legal}</a>
            <a href="/a-propos" className="hover:underline">{t.footer.about}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
