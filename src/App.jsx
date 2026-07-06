import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import Home from './pages/Home';
import Tarifs from './pages/Tarifs';
import Confidentialite from './pages/Confidentialite';
import Connexion from './pages/Connexion';
import Contact from './pages/Contact';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tarifs" element={<Tarifs />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </LanguageProvider>
  );
}

export default App;
