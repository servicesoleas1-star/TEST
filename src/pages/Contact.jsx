import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SiteHeader from "../components/SiteHeader.jsx";
import Footer from "../components/Footer.jsx";
import WhatsAppFloatingButton from "../components/WhatsAppFloatingButton.jsx";
import { getPlatformConfig } from "../config/PlatformConfig.js";
 
// ---------------------------------------------------------------------------
// Moledi Events — Page Contact (/contact)
// Design homogénéisé avec le reste du site : SiteHeader/Footer partagés,
// tokens de couleur Tailwind (primary/secondary/ink) et font-heading/
// font-body au lieu d'une palette et d'une police propres à cette page.
// Le bouton WhatsApp flottant et le numéro support viennent des composants
// partagés de l'équipe (PlatformConfig.js / WhatsAppFloatingButton.jsx).
// ---------------------------------------------------------------------------
 
const SOCIALS_DEFAULT = [
  { key: "facebook", label: "Facebook", url: "https://facebook.com/moledievents" },
  { key: "instagram", label: "Instagram", url: "https://instagram.com/moledievents" },
  { key: "x", label: "X", url: "https://x.com/moledievents" },
];
 
const { supportWhatsAppNumber: WHATSAPP_NUMBER } = getPlatformConfig();
 
const T = {
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
  cookie: {
    text: "Nous utilisons des cookies pour améliorer votre expérience sur Moledi Events. En continuant, vous acceptez notre",
    link: "politique de confidentialité",
    accept: "J'accepte",
  },
};
 
function CookieBanner({ t }) {
  const [visible, setVisible] = useState(false);
 
  useEffect(() => {
    const consent = window.localStorage
      ? window.localStorage.getItem("moledi_cookie_consent")
      : null;
    if (!consent) setVisible(true);
  }, []);
 
  const accept = () => {
    try {
      window.localStorage.setItem("moledi_cookie_consent", "accepted");
    } catch (e) {
      /* localStorage indisponible — on masque quand même pour cette session */
    }
    setVisible(false);
  };
 
  if (!visible) return null;
 
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 md:px-8 md:py-5 flex flex-col md:flex-row items-center gap-4 bg-secondary-900"
      role="dialog"
      aria-label="Consentement aux cookies"
    >
      <p className="text-sm text-white/90 flex-1 text-center md:text-left normal-case">
        {t.text}{" "}
        <a href="/confidentialite" className="underline hover:text-white">
          {t.link}
        </a>
        .
      </p>
      <button
        onClick={accept}
        className="shrink-0 btn btn-primary !py-2"
      >
        {t.accept}
      </button>
    </div>
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
      <div className="rounded-2xl border border-ink-200 p-8 md:p-10 text-center">
        <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-primary-50">
          <svg viewBox="0 0 24 24" className="w-7 h-7 stroke-primary" fill="none" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold normal-case text-ink-900 mb-2">
          {t.sentTitle}
        </h3>
        <p className="text-sm text-ink-700 normal-case">
          {t.sentBody}
        </p>
        <button
          onClick={() => {
            setForm({ nom: "", email: "", telephone: "", objet: "", message: "" });
            setStatus("idle");
          }}
          className="mt-6 text-sm font-semibold underline text-secondary-600"
        >
          {t.sentAnother}
        </button>
      </div>
    );
  }
 
  const fieldClass =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/40 bg-white";
 
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nom" className="block text-sm font-semibold text-ink-900 mb-1.5">
            {t.fields.name}
          </label>
          <input
            id="nom"
            type="text"
            value={form.nom}
            onChange={handleChange("nom")}
            placeholder={t.fields.namePh}
            className={`${fieldClass} ${errors.nom ? "border-red-600" : "border-ink-200"}`}
          />
          {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom}</p>}
        </div>
 
        <div>
          <label htmlFor="telephone" className="block text-sm font-semibold text-ink-900 mb-1.5">
            {t.fields.phone}
          </label>
          <input
            id="telephone"
            type="tel"
            value={form.telephone}
            onChange={handleChange("telephone")}
            placeholder="+237 6XX XXX XXX"
            className={`${fieldClass} ${errors.telephone ? "border-red-600" : "border-ink-200"}`}
          />
          {errors.telephone && <p className="mt-1 text-xs text-red-600">{errors.telephone}</p>}
        </div>
      </div>
 
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-ink-900 mb-1.5">
          {t.fields.email}
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="vous@exemple.com"
          className={`${fieldClass} ${errors.email ? "border-red-600" : "border-ink-200"}`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>
 
      <div>
        <label htmlFor="objet" className="block text-sm font-semibold text-ink-900 mb-1.5">
          {t.fields.subject}
        </label>
        <select
          id="objet"
          value={form.objet}
          onChange={handleChange("objet")}
          className={`${fieldClass} ${errors.objet ? "border-red-600" : "border-ink-200"} ${form.objet ? "text-ink-900" : "text-ink-400"}`}
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
        <label htmlFor="message" className="block text-sm font-semibold text-ink-900 mb-1.5">
          {t.fields.message}
        </label>
        <textarea
          id="message"
          rows={5}
          value={form.message}
          onChange={handleChange("message")}
          placeholder={t.fields.messagePh}
          className={`${fieldClass} resize-none ${errors.message ? "border-red-600" : "border-ink-200"}`}
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>
 
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-primary w-full md:w-auto disabled:opacity-60"
      >
        {status === "sending" ? t.sending : t.submit}
      </button>
    </form>
  );
}
 
function ContactInfoCard({ icon, title, value, href }) {
  const content = (
    <div className="flex items-start gap-4 p-5 rounded-xl transition-colors hover:bg-ink-100/60">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-secondary-50">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-700">
          {title}
        </p>
        <p className="text-sm font-medium mt-0.5 text-ink-900">
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
          className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary-50 transition-colors hover:bg-secondary-100"
        >
          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-secondary" width="18" height="18">
            {icons[s.key]}
          </svg>
        </a>
      ))}
    </div>
  );
}
 
export default function ContactPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <SiteHeader activeHref="/contact" />
      <WhatsAppFloatingButton phoneNumber={WHATSAPP_NUMBER} />
      <CookieBanner t={T.cookie} />
 
      <main className="pt-16 sm:pt-20">
        {/* Hero — meme gabarit que Tarifs/Confidentialite : centre, clair */}
        <section className="relative py-16 sm:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <p className="text-primary font-semibold tracking-[0.2em] uppercase text-[10px] mb-3">
              {T.badge}
            </p>
            <h1 className="normal-case text-4xl sm:text-6xl text-ink-900 mb-5">{T.title}</h1>
            <p className="text-ink-700 normal-case max-w-xl mx-auto">{T.subtitle}</p>
          </motion.div>
        </section>
 
        {/* Contenu principal */}
        <section className="pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-5 gap-6 md:gap-8">
              {/* Formulaire */}
              <div className="md:col-span-3 bg-white rounded-2xl border border-ink-200 shadow-sm p-6 md:p-9">
                <h2 className="text-xl font-semibold normal-case text-ink-900 mb-1">
                  {T.formTitle}
                </h2>
                <p className="text-sm text-ink-700 normal-case mb-6">{T.formSubtitle}</p>
                <ContactForm t={T} />
              </div>
 
              {/* Sidebar infos */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-ink-200 shadow-sm p-2 md:p-3">
                  <ContactInfoCard
                    title={T.contactCards.whatsapp}
                    value="+237 6XX XXX XXX"
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    icon={
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-secondary">
                        <path d="M12.03 2.5c-5.24 0-9.5 4.26-9.5 9.5 0 1.68.44 3.25 1.2 4.62L2.5 21.5l5.02-1.19a9.44 9.44 0 004.51 1.15h.01c5.24 0 9.5-4.26 9.5-9.5s-4.26-9.46-9.51-9.46z" opacity=".15"/>
                        <path d="M16.9 14.4c-.23.65-1.15 1.19-1.88 1.34-.5.1-1.16.19-3.38-.73-2.84-1.17-4.66-4.04-4.8-4.22-.14-.19-1.15-1.53-1.15-2.92s.73-2.07.99-2.36c.23-.25.5-.31.67-.31h.48c.15 0 .36-.01.56.43.23.55.78 1.93.85 2.07.07.14.11.3.02.48-.09.19-.14.3-.27.46-.13.16-.28.36-.4.49-.14.14-.27.29-.12.57.16.28.7 1.15 1.5 1.86 1.04.92 1.9 1.21 2.18 1.34.28.14.44.12.6-.07.16-.19.7-.82.89-1.1.19-.28.37-.23.62-.14.25.09 1.63.77 1.9.91.28.14.46.21.53.33.07.12.07.68-.16 1.34z"/>
                      </svg>
                    }
                  />
                  <div className="h-px bg-ink-200" />
                  <ContactInfoCard
                    title={T.contactCards.email}
                    value="contact@moledievents.com"
                    href="mailto:contact@moledievents.com"
                    icon={
                      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-secondary" fill="none" strokeWidth="1.8">
                        <path d="M3 6h18v12H3z" strokeLinejoin="round" />
                        <path d="M3 7l9 6 9-6" strokeLinejoin="round" />
                      </svg>
                    }
                  />
                  <div className="h-px bg-ink-200" />
                  <ContactInfoCard
                    title={T.contactCards.office}
                    value={T.contactCards.officeValue}
                    icon={
                      <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-secondary" fill="none" strokeWidth="1.8">
                        <path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" />
                        <circle cx="12" cy="9.5" r="2.3" />
                      </svg>
                    }
                  />
                </div>
 
                <div className="bg-white rounded-2xl border border-ink-200 shadow-sm p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-700 mb-3">
                    {T.followUs}
                  </p>
                  <SocialLinks />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </motion.div>
  );
}
 