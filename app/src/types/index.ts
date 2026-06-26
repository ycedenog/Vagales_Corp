export interface Friend {
  id: string;
  nombre: string;
  nickname: string;
  cumpleanos: string;
  profesion: string;
  plataforma: string;
  descripcion: string;
  color: string;
  colorHex: string;
  juegos: string[];
  anime: string[];
  aptitudes: {
    tryhard: number;
    troll: number;
    flammer: number;
    iq: number;
    habilidad: number;
  };
  foto: string;
  summonerName?: string;
  summonerLevel?: number;
  summonerIcon?: string;
  topChampions?: ChampionMastery[];
  cs2Stats?: CS2Stats;
}

export interface ChampionMastery {
  name: string;
  mastery: number;
  points: number;
  icon: string;
}

export interface CS2Stats {
  matches: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  mvps: number;
  headshots: number;
  kd: number;
  winRate: number;
  rank: string;
  rankImage: string;
  recentMatches: RecentMatch[];
}

export interface RecentMatch {
  map: string;
  result: 'win' | 'loss';
  score: string;
  kd: string;
  date: string;
}

export interface LeaderboardEntry {
  position: number;
  playerId: string;
  playerName: string;
  playerNickname: string;
  matches: number;
  wins: number;
  kd: number;
  winRate: number;
  points: number;
  trend: 'up' | 'down' | 'same';
  foto: string;
}

export interface Game {
  id: string;
  name: string;
  image: string;
  genre: string;
  description: string;
  color: string;
}
