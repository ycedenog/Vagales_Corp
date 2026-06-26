const API_KEY = import.meta.env.VITE_RIOT_API_KEY || '';

async function fetchFromRiot(host: string, path: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({ ...params, api_key: API_KEY }).toString();
  const fullPath = `${path}?${queryParams}`;

  let url = '';
  if (host === 'americas.api.riotgames.com') {
    url = `/api/riot-americas${fullPath}`;
  } else if (host === 'la1.api.riotgames.com') {
    url = `/api/riot-la1${fullPath}`;
  } else {
    url = `https://${host}${fullPath}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Riot API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

let championCache: Record<string, { name: string; icon: string }> | null = null;
let latestDDragonVersion = '14.23.1'; // Default fallback

export async function fetchLatestDDragonVersion(): Promise<string> {
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    if (res.ok) {
      const versions = await res.json();
      if (Array.isArray(versions) && versions.length > 0) {
        latestDDragonVersion = versions[0];
      }
    }
  } catch (e) {
    console.error('Error fetching DDragon versions, using fallback:', e);
  }
  return latestDDragonVersion;
}

export async function getChampionDataMap(version: string) {
  if (championCache) return championCache;

  try {
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/es_ES/champion.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch champion data');
    const json = await res.json();
    
    const mapping: Record<string, { name: string; icon: string }> = {};
    Object.values(json.data).forEach((champ: any) => {
      mapping[champ.key] = {
        name: champ.name,
        icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.id}.png`
      };
    });
    
    championCache = mapping;
    return mapping;
  } catch (err) {
    console.error('Error loading champion map from DDragon:', err);
    return {};
  }
}

export interface LiveChampionMastery {
  name: string;
  mastery: number;
  points: number;
  icon: string;
}

export interface LiveLoLStats {
  summonerName: string;
  summonerLevel: number;
  summonerIcon: string;
  topChampions: LiveChampionMastery[];
}

export async function fetchFullLoLStats(
  gameName: string,
  tagLine: string,
  region: string
): Promise<LiveLoLStats> {
  // 1. Get PUUID
  const accountData = await fetchFromRiot(
    'americas.api.riotgames.com',
    `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );
  
  const puuid = accountData.puuid;
  const gameNameResolved = accountData.gameName || gameName;
  const tagLineResolved = accountData.tagLine || tagLine;

  // 2. Fetch Summoner Level and Profile Icon ID
  const summonerHost = `${region}.api.riotgames.com`;
  const summonerData = await fetchFromRiot(summonerHost, `/lol/summoner/v4/summoners/by-puuid/${puuid}`);
  
  const summonerLevel = summonerData.summonerLevel;
  const profileIconId = summonerData.profileIconId;

  // 3. Fetch Top 3 Champion Masteries
  const masteriesList = await fetchFromRiot(
    summonerHost,
    `/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top`,
    { count: '3' }
  );

  // 4. Resolve Champion Names and Icons from DDragon
  const version = await fetchLatestDDragonVersion();
  const champMap = await getChampionDataMap(version);

  const topChampions: LiveChampionMastery[] = (masteriesList || []).map((m: any) => {
    const champIdStr = String(m.championId);
    const champInfo = champMap[champIdStr] || {
      name: `Campeón ${m.championId}`,
      icon: 'https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Aatrox_0.jpg'
    };
    
    return {
      name: champInfo.name,
      mastery: m.championLevel || 1,
      points: m.championPoints || 0,
      icon: champInfo.icon
    };
  });

  return {
    summonerName: `${gameNameResolved}#${tagLineResolved}`,
    summonerLevel,
    summonerIcon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png`,
    topChampions
  };
}
