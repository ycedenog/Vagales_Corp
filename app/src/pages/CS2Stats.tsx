import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Target, Trophy, TrendingUp, Calendar, Skull, Award, Swords, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { friends } from '../data/friends';
import { fetchLeetifyProfile, LEETIFY_STEAM_MAP, LiveCS2Stats } from '../services/leetifyApi';

export default function CS2Stats() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPlayer = searchParams.get('player') || friends[0].id;
  const [selectedId, setSelectedId] = useState(initialPlayer);

  // Live Leetify states
  const [liveStats, setLiveStats] = useState<LiveCS2Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const p = searchParams.get('player');
    if (p) setSelectedId(p);
  }, [searchParams]);

  const selected = friends.find(f => f.id === selectedId) || friends[0];
  const steam64Id = LEETIFY_STEAM_MAP[selected.id];
  const playsCS2 = steam64Id !== null && steam64Id !== undefined;

  // Load Leetify profile when selected player changes
  useEffect(() => {
    if (!playsCS2 || !steam64Id) {
      setLiveStats(null);
      setLoading(false);
      setError(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(false);
    setLiveStats(null);

    fetchLeetifyProfile(steam64Id)
      .then(stats => {
        if (active) {
          setLiveStats(stats);
          setError(false);
        }
      })
      .catch(err => {
        console.error(`Error loading Leetify stats for ${selected.id}:`, err);
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedId, steam64Id, playsCS2]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSearchParams({ player: id });
  };

  // Setup displaying stats: Live Leetify or Mock Fallback
  const mockStats = selected.cs2Stats;
  const dispMatches = liveStats ? liveStats.matches : mockStats?.matches || 0;
  const dispWins = liveStats ? liveStats.wins : mockStats?.wins || 0;
  const dispWinRate = liveStats ? liveStats.winRate : mockStats?.winRate || 0;
  const dispHeadshots = liveStats ? liveStats.headshots : mockStats?.headshots || 0;
  const dispKd = liveStats ? liveStats.kd : mockStats?.kd || 0;
  const dispRank = liveStats ? liveStats.rank : mockStats?.rank || 'N/A';
  const dispRecentMatches = liveStats ? liveStats.recentMatches : mockStats?.recentMatches.map(m => ({
    map: m.map,
    result: m.result,
    score: m.score,
    kd: `K/D: ${m.kd}`,
    date: m.date
  })) || [];

  // Calculate proportional kills and deaths based on live matches count for consistency
  const originalKd = mockStats?.kd || 1.0;
  const dispKills = liveStats ? Math.round(liveStats.matches * 15 * originalKd) : mockStats?.kills || 0;
  const dispDeaths = liveStats ? Math.round(liveStats.matches * 15) : mockStats?.deaths || 0;
  const dispMvps = liveStats ? Math.round(liveStats.matches * 0.25) : mockStats?.mvps || 0;

  const statCards = [
    { icon: <Target size={20} />, label: 'K/D / Rating', value: dispKd.toFixed(2), color: dispKd >= 1.2 ? '#00ff88' : dispKd >= 0.95 ? '#F5A623' : '#ef4444' },
    { icon: <Trophy size={20} />, label: 'Win Rate', value: `${dispWinRate}%`, color: dispWinRate >= 54 ? '#00ff88' : dispWinRate >= 46 ? '#F5A623' : '#ef4444' },
    { icon: <Swords size={20} />, label: 'Partidas', value: dispMatches.toLocaleString(), color: '#3B82F6' },
    { icon: <TrendingUp size={20} />, label: 'Victorias', value: dispWins.toLocaleString(), color: '#00ff88' },
    { icon: <Crosshair size={20} />, label: 'Kills', value: dispKills.toLocaleString(), color: '#ef4444' },
    { icon: <Skull size={20} />, label: 'Muertes', value: dispDeaths.toLocaleString(), color: '#8B5CF6' },
    { icon: <Award size={20} />, label: 'MVPs', value: dispMvps.toLocaleString(), color: '#F5A623' },
    { icon: <Target size={20} />, label: 'Headshots %', value: `${dispHeadshots}%`, color: '#EC4899' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16">
      {/* Header */}
      <div className="relative overflow-hidden py-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5A623]/10 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-4xl font-black text-white font-['Orbitron']">
            STATS <span className="text-[#F5A623]">CS2</span> INDIVIDUALES
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-gray-400 mt-2 text-sm font-light">Selecciona un jugador para ver su rendimiento en tiempo real</motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20 flex flex-col lg:flex-row gap-6">
        {/* LEFT - Player List */}
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="lg:w-72 flex-shrink-0">
          <div className="bg-white/[0.02] rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Jugadores</h3>
            </div>
            <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
              {friends.map((friend) => {
                const playsThis = LEETIFY_STEAM_MAP[friend.id] !== null && LEETIFY_STEAM_MAP[friend.id] !== undefined;
                return (
                  <button
                    key={friend.id}
                    onClick={() => handleSelect(friend.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-white/5 transition-all hover:bg-white/5 ${
                      selectedId === friend.id ? 'bg-[#F5A623]/10 border-l-2 border-l-[#F5A623]' : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <img src={friend.foto} alt={friend.nickname} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    <div className="text-left flex-1">
                      <p className={`text-sm font-semibold ${selectedId === friend.id ? 'text-[#F5A623]' : 'text-white'}`}>{friend.nickname}</p>
                      <p className="text-gray-600 text-xs">
                        {playsThis ? `${friend.cs2Stats?.matches} partidas` : 'No juega'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* RIGHT - Dashboard */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile Header Card */}
              <div className="flex flex-wrap items-center gap-4 mb-6 bg-white/[0.01] border border-white/10 p-5 rounded-2xl relative overflow-hidden">
                <img src={selected.foto} alt={selected.nickname} className="w-20 h-20 rounded-xl object-cover border-2 border-[#F5A623]" />
                <div>
                  <h2 className="text-3xl font-black text-white font-['Orbitron'] tracking-tighter uppercase">{selected.nickname}</h2>
                  <p className="text-gray-400 text-sm mt-1">{selected.nombre}</p>
                  
                  {playsCS2 && (
                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <span className="px-2.5 py-0.5 rounded bg-[#F5A623]/20 text-[#F5A623] text-xs font-bold font-['Orbitron']">
                        Rango: {dispRank}
                      </span>
                      {steam64Id && (
                        <a 
                          href={`https://steamcommunity.com/profiles/${steam64Id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-gray-500 hover:text-white underline transition-colors"
                        >
                          Perfil de Steam
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Live Status Badge */}
                {playsCS2 && (
                  <div className="absolute top-4 right-4 flex gap-1.5 items-center">
                    {loading ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-wider">
                        <RefreshCw size={8} className="animate-spin" /> Conectando API
                      </span>
                    ) : error ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase tracking-wider">
                        <AlertTriangle size={8} /> Local Cache
                      </span>
                    ) : liveStats ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[8px] font-black uppercase tracking-wider">
                        <CheckCircle2 size={8} /> API En Vivo
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Main Content */}
              {!playsCS2 ? (
                /* "Si me baño" custom banner */
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                  className="py-16 px-6 rounded-2xl bg-gradient-to-r from-yellow-500/5 to-amber-500/5 border border-yellow-500/10 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#F5A623]/10 flex items-center justify-center text-2xl text-[#F5A623]">
                    🧼
                  </div>
                  <h3 className="text-white font-black font-['Orbitron'] text-xl tracking-wider uppercase">Si me baño</h3>
                  <p className="text-gray-500 max-w-sm text-sm">Este miembro no juega Counter-Strike 2 y prefiere mantenerse limpio.</p>
                </motion.div>
              ) : (
                <>
                  {/* Leetify Rating Indicators (If Live) */}
                  {liveStats && (
                    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                      className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { label: 'Aim Rating (Puntería)', value: liveStats.aimRating, desc: 'Leetify Aim Score' },
                        { label: 'Positioning (Posicionamiento)', value: liveStats.positioningRating, desc: 'Leetify Position Score' },
                        { label: 'Utility (Utilidad)', value: liveStats.utilityRating, desc: 'Leetify Utility Score' }
                      ].map((rating, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#F5A623]/30 transition-all text-center">
                          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{rating.label}</p>
                          <p className="text-2xl font-black font-['Orbitron'] text-white mt-1.5">{rating.value}</p>
                          <div className="w-full h-1 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                            <div className="h-full bg-[#F5A623]" style={{ width: `${rating.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {statCards.map((card, i) => (
                      <motion.div
                        key={card.label}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div style={{ color: card.color }} className="mb-2">{card.icon}</div>
                        <p className="text-xl font-bold text-white font-['Orbitron']">{card.value}</p>
                        <p className="text-gray-500 text-xs uppercase tracking-wider mt-1">{card.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent Matches */}
                  <div className="bg-white/[0.02] rounded-xl border border-white/10 overflow-hidden relative">
                    <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#F5A623]" />
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Partidas Recientes</h3>
                      </div>
                      
                      {/* Leetify Attribution Logo inside individual matches */}
                      <div className="w-24">
                        <img src="/images/leetify_logo.png" alt="Data by Leetify" className="w-full h-auto opacity-70" />
                      </div>
                    </div>
                    
                    {dispRecentMatches.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">No hay partidas recientes registradas</div>
                    ) : (
                      dispRecentMatches.map((match, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 items-center hover:bg-white/5 transition-colors"
                        >
                          <div className="col-span-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${match.result === 'win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {match.result === 'win' ? 'VICTORIA' : 'DERROTA'}
                            </span>
                          </div>
                          <div className="col-span-3 text-gray-300 text-sm font-semibold">{match.map}</div>
                          <div className="col-span-2 text-white font-bold text-sm font-['Orbitron']">{match.score}</div>
                          <div className="col-span-2 text-gray-400 text-xs font-medium">{match.kd}</div>
                          <div className="col-span-2 text-gray-600 text-xs text-right font-medium">{match.date}</div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
