const LEETIFY_API_KEY = import.meta.env.VITE_LEETIFY_API_KEY || '';

export const LEETIFY_STEAM_MAP: Record<string, string | null> = {
  yonkani: '76561198107015554',
  tommy: '76561199127442821',
  david: '76561199521726453',
  gianni: '76561198332751996',
  jim: '76561199090440779',
  andrew: '76561199200622392',
  miguel: '76561199052505349',
  jaren: '76561198705473545',
  nayib: '76561199012658362',
  fudokisho: '76561198325745157',
  jordan: '76561199094454089',
  subiaga: '76561199076841304',
  jose: '76561199061562018',
  william: '76561199578687669',
  sergio: null, // Dani
  eduardo: null,
  jeremy: null
};

async function fetchFromLeetify(path: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const fullPath = `${path}${queryParams ? '?' + queryParams : ''}`;
  const url = `/api/leetify${fullPath}`;

  const response = await fetch(url, {
    headers: {
      '_leetify_key': LEETIFY_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`Leetify API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export interface LiveRecentCS2Match {
  map: string;
  result: 'win' | 'loss';
  score: string;
  kd: string; // Leetify Rating represented as "+0.15" or "-0.05"
  date: string;
}

export interface LiveCS2Stats {
  name: string;
  matches: number;
  wins: number;
  winRate: number;
  kd: number; // overall KD, derived or fallback
  headshots: number; // headshot %
  rank: string; // Premier points or custom rank string
  premierRating: number | null;
  aimRating: number;
  positioningRating: number;
  utilityRating: number;
  recentMatches: LiveRecentCS2Match[];
}

function formatMapName(name: string): string {
  const clean = name.toLowerCase().replace('de_', '').replace('cs_', '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function formatTimeAgo(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Hace un momento';
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  } catch (e) {
    return 'Reciente';
  }
}

export async function fetchLeetifyProfile(steam64Id: string): Promise<LiveCS2Stats> {
  const data = await fetchFromLeetify('/v3/profile', { steam64_id: steam64Id });

  // 1. Map recent matches
  const recentMatches: LiveRecentCS2Match[] = (data.recent_matches || []).map((m: any) => {
    const ratingStr = m.leetify_rating >= 0 
      ? `Rating: +${m.leetify_rating.toFixed(2)}` 
      : `Rating: ${m.leetify_rating.toFixed(2)}`;

    return {
      map: formatMapName(m.map_name || 'Desconocido'),
      result: m.outcome === 'win' ? 'win' : 'loss',
      score: Array.isArray(m.score) ? `${m.score[0]}-${m.score[1]}` : 'N/A',
      kd: ratingStr,
      date: formatTimeAgo(m.finished_at)
    };
  });

  // 2. Rank processing (Premier points)
  const premierRating = data.ranks?.premier || null;
  const rankStr = premierRating ? `${premierRating.toLocaleString()} pts` : 'N/A';

  // 3. Overall stats calculation
  const matches = data.total_matches || 0;
  const winRateVal = data.winrate ? Math.round(data.winrate * 100) : 50;
  const wins = Math.round(matches * (data.winrate || 0.5));
  
  // Overall Headshot Accuracy
  const headshots = data.stats?.accuracy_head ? Math.round(data.stats.accuracy_head) : 20;

  // Deriving an overall KD approximation from Leetify rating for consistency
  const avgLeetify = data.ranks?.leetify || 0;
  const kd = parseFloat((1.0 + avgLeetify / 4).toFixed(2));

  // Ratings
  const aimRating = data.rating?.aim ? Math.round(data.rating.aim) : 50;
  const positioningRating = data.rating?.positioning ? Math.round(data.rating.positioning) : 50;
  const utilityRating = data.rating?.utility ? Math.round(data.rating.utility) : 50;

  return {
    name: data.name || 'Jugador',
    matches,
    wins,
    winRate: winRateVal,
    kd,
    headshots,
    rank: rankStr,
    premierRating,
    aimRating,
    positioningRating,
    utilityRating,
    recentMatches
  };
}
