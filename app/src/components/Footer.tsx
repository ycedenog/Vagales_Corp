import { Link } from 'react-router-dom';
import { Heart, Gamepad2, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#00ff88]/10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/images/vagales_logo.png" alt="Vagales Corp" className="h-12 w-12 object-contain" />
              <span className="text-[#00ff88] font-bold text-xl tracking-wider font-['Orbitron']">
                VAGALES CORP
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              No somos un equipo, somos un grupo de vagos. Miles de partidas, una sola comunidad.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider font-['Orbitron']">Navegación</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/miembros', label: 'Miembros' },
                { to: '/juegos', label: 'Juegos' },
                { to: '/cs2', label: 'CS2 Rankings' },
                { to: '/cs2-stats', label: 'Stats CS2' },
                { to: '/lol', label: 'Stats LoL' },
                { to: '/randomizer', label: 'Randomizer' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-500 hover:text-[#00ff88] transition-colors text-sm flex items-center gap-1"
                >
                  <ExternalLink size={10} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Games */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider font-['Orbitron']">Juegos Principales</h4>
            <div className="flex flex-wrap gap-2">
              {['League of Legends', 'CS2', 'Valorant', 'Among Us 3D', 'Outlast Trials', 'Elden Ring', 'FIFA'].map((game) => (
                <span
                  key={game}
                  className="px-3 py-1 rounded-full bg-[#00ff88]/5 border border-[#00ff88]/20 text-gray-400 text-xs"
                >
                  <Gamepad2 size={10} className="inline mr-1" />
                  {game}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
             Vagales Corp. Todos los derechos reservados.
          </p>
          <p className="text-gray-600 text-xs flex items-center gap-1">
            Hecho con <Heart size={12} className="text-[#00ff88]" /> por y para los vagos
          </p>
        </div>
      </div>
    </footer>
  );
}
