# Changelog de merge — branche équipe (develop) vs. code actuel (local)

Comparaison entre `D:\MOLEDIEVENTSGITLABCOPY` (copie de la branche `develop` de
l'équipe, sur GitLab) et `D:\MOLEDIEVENTSDEV` (code local actuel, point de
départ = la branche équipe, divergé depuis).

Méthode : diff récursif fichier par fichier (hors `.git`, `node_modules`,
`.DS_Store`, `dist`).

---

## 1. Le changement le plus important : sortie de Vercel/Supabase

La branche équipe est **encore sur l'ancienne architecture** :

| | Équipe (`develop`) | Local (actuel) |
|---|---|---|
| Hébergement prévu | Vercel (`vercel.json` présent) | VPS (nginx + PM2, aucune trace Vercel) |
| Dossier `api/` (fonctions serverless) | Présent : `_supabase.js`, `auth/login.js`, `countries.js`, `health.js`, `payment-methods.js` | **Supprimé entièrement** |
| `@supabase/supabase-js` (dépendance) | Présente | **Retirée** |
| `src/db/pool.js` (pool PG côté frontend, vestige) | Présent | Supprimé |
| Backend Express (`moledi-backend`) | Existe mais minimal : auth, profil, polls, votes, webhooks, cron, dashboard, candidats, codes uniques, analytics, préférences, tickets support, paiement admin | Devenu **la seule source de vérité** pour tout le site (voir §2) |

C'est exactement ce que tu décrivais : les appels de `api/` ne pointaient pas
vers les bonnes URL et dépendaient de Supabase. Ce dossier est retiré, tout
passe maintenant par `moledi-backend` (Express + PostgreSQL direct via `pg`,
sans ORM).

---

## 2. Backend (`moledi-backend/`) — le plus gros écart fonctionnel

### Nouvelles capacités qui n'existent PAS DU TOUT côté équipe
- **Sessions par cookie httpOnly** : `cookie-parser` + `middleware/auth.js`
  (`attachAuthUser`). L'équipe n'a aucun système de session réel — leur auth
  reste basée sur l'email passé en paramètre de requête.
- **Upload de fichiers** : `multer` + `utils/upload.js` + `routes/uploads.js`
  (images ET vidéos). Rien de tout ça côté équipe — pas de vrai upload de
  photo, juste des champs URL texte libre à l'origine.
- **Export financier PDF/Excel** : `pdfkit` + `exceljs`. Absent côté équipe.
- **Emails transactionnels** : `nodemailer` (`utils/mailer.js`). Absent côté
  équipe.
- **Contenu de campagne organisateur** (annonces, FAQ, galerie, actualités,
  partenaires, personnalisation) : `campaignContentController.js` +
  `campaignContentStore.js` + routes dédiées. N'existe pas côté équipe.
- **Pages publiques du scrutin détaillées** : `pollContentController.js`,
  `pollPublicController.js`, `pollPublicStore.js`, `pollContentStore.js`,
  `pollReportsStore.js` — tout le contenu public (candidats, actualités,
  partenaires, galerie, FAQ, résultats, PV de clôture, signalement) est géré
  par ces fichiers, absents côté équipe.
- **Visiteurs / consentement RGPD** : `visitorsController.js` +
  `visitorsStore.js`. Absent côté équipe.
- **Pays & moyens de paiement pilotés en base** : `countriesController.js` /
  `countriesStore.js`, `paymentMethodsController.js` /
  `paymentMethodsStore.js`. Côté équipe, la config paiement vit encore dans
  `moledi-backend/lib/payment/gateways/` + `config.js` +
  `config/aggregators.yaml` (fichiers statiques, absents côté local — logique
  déplacée en base de données).
- **Candidatures partenaires, sources d'acquisition, FAQ globale, listing
  d'événements, plateforme (feature flags)** : `partnerApplicationsController/Store`,
  `acquisitionSourcesController/Store`, `faqController/Store`,
  `eventListingsController/Store`, `platformController.js`. Tous nouveaux.
- **Services** : dossier `moledi-backend/src/services/` entier (génération PV
  de clôture PDF signé, etc.) — inexistant côté équipe.

### Fichiers modifiés des deux côtés (zone de conflit potentielle)
`app.js`, `server.js`, `authController.js`, `campaignAnalyticsController.js`
(+ store), `dashboardController.js` (+ store), `paidVoteController.js` (+
store), `passwordResetController.js`, `candidatesStore.js`, `pgStore.js`,
`pollRulesStore.js`, `auth.js`, `campaignAnalytics.js`, `dashboard.js`,
`internalCron.js`, `polls.js` (routes), `package.json`.

`app.js` en particulier : le fichier équipe compte 18 lignes d'imports/routes,
le fichier local en compte plus du double (cookie session, 12 groupes de
routes en plus). **Ce fichier va conflicter à coup sûr** si on tente un merge
Git classique — mais le contenu équipe est un sous-ensemble strict du
contenu local (rien n'a été retiré, tout a été ajouté), donc le fichier local
est sans risque à conserver tel quel.

### Store équipe absent côté local
- `memoryStore.js` : store en mémoire (fallback de développement), retiré
  côté local — cohérent avec le passage à PostgreSQL comme unique source de
  vérité.

---

## 3. Frontend (`src/`)

### Dashboard organisateur : refonte complète
- Équipe : `OrganizerDashboard.jsx` seul (une longue page).
- Local : `OrganizerDashboard.jsx` conservé (V1, legacy) **+** tout un
  nouveau dashboard sous `src/pages/dashboard-v2/` (layout, accueil,
  activité, campagnes, création de campagne en assistant multi-étapes,
  finances, notifications, profil, paramètres, support, contenu de
  campagne) — 13 nouveaux fichiers, aucun équivalent côté équipe.

### Page publique du scrutin : refonte complète
- Équipe : `Poll.jsx` seul + `CandidateCard.jsx`, `CandidateFilters.jsx`,
  `CandidateSortControl.jsx`, `CandidatesSection.jsx` (logique candidats
  intégrée dans peu de fichiers).
- Local : `Poll.jsx` réécrit (accueil condensé, aperçus) **+** 11 nouvelles
  pages dédiées avec leurs propres routes : `PollCandidates.jsx`,
  `PollRanking.jsx`, `PollRules.jsx`, `PollFaq.jsx`, `PollNews.jsx`,
  `PollGallery.jsx`, `PollPartners.jsx`, `PollResults.jsx`, `PollPv.jsx`,
  `PollHelp.jsx`, `PollContact.jsx`, plus tout un dossier de composants
  partagés `src/components/poll/` (header, footer, carte candidat, popup de
  partage, écran de chargement, fond d'écran). Les composants équipe
  (`CandidateCard.jsx` etc., à la racine de `components/`) n'ont pas
  d'équivalent direct — logique différente, remplacée.
- `src/services/candidatesService.js` (équipe) et `visitorIdService.js`
  (équipe) : logique déplacée/réécrite ailleurs côté local (pas de fichier
  direct équivalent — le visitor ID est géré différemment, via les nouvelles
  routes backend `visitors*`).

### Autres ajouts frontend sans équivalent équipe
- `src/pages/EventsPage.jsx` (annuaire d'événements avec carrousel), `CandidateDetail.jsx`,
  `AboutPageV2.jsx`, `HowItWorksPageV2.jsx`, `MentionsLegalesPageV2.jsx`,
  `PartnerPageV2.jsx`, `RegisterPageV2.jsx`.
- `src/components/OrganizerSessionGate.jsx` (garde de session dashboard),
  `CookieConsentBanner.jsx`, `SocialIcon.jsx`, `SparkleCursor.jsx`.
- `src/config/paymentMethodsConfig.js`, `src/components/config/eventListingTypes.js`.
- `src/lib/pollApi.js` (hook `useFetch` mutualisé + helpers communs à toutes
  les pages Poll).

### Composants équipe absents côté local
- `LanguageSwitcher.jsx`, `PublicLayout.exemple.jsx` (fichier d'exemple, pas
  de logique) — à vérifier s'il y a une régression sur le sélecteur de
  langue ; côté local, la traduction passe par
  `services/googleTranslateService.js` (présent des deux côtés mais modifié).

### Fichiers modifiés des deux côtés (zone de conflit potentielle)
`App.jsx` (routing), `main.jsx`, `index.css`, `session.js`,
`Home1.jsx`/`Home2.jsx`, `SiteHeader.jsx`, `Footer.jsx`,
`WhatsAppFloatingButton.jsx`, `RegistrationForm.jsx`, `Connexion.jsx`,
`Contact.jsx`, `Tarifs.jsx`, `ManageCandidates.jsx`, `ManageUniqueCodes.jsx`,
`CampaignAnalytics.jsx`, `OrganizerSettings.jsx`, `SupportTickets.jsx`,
`TicketDetail.jsx`, `PaidVoteTunnel.jsx`, `FreeVoteTunnel.jsx`,
`PartnerPage.jsx`, `AboutPage.jsx`, `HowItWorksPage.jsx`, `LegalPageContent.jsx`,
`PhoneCountrySelect.jsx`, `PlatformConfig.js`, `PollRulesSection.jsx`, et
tous les fichiers `components/config/*.js` (about, acquisitionSources,
eventTypes, faq, howItWorks, legalPages, phoneCountries).

`App.jsx` : c'est LE fichier le plus sensible. Le routing local ajoute ~15
nouvelles routes (`/evenements`, tout `/dashboard-v2/*`, toutes les pages
Poll dédiées). **Conflit garanti si merge Git classique**, mais encore une
fois le local est une extension du fichier équipe, pas une réécriture
contradictoire.

`ManageCandidates.jsx` : régression corrigée côté local — le fichier équipe
utilise encore (à vérifier) un `API_BASE` en dur ; côté local il a été
réécrit pour passer par les routes relatives + cookies de session, upload
réel de photos/vidéos additionnelles, import CSV sans colonnes d'URL.

### Assets `public/`
- Logos équipe (`logo-light.png`, `logo-mark.png`, `logo-moledi-events.png`,
  `logo-principal.png`, `logo.jpg`) supprimés côté local, `logo.png` modifié.
  **Vérifier avant merge qu'aucune page ne référence encore un de ces
  fichiers supprimés** (sinon logo cassé après merge).
- Nouveaux côté local : `solde.jpg`, `reception argent.jpg`,
  `configuration acceuil.jpg` (visuels dashboard).
- `event-venue.jpg`, `footer-video.mp4`, `hero-video.mp4` : mêmes noms,
  contenus différents des deux côtés (remplacement, pas ajout).

---

## 4. Base de données (`db/`)

**Bonne nouvelle : aucun conflit de schéma.** Les migrations `00` à `15`
sont **strictement identiques** des deux côtés (diff vide). Le local ajoute
en pur ajout, sans toucher à l'existant :

- `16_partner_applications.sql`
- `17_event_listings.sql`
- `18_sessions_hardening.sql`
- `19_campaign_personalization.sql` (nouveau ce jour : `polls.welcome_message`,
  `polls.visible_sections`)

Et 3 fichiers de seed en plus : `seed_event_listings.sql`,
`seed_full_demo.sql`, `seed_poll_showcase.sql`.

→ Sur le VPS : il suffit de rejouer les migrations `16` à `19` dans l'ordre
après avoir confirmé que `00`-`15` y sont déjà. Aucun risque de conflit ou de
perte de données ici.

---

## 5. Estimation du nombre de conflits en cas de merge Git classique

En comptant les fichiers modifiés **des deux côtés** (candidats à un vrai
conflit texte, par opposition aux fichiers ajoutés/supprimés d'un seul côté
qui ne "conflictent" pas au sens Git mais peuvent casser des imports) :

- **~60 fichiers modifiés des deux côtés** (voir listes ci-dessus) → chacun
  est un conflit potentiel si `develop` et le local ont touché aux mêmes
  lignes. En pratique, sur des fichiers comme `App.jsx`, `app.js` (backend),
  `index.css`, `package.json` (x2), la probabilité de conflit réel (pas
  seulement fichier différent mais lignes qui se chevauchent) est **très
  élevée** — je l'estime à **25-40 conflits de blocs de code sérieux**,
  concentrés sur : `App.jsx`, `moledi-backend/src/app.js`, `package.json` (x2),
  `index.css`, `session.js`, `SiteHeader.jsx`, `Tarifs.jsx`, `Home2.jsx`,
  `ManageCandidates.jsx`, `dashboardController.js`/`dashboardStore.js`.
- **~30 fichiers/dossiers supprimés côté local** (tout `api/`, `vercel.json`,
  `@supabase/supabase-js`, logos, `memoryStore.js`, composants candidats
  équipe) → Git ne les affichera pas comme "conflit" à proprement parler si
  la stratégie de merge part du local, mais si on merge `develop` **dans**
  le local, Git risque de **faire réapparaître** ces fichiers supprimés
  (recréation de `api/`, `vercel.json`, etc.) si `develop` les a aussi
  modifiés depuis la divergence — à surveiller de près.
- **~60 fichiers nouveaux côté local** (tout `dashboard-v2/`, toutes les
  pages Poll dédiées, tous les nouveaux controllers/stores/routes backend) →
  aucun conflit possible (fichiers qui n'existent pas côté équipe), mais
  volume important à revoir en revue de code.

**Estimation globale : entre 25 et 40 conflits de fusion à résoudre à la
main**, concentrés sur une douzaine de fichiers structurants, plus le risque
de résurrection de fichiers supprimés (`api/`, `vercel.json`) si le merge se
fait dans le mauvais sens.

### Faut-il pousser ton code de force à la place d'un merge ?

**Oui, c'est objectivement la meilleure option ici**, et voici pourquoi
concrètement :

1. Il ne s'agit pas d'une divergence de fonctionnalités sur une base commune
   stable — c'est un **changement d'architecture** (sortie de Vercel/Supabase,
   nouveau système de session, nouveau dashboard, nouvelles pages publiques).
   Un merge automatique ne "fusionnerait" pas ces deux visions, il produirait
   un état incohérent (ex : `app.js` avec des routes qui pointent vers du
   code supprimé, ou `vercel.json` qui revient alors que l'app tourne sur
   VPS).
2. Le schéma de base de données est compatible à 100 % (migrations `00-15`
   identiques) — donc **rien n'est perdu côté données** en écrasant `develop`.
3. **Un seul vrai risque** avant d'écraser : les fichiers qui existent
   **UNIQUEMENT côté équipe** et qui pourraient contenir du travail non
   encore porté côté local :
   - `src/components/CandidateCard.jsx`, `CandidateFilters.jsx`,
     `CandidateSortControl.jsx`, `CandidatesSection.jsx`
   - `src/components/LanguageSwitcher.jsx`
   - `src/services/candidatesService.js`, `visitorIdService.js`
   - `moledi-backend/src/store/memoryStore.js`
   - `moledi-backend/lib/payment/gateways/`, `config.js`,
     `config/aggregators.yaml`

   **Avant de forcer le push, quelqu'un de l'équipe doit confirmer que ces
   fichiers ne contiennent pas une fonctionnalité développée depuis la
   divergence et non encore reproduite côté local.** Si c'est juste
   l'ancienne architecture (probable, vu que tout le reste pointe dans ce
   sens), aucun risque.

### Commande (à valider avec l'équipe avant exécution — je ne l'exécute pas moi-même)

```bash
# Depuis ton dossier local, une fois le remote de l'équipe ajouté :
git remote add team <url-gitlab-develop>   # si pas déjà fait
git fetch team

# Option A — remplacer develop par ton code, en gardant l'historique équipe
# accessible (recommandé : moins destructeur, traçable) :
git push team HEAD:develop --force-with-lease

# Option B — si develop est protégée sur GitLab, il faudra un accès
# temporaire "Maintainer" ou passer par une Merge Request avec
# "squash + force merge" côté GitLab plutôt qu'en ligne de commande.
```

`--force-with-lease` (plutôt que `--force` brut) refuse de pousser si
quelqu'un a modifié `develop` sur le remote depuis ton dernier `fetch` —
ça évite d'écraser un commit que tu n'as pas encore vu. **À lancer uniquement
après que l'équipe a confirmé avoir sauvegardé/vérifié les fichiers
équipe-only listés ci-dessus** (un simple `git branch backup-develop-avant-ecrasement team/develop` avant, suffit comme filet de sécurité).

---

## 6. Résumé — les 5 plus gros changements

1. **Sortie complète de Vercel/Supabase** → backend Express/PostgreSQL comme
   unique source de vérité, déploiement VPS.
2. **Vrai système de session** (cookies httpOnly, 12h glissantes, refresh
   token 30 jours) — l'équipe n'a rien de tel.
3. **Nouveau dashboard organisateur** (`dashboard-v2`) avec assistant de
   création de campagne multi-étapes, gestion de contenu (annonces/FAQ/
   galerie/actualités/partenaires/personnalisation) — fonctionnalité
   entièrement absente côté équipe.
4. **Pages publiques du scrutin éclatées en 11 routes dédiées** avec upload
   réel de médias (images + vidéos), au lieu d'une page unique avec des
   champs URL texte.
5. **4 migrations SQL en plus, 100 % compatibles** avec le schéma équipe
   (aucune modification destructive des tables existantes).
