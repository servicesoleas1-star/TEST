import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tarifs from './pages/Tarifs';
import Confidentialite from './pages/Confidentialite';
import Connexion from './pages/Connexion';
import Contact from './pages/Contact';
// Temporary client preview — delete this import + its <Route> below and the
// src/pages/Foldcraft.jsx file to remove it entirely.
import Foldcraft from './pages/Foldcraft';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tarifs" element={<Tarifs />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/foldcraft" element={<Foldcraft />} />
      </Routes>
    </div>
  );
}

export default App;
