import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { initVisitorId } from './lib/visitorId.js';
import { initLanguageOnLoad } from './services/googleTranslateService.js';
import './index.css';

// Bootstrap transversal — avant tout rendu : pose/renouvelle le cookie
// visiteur (voir lib/visitorId.js) et recharge la préférence de langue déjà
// mémorisée, pour que ces deux mécanismes soient actifs sur TOUTE page du
// site dès le premier chargement, pas seulement sur certaines pages.
initVisitorId();
initLanguageOnLoad();

// Pas de <React.StrictMode> ici : plusieurs sections (ZUIHubStory, la
// section "à la une", PricingTeaser...) pilotent GSAP ScrollTrigger avec
// `pin: true`, qui insère/déplace de vrais nœuds DOM (pin-spacer) en dehors
// du contrôle de React. Le double montage/démontage volontaire de
// StrictMode (utile pour les effets purs) rejouait ces animations une
// deuxième fois avant que le premier `ScrollTrigger.kill()` n'ait fini de
// nettoyer -- symptôme observé : l'animation "à la une" semblait se rejouer
// deux fois à l'arrivée sur la page d'accueil.
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
