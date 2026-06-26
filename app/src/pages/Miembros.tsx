import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Briefcase, Gamepad2, Monitor, Sparkles, Tv, Star, ArrowLeft } from 'lucide-react';
import { friends } from '../data/friends';
import RadarChart from '../components/RadarChart';

export default function Miembros() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const CARD_WIDTH = 200;
  const GAP = 16;
  const totalWidth = friends.length * (CARD_WIDTH + GAP);
  const maxScroll = Math.max(0, totalWidth - (CARD_WIDTH + GAP) * 5);

  const scroll = useCallback((direction: 'left' | 'right') => {
    setScrollOffset(prev => {
      const step = (CARD_WIDTH + GAP) * 2;
      if (direction === 'left') return Math.max(0, prev - step);
      return Math.min(maxScroll, prev + step);
    });
  }, [maxScroll]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex !== null) {
        if (e.key === 'Escape') setSelectedIndex(null);
        if (e.key === 'ArrowLeft') setSelectedIndex(prev => prev !== null ? Math.max(0, prev - 1) : 0);
        if (e.key === 'ArrowRight') setSelectedIndex(prev => prev !== null ? Math.min(friends.length - 1, prev + 1) : 0);
      } else {
        if (e.key === 'ArrowLeft') scroll('left');
        if (e.key === 'ArrowRight') scroll('right');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, scroll]);

  const selectedFriend = selectedIndex !== null ? friends[selectedIndex] : null;

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#0a0a0a] pt-16">
      <AnimatePresence mode="wait">
        {selectedIndex === null ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, rotateY: -15 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 15, scale: 0.9 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full h-[calc(100vh-64px)] flex flex-col justify-center items-center perspective-1000"
          >
            <motion.div className="text-center mb-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-white text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none font-['Orbitron']">
                ELIGE TU
              </h2>
              <h2 className="text-[#00ff88] text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none font-['Orbitron']">
                PERSONAJE
              </h2>
              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff88] to-transparent mt-4" />
            </motion.div>

            <div className="relative w-full max-w-5xl px-4">
              <div className="overflow-hidden">
                <motion.div className="flex gap-4 py-8"
                  animate={{ x: -scrollOffset }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{ width: totalWidth }}
                >
                  {friends.map((friend, index) => (
                    <motion.div
                      key={friend.id}
                      className="relative flex-shrink-0 cursor-pointer group"
                      style={{ width: CARD_WIDTH }}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.4 }}
                      whileHover={{ y: -10, scale: 1.05 }}
                      onClick={() => setSelectedIndex(index)}
                    >
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                        style={{ backgroundColor: friend.colorHex + '40' }}
                      />
                      <div className="relative bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-xl overflow-hidden border border-white/10 group-hover:border-[#00ff88]/50 transition-all duration-300 h-[320px]">
                        <div className="relative h-[220px] overflow-hidden">
                          <img src={friend.foto} alt={friend.nombre}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: friend.colorHex }} />
                        </div>
                        <div className="p-4 text-center">
                          <h3 className="text-white font-bold text-lg truncate">{friend.nickname}</h3>
                          <p className="text-gray-400 text-xs mt-1 truncate">{friend.nombre}</p>
                          <div className="flex justify-center gap-1 mt-3">
                            {[friend.aptitudes.tryhard, friend.aptitudes.troll, friend.aptitudes.flammer, friend.aptitudes.iq, friend.aptitudes.habilidad].map((val, i) => (
                              <div key={i} className="flex gap-[2px]">
                                {Array.from({ length: 5 }).map((_, j) => (
                                  <div key={j} className="w-1 h-1 rounded-full"
                                    style={{ backgroundColor: j < val ? friend.colorHex : 'rgba(255,255,255,0.1)' }} />
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <button onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-[#1a1a2e] border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] hover:bg-[#00ff88]/20 transition-all hover:scale-110 z-10">
                <ChevronLeft size={24} />
              </button>
              <button onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-[#1a1a2e] border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] hover:bg-[#00ff88]/20 transition-all hover:scale-110 z-10">
                <ChevronRight size={24} />
              </button>
            </div>

            <motion.div className="absolute bottom-8 left-0 right-0 text-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <p className="text-gray-500 text-xs tracking-widest uppercase">{friends.length} Personajes Disponibles</p>
            </motion.div>
          </motion.div>
        ) : selectedFriend && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, rotateY: 15, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -15 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full min-h-[calc(100vh-64px)] flex items-center justify-center p-4 md:p-12"
          >
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* LEFT SIDE - Back button + Image */}
              <motion.div className="relative flex flex-col items-center"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {/* Back button - NOW ON LEFT */}
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="self-start flex items-center gap-2 text-gray-400 hover:text-[#00ff88] transition-colors text-sm mb-6 px-4 py-2 rounded-lg hover:bg-white/5"
                >
                  <ArrowLeft size={16} />
                  <span>Volver a la lista</span>
                </button>

                <div className="absolute inset-0 blur-3xl opacity-30 rounded-full" style={{ backgroundColor: selectedFriend.colorHex }} />
                <div className="relative">
                  <img src={selectedFriend.foto} alt={selectedFriend.nombre}
                    className="h-[50vh] lg:h-[65vh] object-contain drop-shadow-2xl"
                    style={{ filter: `drop-shadow(0 0 40px ${selectedFriend.colorHex}40)` }}
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
                    <button onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))} disabled={selectedIndex === 0}
                      className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-[#00ff88]/20 hover:border-[#00ff88] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setSelectedIndex(Math.min(friends.length - 1, selectedIndex + 1))} disabled={selectedIndex === friends.length - 1}
                      className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-[#00ff88]/20 hover:border-[#00ff88] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT SIDE - Info */}
              <motion.div className="space-y-5"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div>
                  <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ backgroundColor: selectedFriend.colorHex + '20', color: selectedFriend.colorHex, border: `1px solid ${selectedFriend.colorHex}40` }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }}>
                    <Star size={12} /> {selectedFriend.color}
                  </motion.div>
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-['Orbitron']">
                    {selectedFriend.nickname}
                  </h2>
                  <p className="text-gray-400 text-lg mt-1">{selectedFriend.nombre}</p>
                </div>

                <motion.p className="text-xl text-[#00ff88] italic font-light leading-relaxed"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  {selectedFriend.descripcion}
                </motion.p>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={<Calendar size={18} />} label="Cumpleaños" value={selectedFriend.cumpleanos} color={selectedFriend.colorHex} delay={0.6} />
                  <StatCard icon={<Briefcase size={18} />} label="Profesión" value={selectedFriend.profesion} color={selectedFriend.colorHex} delay={0.65} />
                  <StatCard icon={<Monitor size={18} />} label="Plataforma" value={selectedFriend.plataforma} color={selectedFriend.colorHex} delay={0.7} />
                  <StatCard icon={<Gamepad2 size={18} />} label="Top Juego" value={selectedFriend.juegos[0]} color={selectedFriend.colorHex} delay={0.75} />
                </div>

                <motion.div className="space-y-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Sparkles size={16} className="text-[#00ff88]" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Juegos Favoritos</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFriend.juegos.map((game, i) => (
                      <span key={i} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300">{game}</span>
                    ))}
                  </div>
                </motion.div>

                <motion.div className="space-y-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.85 }}>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Tv size={16} className="text-[#00ff88]" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Anime Favorito</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFriend.anime.map((a, i) => (
                      <span key={i} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300">{a}</span>
                    ))}
                  </div>
                </motion.div>

                <motion.div className="flex justify-center lg:justify-start"
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}>
                  <div className="relative bg-[#1a1a2e]/50 rounded-2xl border border-white/10 p-4">
                    <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-2">Aptitudes Gaming</p>
                    <RadarChart aptitudes={selectedFriend.aptitudes} color={selectedFriend.colorHex} />
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Bottom navigation dots */}
            <motion.div className="absolute bottom-6 right-6 flex items-center gap-3 z-20"
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <div className="flex gap-1">
                {friends.map((_, i) => (
                  <button key={i} onClick={() => setSelectedIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === selectedIndex ? 'w-8 bg-[#00ff88]' : 'w-2 bg-white/20 hover:bg-white/40'}`} />
                ))}
              </div>
              <span className="text-gray-500 text-xs">{selectedIndex + 1} / {friends.length}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, color, delay }: { icon: React.ReactNode; label: string; value: string; color: string; delay: number }) {
  return (
    <motion.div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
      initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay, duration: 0.4 }}
      whileHover={{ borderColor: color + '40', backgroundColor: color + '08' }}>
      <div className="text-[#00ff88] mt-0.5">{icon}</div>
      <div>
        <p className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</p>
        <p className="text-white text-sm font-semibold leading-tight">{value}</p>
      </div>
    </motion.div>
  );
}
