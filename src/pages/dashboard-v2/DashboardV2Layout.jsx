import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Bell,
  UserCircle,
  Home,
  Activity,
  LayoutGrid,
  PlusCircle,
  Wallet,
  Settings,
  LifeBuoy,
  ChevronDown,
  LogOut,
  Plus,
} from "lucide-react";
import { media } from "../../config/media";
import { getOrganizerSessionEmail, clearOrganizerSession } from "../../lib/session.js";
import { apiGet } from "./dashboardApi.js";

const MENU_SECTIONS = [
  { label: "Accueil", icon: Home, href: "/dashboard-v2" },
  {
    label: "Mon activité",
    icon: Activity,
    href: "/dashboard-v2/activite",
    children: [
      { label: "Mes votes", href: "/dashboard-v2/votes" },
      { label: "Mes billets achetés", href: "/dashboard-v2/billets" },
      { label: "Mes dons", href: "/dashboard-v2/dons" },
      { label: "Mes participations", href: "/dashboard-v2/participations" },
    ],
  },
  { label: "Mes campagnes", icon: LayoutGrid, href: "/dashboard-v2/campagnes" },
  { label: "Créer une campagne", icon: PlusCircle, href: "/dashboard-v2/campagnes/nouvelle" },
  {
    label: "Finances",
    icon: Wallet,
    href: "/dashboard-v2/finances",
    children: [
      { label: "Historique des revenus", href: "/dashboard-v2/finances?tab=historique" },
      { label: "Historique de reversement", href: "/dashboard-v2/finances?tab=reversements" },
      { label: "Demande de retrait", href: "/dashboard-v2/finances?tab=retrait" },
      { label: "Export financier", href: "/dashboard-v2/finances?tab=export" },
    ],
  },
  { label: "Notifications", icon: Bell, href: "/dashboard-v2/notifications" },
  { label: "Mon profil", icon: UserCircle, href: "/dashboard-v2/profil" },
  { label: "Paramètres", icon: Settings, href: "/dashboard-v2/parametres" },
  { label: "Support", icon: LifeBuoy, href: "/dashboard-v2/support" },
];

const BOTTOM_NAV_ITEMS = [
  { label: "Campagnes", icon: LayoutGrid, href: "/dashboard-v2/campagnes" },
  { label: "Créer", icon: Plus, href: "/dashboard-v2/campagnes/nouvelle", primary: true },
  { label: "Finances", icon: Wallet, href: "/dashboard-v2/finances" },
  { label: "Paramètres", icon: Settings, href: "/dashboard-v2/parametres" },
];

/**
 * Liste des sections, partagée par la sidebar PC permanente et le panneau
 * mobile coulissant -- mêmes items, même comportement de dépliage.
 */
function MenuNav({ onNavigate, dense = false }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(() =>
    MENU_SECTIONS.filter((s) => s.children?.some((c) => location.pathname === c.href.split("?")[0])).map((s) => s.label)
  );

  function toggleExpand(label) {
    setExpanded((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  }

  return (
    <nav className={dense ? "flex flex-col gap-0.5" : "flex-1 min-h-0 overflow-y-auto px-3 py-3"}>
      {MENU_SECTIONS.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href.split("?")[0];
        const hasChildren = Boolean(item.children);
        const isExpanded = expanded.includes(item.label);

        return (
          <div key={item.label}>
            <div
              className={`flex items-center rounded-xl transition-colors ${
                isActive ? "bg-primary-50 text-primary" : "text-ink-900 hover:bg-ink-100"
              }`}
            >
              <Link
                to={item.href}
                onClick={onNavigate}
                className="flex-1 flex items-center gap-3 px-3 py-3 text-sm font-semibold"
              >
                <Icon size={17} className="shrink-0" />
                {item.label}
              </Link>
              {hasChildren && (
                <button
                  type="button"
                  onClick={() => toggleExpand(item.label)}
                  aria-label={isExpanded ? "Réduire" : "Déplier"}
                  className="p-3 shrink-0"
                >
                  <ChevronDown size={15} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
            {hasChildren && (
              <div
                className="overflow-hidden pl-11 transition-[max-height,opacity] duration-200 ease-out"
                style={{ maxHeight: isExpanded ? `${item.children.length * 44 + 8}px` : "0px", opacity: isExpanded ? 1 : 0 }}
              >
                {item.children.map((child) => (
                  <Link
                    key={child.label}
                    to={child.href}
                    onClick={onNavigate}
                    className="block px-3 py-2.5 text-[13px] text-ink-700 hover:text-primary font-medium"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Panneau mobile coulissant (< lg). `pointer-events` est explicitement lié
 * à `open` (pas seulement à l'opacité/transform de l'animation) : si une
 * transition Framer Motion venait à ne pas se terminer proprement (device
 * lent, onglet en arrière-plan...), un calque à opacité 0 mais encore
 * cliquable ne doit JAMAIS pouvoir bloquer l'en-tête en dessous -- c'est
 * exactement le bug qui empêchait le menu de s'ouvrir/se fermer de façon
 * fiable.
 */
function MobileMenu({ open, onClose }) {
  const navigate = useNavigate();

  function handleLogout() {
    clearOrganizerSession();
    navigate("/connexion");
  }

  // Toujours monté (jamais démonté/remonté par AnimatePresence) : la
  // visibilité et l'interactivité sont pilotées directement par `open` à
  // CHAQUE rendu, via `animate` (transition Framer Motion classique, pas un
  // cycle entrée/sortie) et des classes conditionnelles pour opacity-0 /
  // pointer-events-none. L'ancienne version utilisait `{open && (...)}`
  // dans un <AnimatePresence> : au moment où `open` passe à false, ce bloc
  // disparaît du JSX AVANT d'avoir pu se re-rendre avec `open=false` --
  // AnimatePresence rejoue alors la DERNIÈRE version rendue (donc figée
  // avec open=true, pointer-events:auto) pendant toute l'animation de
  // sortie, qui ne se termine jamais si les frames d'animation ne
  // s'exécutent pas correctement (appareil lent, onglet peu réactif...).
  // Résultat : un calque invisible mais cliquable restait bloqué au-dessus
  // de l'en-tête, empêchant toute interaction -- exactement le bug
  // rapporté. Cette version ne dépend plus jamais du bon déroulé d'une
  // animation pour être fonctionnelle.
  return (
    <>
      <motion.div
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className={`lg:hidden fixed inset-0 z-[90] bg-ink-900/60 backdrop-blur-[2px] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      />
      <motion.div
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`lg:hidden fixed inset-y-0 left-0 z-[95] w-full max-w-[320px] bg-white flex flex-col shadow-[20px_0_60px_-15px_rgba(0,0,0,0.25)] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-ink-200 shrink-0">
          <img src={media.logo} alt="Moledi Event" className="h-8 w-auto object-contain" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-ink-100 text-ink-900 hover:bg-primary hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <MenuNav onNavigate={onClose} />

        <div className="px-3 py-4 border-t border-ink-200 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={17} />
            Déconnexion
          </button>
        </div>
      </motion.div>
    </>
  );
}

/**
 * Sidebar PC : toujours visible (pas de hamburger, pas d'overlay, pas
 * d'animation d'ouverture/fermeture qui pourrait rester bloquée) -- élément
 * normal du flux de page, sticky sous l'en-tête.
 */
function DesktopSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    clearOrganizerSession();
    navigate("/connexion");
  }

  return (
    <aside className="hidden lg:flex flex-col w-[264px] shrink-0 sticky top-[65px] h-[calc(100vh-65px)] border-r border-ink-200 bg-white">
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
        <MenuNav dense />
      </div>
      <div className="px-3 py-4 border-t border-ink-200 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

function BottomNav({ location }) {
  return (
    <nav className="lg:hidden fixed bottom-4 inset-x-4 z-[70]">
      {/* Bande sombre translucide (bleu-noir), pas blanche -- voile
          rgba(6,10,20,x) + backdrop-blur pour un effet verre dépoli sobre,
          cohérent avec le reste du design du menu mobile. */}
      <div className="mx-auto max-w-sm flex items-center justify-between gap-1 rounded-[26px] px-2 py-2 bg-[rgba(7,12,26,0.45)] backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.55)]">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          if (item.primary) {
            return (
              <Link
                key={item.label}
                to={item.href}
                aria-label={item.label}
                className="shrink-0 -mt-6 w-14 h-14 rounded-full flex items-center justify-center bg-gradient-orange text-white shadow-[0_10px_25px_-5px_rgba(255,106,0,0.6)] border-4 border-[rgba(7,12,26,0.45)]"
              >
                <Icon size={24} />
              </Link>
            );
          }
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl text-[10px] font-semibold transition-colors ${
                isActive ? "text-white" : "text-white/50"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Enveloppe commune à toutes les pages /dashboard-v2/* : en-tête (logo,
 * hamburger mobile uniquement, notifications, profil), sidebar permanente
 * sur PC (>= lg) / menu coulissant sur mobile, menu flottant inférieur sur
 * mobile, bouton flottant "Créer une campagne" sur desktop (remplace le
 * bouton WhatsApp -- jamais affiché ensemble avec lui, voir App.jsx qui
 * masque déjà WhatsApp sur toutes les routes /dashboard-v2).
 */
export default function DashboardV2Layout({ children }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const email = getOrganizerSessionEmail();
  // Le flux de création de campagne (sélecteur de type + assistant) a besoin
  // de tout l'espace disponible : pas de menu inférieur mobile ni de bouton
  // flottant "Créer une campagne" par-dessus son propre CTA de soumission.
  const isCreateCampaignFlow = location.pathname.startsWith("/dashboard-v2/campagnes/nouvelle");

  // Le menu mobile doit se fermer automatiquement dès qu'on change de page
  // (ex: navigation via un lien externe au menu, retour navigateur...).
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!email) return;
    apiGet(`/api/dashboard/summary?email=${encodeURIComponent(email)}`)
      .then((data) => setUnreadCount(data.unread_alerts || 0))
      .catch(() => {});
  }, [email]);

  return (
    <div className="min-h-screen bg-ink-100/40">
      <header className="sticky top-0 z-[60] px-3 sm:px-6 py-3 flex items-center gap-2 bg-white/90 backdrop-blur-md border-b border-ink-200">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-ink-100 text-ink-900 hover:bg-ink-200 transition-colors shrink-0"
        >
          <Menu size={19} />
        </button>

        <Link to="/dashboard-v2" className="flex items-center shrink-0 ml-1">
          <img src={media.logo} alt="Moledi Event" className="h-7 sm:h-8 w-auto object-contain" />
        </Link>

        <div className="flex-1" />

        <Link
          to="/dashboard-v2/notifications"
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-ink-100 text-ink-900 hover:bg-ink-200 transition-colors shrink-0"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/dashboard-v2/profil"
          aria-label="Mon profil"
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-ink-900 text-white shrink-0"
        >
          <UserCircle size={19} />
        </Link>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex items-start">
        <DesktopSidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto pb-28 lg:pb-10">{children}</main>
      </div>

      {!isCreateCampaignFlow && <BottomNav location={location} />}

      {/* Bouton flottant desktop uniquement -- sur mobile, le bouton central
          du menu inférieur remplit déjà ce rôle (voir BOTTOM_NAV_ITEMS).
          Masqué sur le flux de création lui-même : redondant avec le CTA de
          l'assistant et prenait de la place sur un écran déjà chargé. */}
      {!isCreateCampaignFlow && (
        <Link
          to="/dashboard-v2/campagnes/nouvelle"
          aria-label="Créer une campagne"
          className="hidden lg:flex fixed bottom-8 right-8 z-[70] items-center gap-2 pl-5 pr-6 h-14 rounded-full bg-gradient-orange text-white font-semibold shadow-[0_15px_35px_-8px_rgba(255,106,0,0.55)] hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          Créer une campagne
        </Link>
      )}
    </div>
  );
}
