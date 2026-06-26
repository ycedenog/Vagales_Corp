import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Gamepad2, Info } from 'lucide-react';
import { games } from '../data/games';

export default function Juegos() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeGame = games[activeIndex];

  const navigate = (dir: number) => {
    setActiveIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return games.length - 1;
      if (next >= games.length) return 0;
      return next;
    });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const absD = Math.abs(diff);
    if (absD > 3) return { opacity: 0, pointerEvents: 'none' as const };

    return {
      transform: `translateX(${diff * 280}px) translateZ(${-absD * 150}px) rotateY(${-diff * 25}deg)`,
      opacity: absD === 0 ? 1 : 0.4 - absD * 0.1,
      zIndex: 10 - absD,
      pointerEvents: absD === 0 ? 'auto' as const : 'none' as const,
    };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16 relative overflow-hidden">
      {/* Header */}
      <div className="text-center py-8">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-center gap-3 mb-2">
          <Gamepad2 size={28} className="text-[#00ff88]" />
          <h1 className="text-4xl md:text-5xl font-black text-white font-['Orbitron']">NUESTROS JUEGOS</h1>
        </motion.div>
        <p className="text-gray-500 text-sm">Los juegos que unen a la banda</p>
      </div>

      {/* 3D Carousel */}
      <div className="relative h-[450px] flex items-center justify-center perspective-1000" ref={containerRef}>
        <div className="relative preserve-3d" style={{ width: 340, height: 400 }}>
          <AnimatePresence>
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                className="absolute inset-0 cursor-pointer preserve-3d"
                style={getCardStyle(index)}
                onClick={() => { if (index !== activeIndex) setActiveIndex(index); }}
                initial={false}
                animate={getCardStyle(index)}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              >
                <div className={`w-full h-full rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  index === activeIndex ? 'border-[#00ff88] shadow-[0_0_30px_rgba(0,255,136,0.3)]' : 'border-white/10'
                }`}>
                  <img src={game.image} alt={game.name} className="w-full h-[60%] object-cover" />
                  <div className="h-[40%] bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] p-5">
                    <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: game.color }}>
                      {game.genre}
                    </span>
                    <h3 className="text-white font-bold text-xl mt-1 font-['Orbitron']">{game.name}</h3>
                    <p className="text-gray-400 text-xs mt-2 line-clamp-2">{game.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Nav buttons */}
        <button onClick={() => navigate(-1)}
          className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#1a1a2e] border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] hover:bg-[#00ff88]/20 transition-all hover:scale-110 z-20">
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => navigate(1)}
          className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#1a1a2e] border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] hover:bg-[#00ff88]/20 transition-all hover:scale-110 z-20">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Active game detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGame.id}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto px-4 pb-12"
        >
          <div className="flex items-center gap-4 p-6 rounded-xl bg-white/[0.03] border border-white/10">
            <Info size={24} style={{ color: activeGame.color }} />
            <div>
              <h4 className="text-white font-bold font-['Orbitron']">{activeGame.name}</h4>
              <p className="text-gray-400 text-sm mt-1">{activeGame.description}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex justify-center gap-2 pb-8">
        {games.map((_, i) => (
          <button key={i} onClick={() => setActiveIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-8 bg-[#00ff88]' : 'w-2 bg-white/20 hover:bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}
