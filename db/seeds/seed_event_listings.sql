-- Seed de démonstration pour le catalogue public /evenements
-- (table event_listings, voir 17_event_listings.sql).
-- 30 campagnes de test réparties sur les 7 types, plusieurs statuts,
-- pays et indicateurs (épinglé / premium / live).

BEGIN;

INSERT INTO event_listings
  (campaign_type, title, slug, description, image_url, country, status, is_pinned, is_premium, is_live, organizer_name, votes_count, starts_at, ends_at, created_at)
VALUES
-- POLL
('POLL', 'Élection Miss Cameroun 2026', 'election-miss-cameroun-2026', 'Votez pour la candidate qui représentera le Cameroun sur la scène internationale. Vote gratuit et vote premium disponibles.', '/miss-crown.jpg', 'Cameroun', 'ONGOING', TRUE, FALSE, TRUE, 'Comité Miss Cameroun', 15420, now() - interval '5 days', now() + interval '10 days', now() - interval '20 days'),
('POLL', 'Meilleur artiste urbain de l''année', 'meilleur-artiste-urbain-annee', 'La communauté choisit l''artiste urbain qui a le plus marqué l''année en Côte d''Ivoire.', '/miss-universe.jpg', 'Côte d''Ivoire', 'ONGOING', FALSE, TRUE, FALSE, 'Ivoire Music Awards', 8930, now() - interval '12 days', now() + interval '4 days', now() - interval '15 days'),
('POLL', 'Concours du meilleur créateur de contenu', 'concours-meilleur-createur-contenu', 'Nomination et vote du public pour récompenser les créateurs de contenu sénégalais les plus impactants.', '/vote-icon-laptop.jpg', 'Sénégal', 'UPCOMING', FALSE, FALSE, FALSE, 'Dakar Digital Awards', 0, now() + interval '6 days', now() + interval '20 days', now() - interval '2 days'),
('POLL', 'Élection du bureau associatif ADEC', 'election-bureau-associatif-adec', 'Scrutin annuel pour élire le nouveau bureau de l''association ADEC.', '/vote-icon-button.jpg', 'Cameroun', 'ENDED', FALSE, FALSE, FALSE, 'Association ADEC', 542, now() - interval '40 days', now() - interval '25 days', now() - interval '45 days'),
('POLL', 'Prix du meilleur enseignant 2026', 'prix-meilleur-enseignant-2026', 'Les élèves et parents votent pour désigner l''enseignant de l''année au Gabon.', '/election-vote.jpg', 'Gabon', 'ONGOING', FALSE, FALSE, FALSE, 'Ministère de l''Éducation', 2310, now() - interval '3 days', now() + interval '8 days', now() - interval '10 days'),
('POLL', 'Miss Élégance Abidjan', 'miss-elegance-abidjan', 'Le grand concours annuel de beauté et d''élégance de la ville d''Abidjan revient pour une nouvelle édition.', '/miss-mister-pageant.jpg', 'Côte d''Ivoire', 'UPCOMING', TRUE, FALSE, FALSE, 'Abidjan Events', 0, now() + interval '15 days', now() + interval '30 days', now() - interval '1 days'),

-- EVENT
('EVENT', 'Festival Amani Live', 'festival-amani-live', 'Trois jours de concerts en plein air avec les plus grands artistes de la région, billetterie en ligne avec QR code.', '/concert-stadium.jpg', 'Cameroun', 'ONGOING', TRUE, FALSE, TRUE, 'Amani Productions', 0, now() - interval '1 days', now() + interval '2 days', now() - interval '30 days'),
('EVENT', 'Nuit du Jazz de Dakar', 'nuit-du-jazz-dakar', 'Une soirée intimiste dédiée au jazz avec des musiciens sénégalais et internationaux.', '/concert-jazz.jpg', 'Sénégal', 'UPCOMING', FALSE, TRUE, FALSE, 'Dakar Jazz Club', 0, now() + interval '12 days', now() + interval '12 days', now() - interval '5 days'),
('EVENT', 'Conférence Tech Afrique 2026', 'conference-tech-afrique-2026', 'Rassemblement des acteurs de la tech ouest-africaine : conférences, ateliers et networking.', '/event-venue.jpg', 'Côte d''Ivoire', 'UPCOMING', FALSE, FALSE, FALSE, 'Tech Afrique Hub', 0, now() + interval '25 days', now() + interval '27 days', now() - interval '8 days'),
('EVENT', 'Concert Plein Air Douala', 'concert-plein-air-douala', 'Concert gratuit en plein air au cœur de Douala, diffusion en direct pour les absents.', '/concert-outdoor.jpg', 'Cameroun', 'ONGOING', FALSE, FALSE, TRUE, 'Ville de Douala', 0, now() - interval '2 hours', now() + interval '3 hours', now() - interval '10 days'),
('EVENT', 'Soirée Gala Solidarité', 'soiree-gala-solidarite', 'Dîner de gala au profit des œuvres sociales, avec spectacle et enchères caritatives.', '/gala-performance.jpg', 'Sénégal', 'ENDED', FALSE, FALSE, FALSE, 'Fondation Teranga', 0, now() - interval '35 days', now() - interval '35 days', now() - interval '50 days'),
('EVENT', 'Chorale Nationale — Concert de Noël', 'chorale-nationale-concert-noel', 'Concert de fin d''année de la chorale nationale, ouvert à tous.', '/choir-performance.jpg', 'Gabon', 'UPCOMING', FALSE, FALSE, FALSE, 'Chorale Nationale du Gabon', 0, now() + interval '20 days', now() + interval '20 days', now() - interval '3 days'),
('EVENT', 'Grand Concert Urbain d''Abidjan', 'grand-concert-urbain-abidjan', 'Le rendez-vous incontournable de la scène urbaine ivoirienne, têtes d''affiche à confirmer.', '/concert-singer.jpg', 'Côte d''Ivoire', 'ONGOING', FALSE, TRUE, FALSE, 'Urban Prod CI', 0, now() - interval '4 days', now() + interval '6 days', now() - interval '18 days'),

-- FUNDRAISER
('FUNDRAISER', 'Cagnotte pour l''hôpital pédiatrique', 'cagnotte-hopital-pediatrique', 'Aidez-nous à financer du matériel médical pour le service pédiatrique de l''hôpital central.', '/donation-coins.jpg', 'Cameroun', 'ONGOING', TRUE, FALSE, FALSE, 'Fondation Espoir Santé', 0, now() - interval '10 days', now() + interval '20 days', now() - interval '12 days'),
('FUNDRAISER', 'Soutien aux familles sinistrées', 'soutien-familles-sinistrees', 'Collecte d''urgence pour venir en aide aux familles touchées par les récentes inondations.', '/community-hands.jpg', 'Côte d''Ivoire', 'ONGOING', FALSE, FALSE, TRUE, 'Croix-Rouge Côte d''Ivoire', 0, now() - interval '1 days', now() + interval '9 days', now() - interval '3 days'),
('FUNDRAISER', 'Ensemble pour l''éducation des filles', 'ensemble-education-filles', 'Financement de bourses scolaires pour les jeunes filles issues de familles vulnérables.', '/community-heart.jpg', 'Sénégal', 'UPCOMING', FALSE, FALSE, FALSE, 'Association Sen''Avenir', 0, now() + interval '5 days', now() + interval '35 days', now() - interval '1 days'),
('FUNDRAISER', 'Réseau Solidarité Afrique', 'reseau-solidarite-afrique', 'Campagne de collecte panafricaine pour soutenir les initiatives locales de développement.', '/africa-network.jpg', 'Bénin', 'ENDED', FALSE, FALSE, FALSE, 'Réseau Solidarité Afrique', 0, now() - interval '60 days', now() - interval '30 days', now() - interval '65 days'),

-- CF_PROJECT
('CF_PROJECT', 'Financement studio d''enregistrement communautaire', 'financement-studio-enregistrement', 'Un studio ouvert aux jeunes artistes du quartier, pour enregistrer et se former gratuitement.', '/events-collage-tech.jpg', 'Cameroun', 'ONGOING', FALSE, TRUE, FALSE, 'Collectif Beat Makers', 0, now() - interval '8 days', now() + interval '22 days', now() - interval '10 days'),
('CF_PROJECT', 'Lancement d''une application locale de covoiturage', 'lancement-application-covoiturage', 'Aidez à financer le développement d''une application de covoiturage adaptée aux villes ivoiriennes.', '/events-collage-light.jpg', 'Côte d''Ivoire', 'UPCOMING', FALSE, FALSE, FALSE, 'MoveTogether CI', 0, now() + interval '10 days', now() + interval '40 days', now() - interval '4 days'),
('CF_PROJECT', 'Atelier de couture pour femmes entrepreneures', 'atelier-couture-femmes-entrepreneures', 'Financement de machines à coudre et de formations pour un collectif de femmes entrepreneures.', '/community-hands.jpg', 'Sénégal', 'ONGOING', FALSE, FALSE, FALSE, 'Collectif Elles Cousent', 0, now() - interval '6 days', now() + interval '15 days', now() - interval '9 days'),
('CF_PROJECT', 'Bibliothèque mobile pour zones rurales', 'bibliotheque-mobile-zones-rurales', 'Un bus aménagé en bibliothèque itinérante pour desservir les villages sans accès aux livres.', '/africa-network.jpg', 'Mali', 'UPCOMING', FALSE, FALSE, FALSE, 'Lire Ensemble Mali', 0, now() + interval '18 days', now() + interval '48 days', now() - interval '2 days'),

-- LOTTERY
('LOTTERY', 'Grande Tombola de Fin d''Année', 'grande-tombola-fin-annee', 'Tentez de gagner une voiture, des smartphones et de nombreux autres lots. Tirage certifié et public.', '/contest-trophy.jpg', 'Cameroun', 'ONGOING', TRUE, FALSE, TRUE, 'Moledi Events', 0, now() - interval '15 days', now() + interval '5 days', now() - interval '20 days'),
('LOTTERY', 'Tombola Caritative Croix-Rouge', 'tombola-caritative-croix-rouge', 'Chaque ticket acheté finance directement les actions humanitaires locales.', '/award-winner.jpg', 'Côte d''Ivoire', 'UPCOMING', FALSE, FALSE, FALSE, 'Croix-Rouge Côte d''Ivoire', 0, now() + interval '7 days', now() + interval '21 days', now() - interval '3 days'),
('LOTTERY', 'Tirage au Sort Spécial Ramadan', 'tirage-sort-special-ramadan', 'Une tombola solidaire organisée pendant la période du Ramadan, lots distribués aux familles nécessiteuses.', '/dance-contest.jpg', 'Sénégal', 'ENDED', FALSE, FALSE, FALSE, 'Association Nour', 0, now() - interval '90 days', now() - interval '75 days', now() - interval '95 days'),

-- CONTEST
('CONTEST', 'Concours de Danse Urbaine', 'concours-danse-urbaine', 'Battles de danse urbaine entre les meilleurs crews de la sous-région, qualifications puis finale live.', '/dance-contest.jpg', 'Côte d''Ivoire', 'ONGOING', FALSE, TRUE, TRUE, 'Urban Dance CI', 0, now() - interval '3 days', now() + interval '7 days', now() - interval '14 days'),
('CONTEST', 'Jeu-Concours Culture Générale', 'jeu-concours-culture-generale', 'Répondez aux quiz hebdomadaires et tentez de remporter le grand prix final.', '/contest-trophy.jpg', 'Cameroun', 'UPCOMING', FALSE, FALSE, FALSE, 'QuizMasters CM', 0, now() + interval '4 days', now() + interval '34 days', now() - interval '1 days'),
('CONTEST', 'Trophée du Meilleur Jeune Entrepreneur', 'trophee-meilleur-jeune-entrepreneur', 'Un concours qui récompense les projets entrepreneuriaux les plus prometteurs portés par des jeunes.', '/awards-gala.jpg', 'Gabon', 'ONGOING', FALSE, FALSE, FALSE, 'Gabon Startup Club', 0, now() - interval '9 days', now() + interval '11 days', now() - interval '16 days'),
('CONTEST', 'Grand Prix Photographie Afrique', 'grand-prix-photographie-afrique', 'Un concours photo panafricain sur le thème "Racines et Modernité", exposition des œuvres finalistes.', '/award-winner.jpg', 'Sénégal', 'SUSPENDED', FALSE, FALSE, FALSE, 'African Lens Collective', 0, now() - interval '20 days', NULL, now() - interval '25 days'),

-- SPONSOR_CALL
('SPONSOR_CALL', 'Recherche sponsors — Festival des Arts', 'recherche-sponsors-festival-arts', 'Le Festival des Arts recherche des partenaires pour sa prochaine édition : visibilité garantie auprès de milliers de participants.', '/event-venue.jpg', 'Cameroun', 'UPCOMING', FALSE, FALSE, FALSE, 'Festival des Arts du Cameroun', 0, now() + interval '30 days', now() + interval '33 days', now() - interval '5 days'),
('SPONSOR_CALL', 'Appel à partenaires — Salon Tech Dakar', 'appel-partenaires-salon-tech-dakar', 'Le plus grand salon tech du Sénégal ouvre son appel à sponsors pour l''édition 2026.', '/africa-network.jpg', 'Sénégal', 'ONGOING', FALSE, TRUE, FALSE, 'Dakar Digital Hub', 0, now() - interval '5 days', now() + interval '25 days', now() - interval '7 days')
ON CONFLICT (slug) DO NOTHING;

COMMIT;

\echo 'Seed event_listings inséré : 30 campagnes de démonstration.'
