# Liboka Vote / Moledi Events — Base de données

Schéma PostgreSQL complet pour la plateforme Liboka Vote (alias Moledi Events) :
scrutins payants/gratuits, billetterie d'événements, dons, crowdfunding,
loteries, concours, sponsoring, et toute la couche finance/paiement,
support et back-office associée.

Conçu à partir de 10 diagrammes de classes UML (DC-01 → DC-10, 113 classes
au compte détaillé) et du diagramme de composants de l'architecture
technique. Le schéma final compte 113 tables : 112 correspondant chacune
à une classe des diagrammes, plus 1 table technique (`campaigns`, voir
`docs/DECISIONS.md` section 1).

## 1. Prérequis

- PostgreSQL 15 ou supérieur (testé sur PostgreSQL 16)
- `psql` en ligne de commande
- Droits de création de rôle et de base (ou une base déjà créée avec un
  utilisateur propriétaire)

## 2. Installation locale — pas à pas

### 2.1 Créer le rôle et la base

```bash
sudo -u postgres psql -c "CREATE USER liboka WITH PASSWORD 'choisissez_un_mot_de_passe' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE liboka_vote OWNER liboka;"
```

> En production, ne JAMAIS donner SUPERUSER à l'utilisateur applicatif.
> Cette commande est simplifiée pour le développement local. Voir la
> section 6 "Durcissement production" plus bas.

### 2.2 Exécuter les migrations dans l'ordre

Les fichiers sont numérotés et DOIVENT être exécutés dans l'ordre, chacun
dépendant du précédent.

```bash
export PGPASSWORD=choisissez_un_mot_de_passe

for f in migrations/*.sql; do
  echo ">>> Exécution de $f"
  psql -h localhost -U liboka -d liboka_vote -f "$f" || { echo "ECHEC sur $f, arrêt."; break; }
done
```

Ou individuellement :

```bash
psql -h localhost -U liboka -d liboka_vote -f migrations/00_extensions_and_enums.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/01_identity_session.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/02_auth_users.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/03_campaigns_core.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/04_polls_votes.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/05_events_ticketing.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/06_donations_crowdfunding.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/07_sponsorship_lottery_contest.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/08_design_customization.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/09_finance_payments.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/10_support_notifications_audit.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/11_backoffice_config.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/12_cross_fk_patch.sql
psql -h localhost -U liboka -d liboka_vote -f migrations/13_indexes_performance.sql
```

### 2.3 Valider l'installation (tests d'intégrité)

```bash
psql -h localhost -U liboka -d liboka_vote -f scripts/run_integrity_tests.sql
```

Doit afficher `=== RESULTAT : 9 / 9 TESTS PASSES ===` (8 dans la
transaction principale + 1 test hors transaction pour l'immuabilité de
`audit_logs`). Si un test échoue, **ne pas déployer** : corriger d'abord.

### 2.4 (Optionnel) Charger des données de démonstration

```bash
psql -h localhost -U liboka -d liboka_vote -f seeds/seed_demo.sql
```

Insère : 1 organisateur, 1 super admin, 1 scrutin ouvert avec 2 candidats,
1 visiteur, 1 vote comptabilisé. Utile pour vérifier rapidement qu'une
API peut lire un parcours de bout en bout. **Ne jamais exécuter en
production.**

### 2.5 Raccourci : tout faire en une commande

`scripts/setup_db.sh` automatise la création de la base et l'exécution
de toutes les migrations dans l'ordre (étapes 2.1 et 2.2 ci-dessus) :

```bash
export PGUSER=liboka
export PGPASSWORD=choisissez_un_mot_de_passe
./scripts/setup_db.sh liboka_vote
```

Le script détecte si la base cible existe déjà et demande confirmation
avant de la supprimer/recréer. Il ne lance pas les tests ni le seed
automatiquement — ce sont des étapes volontairement séparées (2.3, 2.4).

## 3. Structure du dépôt

```
liboka-vote-db/
├── migrations/                  Scripts SQL numérotés, à exécuter dans l'ordre
│   ├── 00_extensions_and_enums.sql
│   ├── 01_identity_session.sql          (DC-01)
│   ├── 02_auth_users.sql                (DC-02)
│   ├── 03_campaigns_core.sql            (table technique CTI)
│   ├── 04_polls_votes.sql               (DC-03)
│   ├── 05_events_ticketing.sql          (DC-04)
│   ├── 06_donations_crowdfunding.sql    (DC-05)
│   ├── 07_sponsorship_lottery_contest.sql (DC-06)
│   ├── 08_design_customization.sql      (DC-07)
│   ├── 09_finance_payments.sql          (DC-08)
│   ├── 10_support_notifications_audit.sql (DC-09)
│   ├── 11_backoffice_config.sql         (DC-10)
│   ├── 12_cross_fk_patch.sql            (FK différées + triggers)
│   └── 13_indexes_performance.sql
├── seeds/
│   └── seed_demo.sql            Jeu de données de démonstration (dev uniquement)
├── scripts/
│   ├── run_integrity_tests.sql  Suite de tests d'intégrité automatisés
│   ├── setup_db.sh              Création + migrations en une commande
│   ├── extract_schema.py        Extrait le schéma réel depuis PostgreSQL (JSON)
│   └── generate_erd.py          Génère les fichiers ERD à partir de l'extraction
└── docs/
    ├── 00_PLAN.md                Plan de conception et ordre des migrations
    ├── DECISIONS.md              Journal des choix techniques expliqués en détail
    └── erd/                      Diagrammes entité-relation (.mmd, un par domaine)
        ├── 00_overview.mmd       Vue d'ensemble : campaigns + ses 7 sous-types
        ├── 01_identity_session.mmd
        ├── 02_auth_users.mmd
        ├── ... (un fichier par groupe de migration)
        └── 11_backoffice_config.mmd
```

### Visualiser les diagrammes ERD

Les images PNG prêtes à consulter (une par domaine, + une vue d'ensemble)
sont livrées séparément dans le paquet **diagrammes**, pas dans ce
paquet de code. Ce dossier `docs/erd/*.mmd` ne contient que les fichiers
source [Mermaid](https://mermaid.js.org/) (texte éditable), utiles si tu
veux régénérer les images toi-même ou modifier un diagramme :

- **VS Code** : extension "Markdown Preview Mermaid Support", ou coller le
  contenu dans [mermaid.live](https://mermaid.live)
- **GitHub/GitLab** : s'affichent automatiquement si renommés en `.md` avec
  un bloc ` ```mermaid ` autour, ou via un fichier `.mmd` selon la
  configuration du dépôt
- **Régénérer les PNG après une modification du schéma** :
  ```bash
  pip install psycopg2-binary --break-system-packages
  python3 scripts/extract_schema.py   # relit le schéma réel en JSON
  python3 scripts/generate_erd.py     # régénère tous les .mmd à jour
  npx -y @mermaid-js/mermaid-cli -i docs/erd/00_overview.mmd -o docs/erd/00_overview.png -b white -w 2000 -s 2
  # (répéter la dernière commande pour chaque fichier .mmd, ou boucler sur *.mmd)
  ```

## 4. Décisions de conception clés (résumé)

Voir `docs/DECISIONS.md` pour le détail complet. En bref :

1. **Table `campaigns`** : table technique (absente des diagrammes UML
   d'origine) qui unifie Poll/Event/Fundraiser/CFProject/Lottery/Contest/
   SponsorCall sous un même PK partagé, pour permettre de vraies clés
   étrangères PostgreSQL sur les colonnes polymorphes (`Transaction.
   campaign_id`, `SupportTicket.campaign_id`, etc.) — pattern *Class
   Table Inheritance*.
2. **Enums PostgreSQL natifs** (`CREATE TYPE ... AS ENUM`) pour tous les
   champs énumérés des diagrammes — garantit qu'aucune valeur invalide
   ne peut être stockée.
3. **`refund_policies`** fusionnée en une seule table rattachée à
   `campaigns` au lieu d'être dupliquée par type de campagne.
4. **FK différées** (`12_cross_fk_patch.sql`) : certaines tables se
   référencent mutuellement (ex. `votes.transaction_id` ↔
   `transactions.campaign_id` → `campaigns` → `polls` → `votes`).
   Impossible de créer toutes les contraintes en une seule passe sans
   casser l'ordre ; les colonnes sont créées sans contrainte dans leur
   migration d'origine, puis la contrainte est ajoutée une fois toutes
   les tables existantes.
5. **`audit_logs` immuable** : `INSERT` autorisé, `UPDATE`/`DELETE`
   bloqués par trigger PL/pgSQL (`trg_audit_log_immutable`). À
   compléter en production par un `REVOKE UPDATE, DELETE` sur le rôle
   applicatif.
6. **Montants** : toujours `NUMERIC(14,2)`, jamais de type flottant.
7. **Horodatage** : toujours `TIMESTAMPTZ`.

## 5. Tests

`scripts/run_integrity_tests.sql` vérifie notamment :
- Qu'un Poll/Event/etc. ne peut pas exister sans ligne `campaigns`
  correspondante (intégrité du pattern CTI)
- Que les contraintes `CHECK` (dates, poids jury/public, stock billets)
  sont appliquées
- Que l'email est unique et insensible à la casse
- Que `audit_logs` refuse tout `DELETE`/`UPDATE`

## 6. Durcissement production (à faire avant mise en prod)

Ce dépôt est livré avec un rôle `liboka` en `SUPERUSER` pour simplifier
le développement local. **Ne jamais utiliser ce rôle en production.**
Avant déploiement :

```sql
-- Créer un rôle applicatif sans droits DDL
CREATE ROLE liboka_app WITH LOGIN PASSWORD '...';
GRANT CONNECT ON DATABASE liboka_vote TO liboka_app;
GRANT USAGE ON SCHEMA public TO liboka_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO liboka_app;

-- Retirer explicitement UPDATE/DELETE sur audit_logs (le trigger bloque
-- déjà, mais un second verrou au niveau des droits SQL est recommandé)
REVOKE UPDATE, DELETE ON audit_logs FROM liboka_app;

-- Un rôle distinct, plus restreint encore, pour la Read Replica analytics
CREATE ROLE liboka_readonly WITH LOGIN PASSWORD '...';
GRANT CONNECT ON DATABASE liboka_vote TO liboka_readonly;
GRANT USAGE ON SCHEMA public TO liboka_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO liboka_readonly;
```

Pensez aussi à :
- Activer les sauvegardes automatiques (`pg_dump` planifié ou WAL archiving)
- Configurer la Read Replica mentionnée dans le diagramme de composants
  (analytics admin, sans charge sur la base primaire)
- Chiffrer `two_fa.totp_secret` au niveau applicatif avant insertion
  (la colonne stocke un texte chiffré, jamais le secret en clair)
- Mettre en place la purge/archivage de `audit_logs` après 5 ans
  (conservation légale), sans jamais autoriser de `DELETE` direct —
  utiliser un export + archive externe si nécessaire.
