# Moledi Event (Liboka Vote)

Frontend React/Vite + backend Express/PostgreSQL, pensés pour tourner en
local puis être déployés tels quels sur un VPS. Plus aucune dépendance à
Vercel ou Supabase.

## Structure

- `src/`, `public/`, `index.html` — application React/Vite (pages vitrine,
  vote, espace organisateur, support).
- `moledi-backend/` — API Express (auth, votes, dashboard organisateur,
  paiement Orange Money, support). Se connecte directement à PostgreSQL
  via `pg` (pas d'ORM, pas de service tiers).
- `db/` — schéma PostgreSQL complet (migrations numérotées, seeds de démo,
  ERD, script d'installation). Voir `db/README.md` pour le détail.

## Prérequis

- Node.js ≥ 18
- PostgreSQL ≥ 15 (`psql` en ligne de commande)
- Git

## Installation locale

### 1. Base de données

```bash
cd db
export PGUSER=liboka
export PGPASSWORD=choisissez_un_mot_de_passe
sudo -u postgres psql -c "CREATE USER liboka WITH PASSWORD 'choisissez_un_mot_de_passe' SUPERUSER;"
./scripts/setup_db.sh liboka_vote
```

Voir `db/README.md` pour les étapes détaillées (tests d'intégrité, seed de démo).

### 2. Backend (API)

```bash
cd moledi-backend
npm install
cp .env.example .env   # renseigner DATABASE_URL, JWT_SECRET, etc.
npm run dev            # démarre sur http://localhost:4000
```

### 3. Frontend

```bash
npm install
npm run dev             # démarre sur http://localhost:5173
```

Le frontend appelle l'API en relatif (`/api/...`) ; en dev, Vite relaie ces
appels vers `http://localhost:4000` (voir `vite.config.js`). En production,
c'est nginx qui fera ce même relais devant les deux process Node.

## Voir le résultat sur mobile (hors réseau local)

Pour générer un lien public temporaire vers ton serveur de dev, sans être
sur le même Wi-Fi que la machine :

```bash
npx ngrok http 5173
```

`ngrok` fournit une URL HTTPS publique qui pointe vers ton `vite dev`
local (à installer une fois : compte gratuit sur ngrok.com + `ngrok config
add-authtoken ...`).

## Déploiement (VPS)

Les deux process (`npm run build` + serveur statique ou nginx pour le
frontend, `moledi-backend` en process Node géré par PM2/systemd) tournent
tels quels sur le VPS, avec la même base PostgreSQL — aucune adaptation de
code entre local et prod.
