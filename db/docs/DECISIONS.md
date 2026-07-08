# Journal des décisions de conception

Ce document explique en détail chaque écart entre les diagrammes UML
d'origine (DC-01 → DC-10) et le schéma SQL livré, ainsi que les choix
techniques structurants. L'objectif : qu'une personne qui relit les
diagrammes UML après coup comprenne pourquoi le SQL ne les recopie pas
toujours mot pour mot, et reste convaincue que rien n'a été perdu en route.

---

## 1. La table `campaigns` (Class Table Inheritance)

**Le problème.** Sept entités du diagramme — Poll, Event, Fundraiser,
CFProject, Lottery, Contest, SponsorCall — sont toutes des « campagnes »
au sens métier. Plusieurs autres tables (Transaction, SupportTicket,
PageConfig, BrandSettings, CustomDomain, EscrowDeposit, RefundPolicy,
IAGeneration) ont besoin de pointer vers « une campagne, peu importe son
type », via un couple `campaign_id (UUID) + campaign_type (String)`.

SQL ne sait pas faire une clé étrangère conditionnelle (« pointe vers la
table polls si campaign_type='POLL', vers events si campaign_type='EVENT' »).
Sans solution, ces colonnes seraient de simples UUID sans aucune garantie :
une transaction pourrait référencer un `poll_id` qui n'existe pas, et la
base ne le saurait jamais.

**La solution.** Une table technique `campaigns(campaign_id, campaign_type,
owner_user_id, created_at)`, absente des diagrammes UML, sert de point
d'ancrage commun. Chaque table « campagne » a son PK qui est *aussi* une
FK vers `campaigns.campaign_id` (même valeur UUID des deux côtés — c'est
le pattern *Class Table Inheritance*). Concrètement :

```sql
CREATE TABLE polls (
    poll_id UUID PRIMARY KEY,
    ...
    CONSTRAINT fk_polls_campaign FOREIGN KEY (poll_id)
        REFERENCES campaigns(campaign_id) ON DELETE CASCADE
);
```

Désormais, `Transaction.campaign_id` est une vraie FK vers `campaigns`,
ce qui est garanti par PostgreSQL. Mais cela ne suffit pas : rien
n'empêche encore qu'une transaction de type `'POLL'` pointe vers une
ligne `campaigns` dont le vrai type est `'EVENT'`. Deux familles de
triggers comblent ce trou (voir section 12_cross_fk_patch.sql) :

- `trg_check_campaign_subtype` : avant tout INSERT dans `polls`/`events`/...,
  vérifie que la ligne `campaigns` correspondante existe déjà et porte
  le bon type.
- `trg_check_campaign_type` : avant tout INSERT/UPDATE sur `transactions`/
  `page_configs`/`refund_policies` (qui dénormalisent `campaign_type`
  pour éviter une jointure à chaque lecture), vérifie que la valeur
  dénormalisée correspond à la vraie valeur dans `campaigns`.

**Pourquoi pas une table de jonction par type à la place ?** L'alternative
aurait été `transaction_poll`, `transaction_event`, `transaction_fundraiser`...
une table de jonction par couple (table source × type de campagne). Cela
fonctionne, mais chaque nouvelle table source (ex: un futur `Subscription`)
ou nouveau type de campagne oblige à créer de nouvelles tables de jonction,
et chaque requête doit savoir à l'avance quelle jonction utiliser. La table
`campaigns` centralise ce problème une fois pour toutes.

---

## 2. `RefundPolicy` fusionnée

Le diagramme DC-03 montre `Poll 1 → 1 RefundPolicy` et le diagramme DC-04
montre `Event 1 → 1 RefundPolicy`, avec une structure de champs identique
(`refundable`, `delay_hours`, `percentage`). Plutôt que deux tables
dupliquées (`poll_refund_policies`, `event_refund_policies`), une seule
table `refund_policies` est rattachée à `campaigns` :

```sql
CREATE TABLE refund_policies (
    policy_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id   UUID NOT NULL UNIQUE REFERENCES campaigns(campaign_id),
    campaign_type campaign_type NOT NULL,
    ...
);
```

`UNIQUE(campaign_id)` préserve la cardinalité 1-1 du diagramme d'origine.
Bénéfice direct : si une future version ajoute un remboursement pour les
campagnes de crowdfunding ou de loterie, aucune migration de schéma n'est
nécessaire — il suffit d'insérer une ligne avec le bon `campaign_id`.

---

## 3. Enums PostgreSQL natifs

Chaque enum du diagramme (`UserRole`, `PollStatus`, `TxStatus`, etc., 70
au total) devient un `CREATE TYPE ... AS ENUM`. Alternative écartée :
`VARCHAR + CHECK constraint`. Le choix d'un ENUM natif a été fait parce
que :
- Il occupe moins d'espace disque qu'un VARCHAR (stocké comme un entier
  en interne).
- Il empêche absolument toute valeur hors liste, y compris une faute de
  frappe (`'ACTVE'` au lieu de `'ACTIVE'`) — le `CHECK` sur VARCHAR
  protège pareillement mais avec une syntaxe plus verbeuse à maintenir
  pour 70 enums.
- PostgreSQL supporte `ALTER TYPE ... ADD VALUE` pour ajouter une valeur
  sans tout recréer, donc l'argument « les ENUM sont rigides » est moins
  vrai qu'on ne le croit souvent. La seule vraie limite : on ne peut pas
  retirer une valeur existante facilement (il faut recréer le type), donc
  il faut bien réfléchir aux valeurs au moment de la création — ce qui a
  été fait en suivant strictement les diagrammes UML.

---

## 4. FK différées (`12_cross_fk_patch.sql`)

Certaines paires de tables se référencent mutuellement, ce qui rend
impossible de créer les deux avec toutes leurs contraintes en une seule
passe. Exemple concret : `votes.transaction_id` doit référencer
`transactions.transaction_id`, mais `transactions.campaign_id` référence
`campaigns`, qui est elle-même remplie *après* qu'un Poll existe, qui
lui-même contient les votes. Créer les deux tables avec FK strictes
imposerait un ordre impossible à respecter.

**Solution appliquée partout où ce cas se présente** : la colonne est
créée dans sa migration d'origine sans contrainte `REFERENCES` (juste
`UUID`, parfois avec un commentaire explicite), puis la contrainte
`FOREIGN KEY` est ajoutée via `ALTER TABLE` dans `12_cross_fk_patch.sql`,
une fois que toutes les tables existent. Le résultat final est
identique à une FK déclarée dès la création — seul l'ordre de
construction change, pas la solidité de la contrainte.

Liste des FK différées de cette nature : `votes.transaction_id`,
`ticket_purchases.transaction_id`, `merch_purchases.transaction_id`,
`donations.transaction_id`, `cf_contributions.transaction_id`,
`sponsor_applications.transaction_id`, `contest_participants.
entry_fee_transaction_id`, `escrow_deposits.deposit_tx_id`,
`prize_payments.payout_tx_id`, `lottery_tickets.transaction_id`,
`poll_reports.ticket_id`, `event_reports.ticket_id`,
`visitors.account_id`.

---

## 5. `audit_logs` immuable

Le diagramme DC-09 précise explicitement : *« AuditLog is immutable —
NO UPDATE or DELETE ever permitted »*. Deux verrous complémentaires
appliquent cette règle :

1. **Trigger PL/pgSQL** (`trg_audit_log_immutable`), posé sur
   `BEFORE UPDATE` et `BEFORE DELETE`, qui lève systématiquement une
   exception. C'est le verrou actif dans ce schéma de développement.
2. **`REVOKE` au niveau des droits SQL**, documenté dans le README
   (section durcissement production) mais volontairement non appliqué
   dans les migrations de base, car il doit cibler un rôle applicatif
   dédié (`liboka_app`) qui n'existe pas encore au moment des migrations
   — créer ce rôle est une étape d'infrastructure, pas de schéma.

Avoir les deux : le trigger protège même un compte avec tous les droits
SQL (erreur de code, script de migration mal écrit) ; le `REVOKE` protège
même si le trigger est accidentellement désactivé. Défense en profondeur.

---

## 6. Types de données — choix systématiques

| Domaine | Choix | Raison |
|---|---|---|
| Montants d'argent | `NUMERIC(14,2)` | Jamais de `FLOAT`/`REAL` : l'arithmétique flottante introduit des erreurs d'arrondi inacceptables sur de l'argent réel. `NUMERIC` est exact. |
| Dates/heures | `TIMESTAMPTZ` | Stocke toujours en UTC avec le fuseau ; jamais de `TIMESTAMP` naïf qui oblige à deviner le fuseau d'origine. Le fuseau d'affichage (`Africa/Douala`, etc.) est stocké séparément dans une colonne `timezone` sur Poll/Event quand l'utilisateur a besoin de voir l'heure locale. |
| Identifiants | `UUID DEFAULT gen_random_uuid()` | Pas de collision même en écriture distribuée, pas de fuite d'information sur le volume de données (contrairement à un auto-incrément visible). |
| Listes (`String[]` du diagramme) | `TEXT[]` / `UUID[]` natif PostgreSQL | Le diagramme les modélise comme des colonnes, pas des tables enfants — une table séparée aurait été une normalisation non demandée et aurait complexifié chaque lecture pour un gain marginal (ce sont des listes d'URLs ou de tags, jamais interrogées individuellement). |
| `JSON` du diagramme | `JSONB` | Indexable (GIN), validé syntaxiquement à l'écriture, plus rapide à interroger que `JSON` texte brut. |
| Emails | `CITEXT` | Insensible à la casse nativement : `Test@mail.com` et `test@mail.com` sont automatiquement reconnus comme identiques par la contrainte `UNIQUE`, sans logique applicative dupliquée à chaque comparaison. |

---

## 7. Écarts de comptage mineurs vs les résumés textuels des diagrammes

Le document source annonce certains totaux en résumé (ex: « DC-06 :
12 classes ») qui ne correspondent pas toujours au compte réel obtenu en
listant chaque classe dessinée dans le diagramme détaillé (13 pour DC-06 :
SponsorCall, SponsorshipLevel, SponsorApplication, Contest, Prize,
ContestParticipant, Submission, BracketMatch, EscrowDeposit,
PrizePayment, Lottery, LotteryTicket, LotteryDraw). Dans tous les cas de
divergence, **le schéma suit le diagramme détaillé**, qui est la source
de vérité — un résumé chiffré écrit à la main est plus sujet à erreur
qu'un schéma dessiné classe par classe avec ses attributs.

Le total réel de tables créées par les migrations est de **113** (et non
110 ou 111 comme annoncé à différents moments du processus de
conception) : 112 tables correspondant à une classe du diagramme UML +
1 table technique (`campaigns`, absente des diagrammes, voir section 1).
Ce chiffre a été vérifié par exécution réelle des migrations et comptage
des tables résultantes dans `information_schema`, pas par relecture
manuelle.

---

## 8. Ce qui n'a *pas* été modifié

Pour qu'il soit clair que les écarts ci-dessus sont les seuls : toutes
les autres tables suivent fidèlement leur diagramme — mêmes noms de
colonnes (convertis en `snake_case`), mêmes types, mêmes nullabilités,
mêmes cardinalités de relations. Les `CHECK` constraints ajoutés
(dates cohérentes, quotas, pourcentages bornés, stock non dépassé)
formalisent des règles métier déjà écrites en note sur les diagrammes
eux-mêmes (ex: *« un code ne peut être utilisé qu'une seule fois »*,
*« jury_weight_percent + public_weight_percent = 100 »*) — ce ne sont
pas des règles inventées, seulement rendues exécutoires par la base de
données plutôt que reposant uniquement sur la couche applicative.
