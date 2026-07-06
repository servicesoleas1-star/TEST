# Moledi Event

Migration de `moledievents1` vers un déploiement Vercel (frontend Vite/React + API serverless).

## Structure

- `src/`, `public/`, `index.html` — application React/Vite (inchangée).
- `api/` — fonctions serverless Vercel (remplacent l'ancien `server.js` Express) :
  - `api/auth/login.js` — connexion (`/api/auth/login`)
  - `api/countries.js` — pays et devises (`/api/countries`)
  - `api/payment-methods.js` — moyens de paiement (`/api/payment-methods`)
  - `api/health.js` — health check (`/api/health`)
  - `api/_supabase.js` — client Supabase partagé (préfixe `_` = pas une route)

## Variables d'environnement (à définir dans Vercel, jamais commitées)

- `SUPABASE_URL`
- `SUPABASE_API_KEY`

Dashboard Supabase → Project Settings → API pour récupérer ces valeurs.

## Développement local

```bash
npm install
npm run dev        # front Vite seul, sans les fonctions /api
```

Pour tester les fonctions `/api` en local avec Supabase, utiliser `vercel dev` (CLI Vercel), qui exécute à la fois le front Vite et les fonctions serverless.

## Déploiement

Le déploiement se fait via l'intégration GitHub de Vercel : chaque push sur une branche déclenche un build (preview), et un push sur `main` déploie en production.
