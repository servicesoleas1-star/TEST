import { Routes, Route } from 'react-router-dom';
import Home1 from './pages/Home1';
import Home2 from './pages/Home2';
import Tarifs from './pages/Tarifs';
import Confidentialite from './pages/Confidentialite';
import Connexion from './pages/Connexion';
import Contact from './pages/Contact';
import Mainframe from './pages/Mainframe';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* Two homepage variants: `/` is Proposition 1 (parallax stacked
            panels), `/v2` is Proposition 2 (the original ZUI 6-universes
            zoom animation). Everything below the storytelling section is
            identical between the two. */}
        <Route path="/" element={<Home1 />} />
        <Route path="/v2" element={<Home2 />} />
        <Route path="/tarifs" element={<Tarifs />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mainframe" element={<Mainframe />} />
      </Routes>
    </div>
  );
}

export default App;
