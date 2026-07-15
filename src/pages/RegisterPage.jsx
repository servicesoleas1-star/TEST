// pages/RegisterPage.jsx
// Route publique : /inscription  [MVP]
//
// Layout à deux volets :
//  - gauche (visible à partir de lg:, masqué sur mobile pour ne pas
//    pénaliser le LCP/la place utile sur petit écran) : panneau de marque
//    avec le compteur animé LiveStatsTicker (élément signature, voir son
//    fichier pour la justification du choix)
//  - droite : carte blanche avec le formulaire, toujours visible quelle
//    que soit la taille d'écran (c'est la partie qui compte vraiment)

import RegistrationForm from '../components/RegistrationForm';
import LiveStatsTicker from '../components/LiveStatsTicker';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Panneau de marque -- masqué sur mobile/tablette portrait */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{
          background:
            'linear-gradient(160deg, #0B1324 0%, #16387A 55%, #2B6BFF 100%)',
        }}
      >
        {/* Halo décoratif discret -- une seule touche d'audace, pas de
            surcharge d'effets (cf. principe de retenue : un seul élément
            marquant, le reste sobre). */}
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF6A00, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <p
            className="text-3xl font-bold uppercase tracking-wide text-white"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            Moledi Events
          </p>
        </div>

        <div className="relative z-10">
          <h1
            className="mb-4 text-4xl font-bold uppercase leading-tight text-white xl:text-5xl"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            Chaque voix compte.
            <br />
            Chaque campagne réussit.
          </h1>
          <p className="mb-10 max-w-md text-white/80">
            Créez votre compte organisateur et lancez votre premier scrutin en
            quelques minutes.
          </p>
          <LiveStatsTicker />
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex w-full items-center justify-center bg-[color:var(--color-surface,#F5F6F8)] px-4 py-10 sm:px-6 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          {/* Titre visible uniquement sur mobile (le panneau de marque le
              remplace visuellement sur desktop). */}
          <p
            className="mb-6 text-2xl font-bold uppercase text-[color:var(--color-ink,#0B1324)] lg:hidden"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            Moledi Events
          </p>

          <h2
            className="mb-1 text-2xl font-bold text-[color:var(--color-ink,#0B1324)]"
            style={{ fontFamily: 'Anton, sans-serif' }}
          >
            Créer mon compte
          </h2>
          <p className="mb-6 text-sm text-[color:var(--color-slate,#475569)]">
            Déjà organisateur ?{' '}
            <a
              href="/connexion"
              className="font-medium text-[color:var(--color-secondary,#2B6BFF)] underline"
            >
              Se connecter
            </a>
          </p>

          <RegistrationForm />
        </div>
      </div>
    </div>
  );
}
