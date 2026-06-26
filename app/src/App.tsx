import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import Home from './pages/Home';
import Miembros from './pages/Miembros';
import Juegos from './pages/Juegos';
import CS2Rankings from './pages/CS2Rankings';
import CS2Stats from './pages/CS2Stats';
import LoLStats from './pages/LoLStats';
import Randomizer from './pages/Randomizer';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <ParticleBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/miembros" element={<Miembros />} />
            <Route path="/juegos" element={<Juegos />} />
            <Route path="/cs2" element={<CS2Rankings />} />
            <Route path="/cs2-stats" element={<CS2Stats />} />
            <Route path="/lol" element={<LoLStats />} />
            <Route path="/randomizer" element={<Randomizer />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}
