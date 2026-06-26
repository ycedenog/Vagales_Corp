import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Gamepad2, Trophy, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const time = Date.now() * 0.001;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 255, 136, ${0.08 - i * 0.02})`;
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 2) {
          const y = h / 2 + Math.sin(x * 0.005 + time + i) * (50 + i * 20) + Math.sin(x * 0.01 - time * 0.5) * 30;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Wave Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-8"
        >
          <img
            src="/images/vagales_logo.png"
            alt="Vagales Corp"
            className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]"
          />
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white text-center tracking-tighter font-['Orbitron']"
        >
          VAGALES <span className="text-[#00ff88]">CORP</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-6 text-xl md:text-2xl text-gray-400 text-center max-w-3xl italic"
        >
          "No somos un equipo, somos un grupo de vagos.
          <br />
          <span className="text-[#00ff88]">Miles de partidas, una sola comunidad."</span>
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 flex flex-wrap gap-4 justify-center"
        >
          <Link
            to="/miembros"
            className="px-8 py-3 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00cc6a] transition-all hover:scale-105 flex items-center gap-2"
          >
            <Users size={18} />
            Ver Miembros
          </Link>
          <Link
            to="/randomizer"
            className="px-8 py-3 border border-[#00ff88]/50 text-[#00ff88] font-bold rounded-lg hover:bg-[#00ff88]/10 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Trophy size={18} />
            Crear Equipos
          </Link>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12"
        >
          {[
            { value: '17', label: 'Miembros', icon: Users },
            { value: '8+', label: 'Juegos', icon: Gamepad2 },
            { value: '2,800+', label: 'Partidas CS2', icon: Trophy },
            { value: '500+', label: 'Niveles LoL', icon: BarChart3 },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon size={20} className="text-[#00ff88] mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-white font-['Orbitron']">{stat.value}</p>
              <p className="text-gray-500 text-xs uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Quick Access Cards */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { to: '/cs2', title: 'Clasificación CS2', desc: 'Tabla de rankings y estadísticas del grupo', icon: Trophy, color: '#F5A623' },
            { to: '/lol', title: 'Stats de LoL', desc: 'Maestrías, campeones y niveles de invocador', icon: BarChart3, color: '#0BC6E3' },
            { to: '/juegos', title: 'Nuestros Juegos', desc: 'Catálogo de juegos que jugamos juntos', icon: Gamepad2, color: '#00ff88' },
          ].map((card, i) => (
            <motion.div
              key={card.to}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 + i * 0.1, duration: 0.5 }}
            >
              <Link
                to={card.to}
                className="block p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00ff88]/30 transition-all group hover:bg-white/[0.05]"
              >
                <div className="flex items-center justify-between mb-4">
                  <card.icon size={24} style={{ color: card.color }} />
                  <ArrowRight size={18} className="text-gray-600 group-hover:text-[#00ff88] transition-colors" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2 font-['Orbitron']">{card.title}</h3>
                <p className="text-gray-500 text-sm">{card.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
