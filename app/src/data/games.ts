import type { Game } from '../types';

export const games: Game[] = [
  {
    id: 'lol',
    name: 'League of Legends',
    image: '/images/lol_cover.jpg',
    genre: 'MOBA',
    description: 'El juego estratégico más jugado del mundo. 5v5, campeones, objetivos y mucha sal.',
    color: '#0BC6E3'
  },
  {
    id: 'cs2',
    name: 'Counter-Strike 2',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_616x353.jpg',
    genre: 'FPS Táctico',
    description: 'El shooter táctico por excelencia. Economía, aim y teamwork.',
    color: '#F5A623'
  },
  {
    id: 'outlast',
    name: 'Outlast Trials',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1304930/capsule_616x353.jpg',
    genre: 'Horror Cooperativo',
    description: 'Terror psicológico en equipo. Gritos garantizados y traiciones incluidas.',
    color: '#D0021B'
  },
  {
    id: 'valorant',
    name: 'Valorant',
    image: '/images/valorant_cover.jpg',
    genre: 'FPS Hero Shooter',
    description: 'Precisión táctica con habilidades únicas. CS meets Overwatch.',
    color: '#FF4655'
  },
  {
    id: 'amongus',
    name: 'Among Us 3D',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/945360/capsule_616x353.jpg',
    genre: 'Party / Deducción',
    description: 'Un juego de intriga, traición y tareas en 3D. Encuentra al impostor antes de que sea demasiado tarde.',
    color: '#EA580C'
  },
  {
    id: 'eldenring',
    name: 'Elden Ring',
    image: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/phvVT0qZfcRms5qDAk0SI3CM.png',
    genre: 'Action RPG',
    description: 'El mejor juego Soulslike de mundo abierto. Muere, aprende, mejora.',
    color: '#C9A84C'
  },
  {
    id: 'fifa',
    name: 'EA Sports FC / FIFA',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/capsule_616x353.jpg',
    genre: 'Deportes / Fútbol',
    description: 'El simulador de fútbol definitivo. Arma tu plantilla, compite en torneos y domina la cancha.',
    color: '#10B981'
  }
];
