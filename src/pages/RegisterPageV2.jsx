// pages/RegisterPageV2.jsx — Route publique : /inscription/v2
//
// Refonte complète de RegisterPage.jsx (V1, conservée intacte à
// /inscription) : même formulaire (RegistrationForm — logique désormais
// branchée sur le vrai backend, voir services/registrationService.js),
// mais design analogue à la page Connexion (même split-screen, même
// diaporama Ken-Burns, mêmes animations d'entrée gauche/droite) au lieu du
// panneau de marque + compteur de chiffres inventés de la V1.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { media, illustration } from '../config/media';
import RegistrationForm from '../components/RegistrationForm';

const slides = [illustration.crowdfunding, illustration.sponsoring, illustration.contests, illustration.ticketing];

export default function RegisterPageV2() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Visual column -- glides in from the left */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex relative overflow-hidden bg-ink-900"
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.14 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.2 }, scale: { duration: 7, ease: 'linear' } }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[slide]})` }}
          />
        </AnimatePresence>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(11,19,36,.7) 0%, rgba(11,19,36,.15) 60%, transparent 100%), linear-gradient(to top, rgba(11,19,36,.85) 0%, rgba(11,19,36,.15) 45%, transparent 100%)',
          }}
        />
        <svg
          className="absolute right-[-1px] top-0 bottom-0 w-[55px] h-full"
          viewBox="0 0 60 900"
          preserveAspectRatio="none"
        >
          <path d="M60,0 Q18,225 38,450 Q58,675 16,900 L60,900 L60,0 Z" fill="white" />
        </svg>

        <div className="relative z-10 flex flex-col h-full w-full px-12 py-11">
          <a href="/" className="mb-auto inline-block">
            <img src={media.logo} alt="Moledi Event" className="h-12 w-auto object-contain" />
          </a>
          <div className="flex-1 flex flex-col justify-center py-10 max-w-md">
            <h2 className="font-heading text-4xl sm:text-5xl normal-case text-white leading-tight mb-4">
              Chaque voix compte, <em className="italic text-primary-100 not-italic text-primary-300">chaque campagne réussit</em>.
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Créez votre compte organisateur et lancez votre premier scrutin, événement ou cagnotte
              en quelques minutes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form column -- glides in from the right */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col min-h-screen"
      >
        <header className="flex lg:hidden items-center justify-between px-5 py-4 border-b border-ink-200 sticky top-0 bg-white z-10">
          <img src={media.logo} alt="Moledi Event" className="h-9 w-auto object-contain" />
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-ink-700 hover:text-primary flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left" /> Retour
          </button>
        </header>

        <div className="flex-1 flex items-start lg:items-center justify-center px-6 sm:px-14 pt-6 sm:pt-10 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <h1 className="font-heading text-3xl sm:text-4xl normal-case text-ink-900 mb-2">Créer mon compte</h1>
            <p className="text-sm text-ink-700 normal-case mb-8">
              Déjà organisateur ?{' '}
              <a href="/connexion" className="text-primary font-semibold hover:underline">
                Se connecter
              </a>
            </p>

            <RegistrationForm />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
