// lib/pollApi.js — utilitaires partagés par toutes les pages de la section
// Scrutin & Vote (Poll.jsx, PollCandidates.jsx, PollRanking.jsx, etc.).
//
// Centralise deux choses qui étaient dupliquées et divergentes avant cette
// passe : le hook de fetch générique (chaque page réimplémentait sa propre
// version), et l'URL de base de l'API. Certains fichiers (PollRulesSection,
// les tunnels de vote) codaient en dur `http://localhost:4000`, ce qui
// casse dès que le frontend n'est pas servi sur ce host exact précis --
// toutes les autres pages du site utilisent déjà des chemins relatifs
// `/api/...` via le proxy Vite. On aligne tout ici.

import { useEffect, useState } from 'react';

export const API_BASE = '';

export function useFetch(url, deps) {
  const [data, setData] = useState(undefined); // undefined = chargement
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setData(undefined);
    setError(false);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('not ok');
        return r.json();
      })
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, error };
}

export function pollPhase(poll) {
  if (!poll) return null;
  const now = Date.now();
  const opensAt = new Date(poll.open_at).getTime();
  const closesAt = new Date(poll.close_at).getTime();

  if (['SUSPENDED', 'CANCELLED', 'REJECTED'].includes(poll.status)) {
    return { key: 'suspended', label: 'Suspendu', color: '#DC2626' };
  }
  if (poll.status === 'CLOSED' || now > closesAt) {
    return { key: 'closed', label: 'Clôturé — résultats disponibles', color: '#8B5CF6' };
  }
  if (now < opensAt) {
    return { key: 'upcoming', label: 'À venir', color: '#2B6BFF' };
  }
  return { key: 'open', label: 'Ouvert — votez maintenant', color: '#16A34A' };
}

export function formatCountdown(targetIso) {
  if (!targetIso) return null;
  const diffMs = new Date(targetIso).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  if (days > 0) return `${days}j ${hours}h restant${days > 1 ? 's' : ''}`;
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  return `${hours}h ${minutes}min restantes`;
}

export function fmtDate(iso, opts = { day: 'numeric', month: 'long' }) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('fr-FR', opts).format(new Date(iso));
}

export function fmtNumber(n) {
  return Number(n || 0).toLocaleString('fr-FR');
}

// En dessous de ce nombre d'éléments, une piste en défilement infini est
// plus courte que l'écran et rend mal (collée à gauche, saut visible en
// bouclant) -- mieux vaut alors une rangée statique centrée. Au-dessus, le
// défilement automatique prend le relais. Le seuil est plus bas sur mobile
// (écran plus étroit, moins d'éléments nécessaires pour remplir la piste).
export function useMarqueeThreshold() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile ? 6 : 7;
}

// Défilement automatique continu, pilotable au doigt/à la souris (une
// pression met en pause, le relâchement reprend là où c'était) -- même
// logique que la bande "à la une" de la page Événements.
export function useAutoScroll(containerRef, enabled) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;
    let rafId;
    let paused = false;
    function tick() {
      if (!paused && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += 0.6;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft -= el.scrollWidth / 2;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener('pointerdown', pause);
    el.addEventListener('pointerup', resume);
    el.addEventListener('pointerleave', resume);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('pointerdown', pause);
      el.removeEventListener('pointerup', resume);
      el.removeEventListener('pointerleave', resume);
    };
  }, [containerRef, enabled]);
}
