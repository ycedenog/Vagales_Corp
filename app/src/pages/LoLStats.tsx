import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Award, Sword, RefreshCw, AlertTriangle, CheckCircle2, X, Globe } from 'lucide-react';
import { friends } from '../data/friends';
import { fetchFullLoLStats, LiveLoLStats } from '../services/riotApi';

const RIOT_ACCOUNTS_MAP: Record<string, { gameName: string; tagLine: string; region: string } | null> = {
  andrew: { gameName: 'Rip peep', tagLine: '111', region: 'la1' },
  sergio: { gameName: 'Snorlaxx', tagLine: '7173', region: 'la1' }, // Dani
  david: { gameName: 'Alias Jr', tagLine: 'Ñeta', region: 'la1' },
  eduardo: { gameName: 'el shaco guzman', tagLine: 'CDS', region: 'la1' },
  fudokisho: { gameName: 'Ing ChonGuero', tagLine: 'ECU', region: 'la1' },
  jeremy: { gameName: 'DevourmentG', tagLine: 'BSC', region: 'la1' }, // Geremy
  gianni: { gameName: 'El Niño PolIa', tagLine: 'FCB', region: 'la1' },
  jim: { gameName: 'EL CHIVO 666', tagLine: 'ECU', region: 'la1' },
  jordan: { gameName: 'ShΔüna', tagLine: 'Jor', region: 'la1' },
  nayib: { gameName: 'Nayib', tagLine: '001', region: 'la1' },
  jose: { gameName: 'RusoZ26', tagLine: 'LAN', region: 'la1' }, // Ruso
  subiaga: { gameName: 'ketsup', tagLine: 'ppga', region: 'la1' },
  tommy: { gameName: 'IngMendoza', tagLine: '1514', region: 'la1' },
  william: { gameName: 'WILL EzMID', tagLine: '420', region: 'la1' },
  yonkani: { gameName: 'Isabel', tagLine: 'uwu', region: 'la1' },
  jaren: null,
  miguel: null
};

export default function LoLStats() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Live API States
  const [liveStatsMap, setLiveStatsMap] = useState<Record<string, LiveLoLStats | null>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, boolean>>({});

  // Global Riot ID Search States
  const [selectedRegion, setSelectedRegion] = useState('la1');
  const [customSearchResult, setCustomSearchResult] = useState<LiveLoLStats | null>(null);
  const [customSearchLoading, setCustomSearchLoading] = useState(false);
  const [customSearchError, setCustomSearchError] = useState<string | null>(null);

  // Load stats sequentially on mount to avoid rate limit locks (100 req / 2 min limit)
  useEffect(() => {
    let active = true;

    const loadAllStats = async () => {
      const friendIds = Object.keys(RIOT_ACCOUNTS_MAP);
      for (const id of friendIds) {
        if (!active) break;
        const config = RIOT_ACCOUNTS_MAP[id];
        if (!config) continue; // Skip Jaren/Miguel

        setLoadingMap(prev => ({ ...prev, [id]: true }));
        try {
          const stats = await fetchFullLoLStats(config.gameName, config.tagLine, config.region);
          if (active) {
            setLiveStatsMap(prev => ({ ...prev, [id]: stats }));
            setErrorMap(prev => ({ ...prev, [id]: false }));
          }
        } catch (err) {
          console.error(`Error loading stats for ${id}:`, err);
          if (active) {
            setErrorMap(prev => ({ ...prev, [id]: true }));
          }
        } finally {
          if (active) {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
          }
        }
        // Delay between players to prevent dev key burst blocks
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    };

    loadAllStats();

    return () => {
      active = false;
    };
  }, []);

  const handleGlobalSearch = async () => {
    if (!search.includes('#')) return;
    const parts = search.split('#');
    const gameName = parts[0].trim();
    const tagLine = parts[1].trim();

    if (!gameName || !tagLine) {
      setCustomSearchError('Formato inválido. Usa Nombre#Tag');
      return;
    }

    setCustomSearchLoading(true);
    setCustomSearchError(null);
    setCustomSearchResult(null);

    try {
      const stats = await fetchFullLoLStats(gameName, tagLine, selectedRegion);
      setCustomSearchResult(stats);
    } catch (err: any) {
      console.error(err);
      setCustomSearchError('No se encontró el invocador o la API Key falló.');
    } finally {
      setCustomSearchLoading(false);
    }
  };

  const filtered = friends.filter(f => {
    const q = search.toLowerCase();
    // Allow searching local list by tag or normal names
    const config = RIOT_ACCOUNTS_MAP[f.id];
    const riotIdString = config ? `${config.gameName}#${config.tagLine}`.toLowerCase() : '';
    
    return (
      f.nickname.toLowerCase().includes(q) ||
      f.nombre.toLowerCase().includes(q) ||
      (f.summonerName && f.summonerName.toLowerCase().includes(q)) ||
      riotIdString.includes(q)
    );
  });

  const showGlobalSearchPrompt = search.includes('#');

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16">
      {/* Header */}
      <div className="relative overflow-hidden py-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0BC6E3]/10 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-white font-['Orbitron']">
            STATS <span className="text-[#0BC6E3]">LEAGUE OF LEGENDS</span>
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-gray-400 mt-3">Invocadores, maestrías y campeones obtenidos en tiempo real de la API de Riot</motion.p>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="max-w-2xl mx-auto px-4 mb-8 space-y-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar amigo local o buscar por 'Nombre#Tag'..."
              className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#0BC6E3] transition-colors" 
            />
          </div>

          {showGlobalSearchPrompt && (
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-white/[0.05] border border-white/10 rounded-xl text-white text-xs px-3 py-3 focus:outline-none focus:border-[#0BC6E3] cursor-pointer"
              >
                <option value="la1" className="bg-[#0a0a0a]">LAN (LA1)</option>
                <option value="la2" className="bg-[#0a0a0a]">LAS (LA2)</option>
                <option value="na1" className="bg-[#0a0a0a]">NA</option>
                <option value="euw1" className="bg-[#0a0a0a]">EUW</option>
              </select>

              <button
                onClick={handleGlobalSearch}
                disabled={customSearchLoading}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#0BC6E3] text-black font-bold text-xs rounded-xl hover:bg-[#00a8c2] transition-colors disabled:opacity-50 w-full sm:w-auto whitespace-nowrap"
              >
                {customSearchLoading ? <RefreshCw size={14} className="animate-spin" /> : <Globe size={14} />}
                Buscar en Riot
              </button>
            </div>
          )}
        </motion.div>

        {/* Global Search Results Alert/Display */}
        <AnimatePresence>
          {customSearchError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle size={14} />
              <span>{customSearchError}</span>
            </motion.div>
          )}

          {customSearchResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-5 bg-gradient-to-br from-[#0BC6E3]/10 to-[#0f1f2a]/20 border-2 border-[#0BC6E3] rounded-2xl relative"
            >
              <button 
                onClick={() => setCustomSearchResult(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>

              <div className="text-[10px] uppercase font-black text-[#0BC6E3] tracking-widest mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Resultado de Búsqueda Global (API en Vivo)
              </div>

              <div className="flex items-center gap-4 mb-5">
                <img 
                  src={customSearchResult.summonerIcon} 
                  alt="Perfil" 
                  className="w-16 h-16 rounded-full border-2 border-[#0BC6E3]" 
                />
                <div>
                  <h3 className="text-white text-xl font-bold font-['Orbitron']">{customSearchResult.summonerName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0BC6E3]/20 text-[#0BC6E3] text-[10px] font-bold">
                    Lv. {customSearchResult.summonerLevel}
                  </span>
                </div>
              </div>

              {customSearchResult.topChampions && customSearchResult.topChampions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Sword size={10} /> Top Campeones
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {customSearchResult.topChampions.map((champ, j) => (
                      <div key={j} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <img src={champ.icon} alt={champ.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold">{champ.name}</p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array.from({ length: 7 }).map((_, k) => (
                              <Star key={k} size={8} className={k < champ.mastery ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[#0BC6E3] text-xs font-bold">{champ.points.toLocaleString()}</p>
                          <p className="text-gray-600 text-[9px]">pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid of Friends */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((friend, i) => {
            const hasRiotConfig = RIOT_ACCOUNTS_MAP[friend.id] !== null;
            const riotConfig = RIOT_ACCOUNTS_MAP[friend.id];
            
            const liveData = liveStatsMap[friend.id];
            const isLoading = loadingMap[friend.id];
            const hasError = errorMap[friend.id];

            // Setup local fallbacks
            const dispSummonerName = liveData?.summonerName || (riotConfig ? `${riotConfig.gameName}#${riotConfig.tagLine}` : '') || friend.summonerName || friend.nickname;
            const dispSummonerLevel = liveData?.summonerLevel || friend.summonerLevel;
            const dispSummonerIcon = liveData?.summonerIcon || `https://ddragon.leagueoflegends.com/cdn/14.12.1/img/profileicon/${friend.summonerIcon || '29'}.png`;
            const dispChampions = liveData?.topChampions || friend.topChampions;

            return (
              <motion.div
                key={friend.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setExpandedId(expandedId === friend.id ? null : friend.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  expandedId === friend.id
                    ? 'bg-[#0BC6E3]/5 border-[#0BC6E3]/50'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                {/* Status Badges */}
                {hasRiotConfig && (
                  <div className="absolute top-4 right-4 z-10 flex gap-1">
                    {isLoading ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-wider">
                        <RefreshCw size={8} className="animate-spin" /> Cargando API
                      </span>
                    ) : hasError ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase tracking-wider">
                        <AlertTriangle size={8} /> Local Cache
                      </span>
                    ) : liveData ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[8px] font-black uppercase tracking-wider">
                        <CheckCircle2 size={8} /> API En Vivo
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Header info */}
                <div className="flex items-center gap-3 mb-4">
                  <img src={friend.foto} alt={friend.nickname} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                  <div className="flex-1 min-w-0 pr-16">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-sm truncate">{friend.nickname}</h3>
                    </div>
                    <p className="text-gray-600 text-xs truncate">{friend.nombre}</p>
                  </div>
                </div>

                {/* LoL Content */}
                {!hasRiotConfig ? (
                  /* "Si me baño" custom banner */
                  <div className="py-8 px-4 rounded-lg bg-gradient-to-r from-blue-500/5 to-teal-500/5 border border-blue-500/10 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      🧼
                    </div>
                    <p className="text-white font-black font-['Orbitron'] text-sm tracking-wider uppercase">Si me baño</p>
                    <p className="text-gray-500 text-[10px]">Este miembro no juega League of Legends.</p>
                  </div>
                ) : (
                  /* Player statistics */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.04]">
                      <img src={dispSummonerIcon} alt="Icono" className="w-9 h-9 rounded-lg object-cover border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-xs truncate">{dispSummonerName}</p>
                        {dispSummonerLevel && (
                          <span className="text-gray-400 text-[10px]">
                            Nivel {dispSummonerLevel}
                          </span>
                        )}
                      </div>
                    </div>

                    {dispChampions && dispChampions.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-gray-500 text-[9px] uppercase tracking-wider flex items-center gap-1">
                          <Sword size={9} /> Top Campeones
                        </p>
                        <div className="space-y-1">
                          {dispChampions.map((champ, j) => (
                            <div key={j} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.03] border border-white/5">
                              <img src={champ.icon} alt={champ.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">{champ.name}</p>
                                <div className="flex items-center gap-0.5 mt-0.5">
                                  {Array.from({ length: 7 }).map((_, k) => (
                                    <Star key={k} size={7} className={k < champ.mastery ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[#0BC6E3] text-xs font-bold">{champ.points.toLocaleString()}</p>
                                <p className="text-gray-600 text-[9px]">pts</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Expandable detail */}
                <AnimatePresence>
                  {expandedId === friend.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Riot ID</span>
                          <span className="text-white">{riotConfig ? `${riotConfig.gameName}#${riotConfig.tagLine}` : 'No juega'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Profesión</span>
                          <span className="text-white">{friend.profesion}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Plataforma</span>
                          <span className="text-white">{friend.plataforma}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Aptitudes Gaming</span>
                          <div className="flex gap-2">
                            {Object.entries(friend.aptitudes).slice(0, 3).map(([k, v]) => (
                              <span key={k} className="text-[#0BC6E3]">{k.slice(0, 3)}: {v}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Award size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron invocadores</p>
          </div>
        )}
      </div>
    </div>
  );
}
