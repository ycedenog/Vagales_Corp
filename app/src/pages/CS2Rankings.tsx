import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, TrendingDown, Minus, Crosshair, Star, ChevronRight, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cs2Leaderboard } from '../data/leaderboard';
import { fetchLeetifyProfile, LEETIFY_STEAM_MAP, LiveCS2Stats } from '../services/leetifyApi';

export default function CS2Rankings() {
  const [sortBy, setSortBy] = useState<'points' | 'kd' | 'winRate' | 'matches'>('points');

  // Live Leetify API States
  const [liveStatsMap, setLiveStatsMap] = useState<Record<string, LiveCS2Stats | null>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, boolean>>({});

  // Load stats sequentially on mount
  useEffect(() => {
    let active = true;

    const loadAllStats = async () => {
      const friendIds = Object.keys(LEETIFY_STEAM_MAP);
      for (const id of friendIds) {
        if (!active) break;
        const steamId = LEETIFY_STEAM_MAP[id];
        if (!steamId) continue; // Skip non-players

        setLoadingMap(prev => ({ ...prev, [id]: true }));
        try {
          const stats = await fetchLeetifyProfile(steamId);
          if (active) {
            setLiveStatsMap(prev => ({ ...prev, [id]: stats }));
            setErrorMap(prev => ({ ...prev, [id]: false }));
          }
        } catch (err) {
          console.error(`Error loading Leetify stats for ${id}:`, err);
          if (active) {
            setErrorMap(prev => ({ ...prev, [id]: true }));
          }
        } finally {
          if (active) {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
          }
        }
        // Small delay to respect rate limit
        await new Promise(resolve => setTimeout(resolve, 350));
      }
    };

    loadAllStats();

    return () => {
      active = false;
    };
  }, []);

  // Merge mock leaderboard entries with live Leetify data (only for active CS2 players)
  const mergedLeaderboard = cs2Leaderboard
    .filter(entry => LEETIFY_STEAM_MAP[entry.playerId] !== null && LEETIFY_STEAM_MAP[entry.playerId] !== undefined)
    .map(entry => {
      const live = liveStatsMap[entry.playerId];
      const hasError = errorMap[entry.playerId];
      const isLoading = loadingMap[entry.playerId];

      if (live && !hasError) {
        return {
          ...entry,
          matches: live.matches,
          wins: live.wins,
          kd: live.kd,
          winRate: live.winRate,
          points: live.premierRating || entry.points, // Use Premier rating or fallback to mock points
          isLive: true,
          isLoading: false
        };
      }
      return {
        ...entry,
        isLive: false,
        isLoading
      };
    });

  // Sort entries based on sortBy
  const sorted = [...mergedLeaderboard].sort((a, b) => {
    if (sortBy === 'points') return b.points - a.points;
    if (sortBy === 'kd') return b.kd - a.kd;
    if (sortBy === 'winRate') return b.winRate - a.winRate;
    return b.matches - a.matches;
  });

  // Assign position based on sort order
  const rankedSorted = sorted.map((entry, idx) => ({
    ...entry,
    currentPosition: idx + 1
  }));

  const getRankColor = (pos: number) => {
    if (pos === 1) return 'text-yellow-400';
    if (pos === 2) return 'text-gray-300';
    if (pos === 3) return 'text-amber-600';
    return 'text-gray-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={14} className="text-green-400" />;
    if (trend === 'down') return <TrendingDown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-gray-500" />;
  };

  const sortOptions = [
    { key: 'points' as const, label: 'Puntos Premier' },
    { key: 'kd' as const, label: 'K/D / Rating' },
    { key: 'winRate' as const, label: 'Win Rate' },
    { key: 'matches' as const, label: 'Partidas' },
  ];

  const anyLoading = Object.values(loadingMap).some(v => v);
  const anyLive = Object.values(liveStatsMap).some(v => v !== null && v !== undefined);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16">
      {/* Hero */}
      <div className="relative overflow-hidden py-12">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5A623]/10 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-center gap-3 mb-4">
            <Crosshair size={32} className="text-[#F5A623]" />
            <Trophy size={32} className="text-[#F5A623]" />
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white font-['Orbitron']">
            CLASIFICACIÓN <span className="text-[#F5A623]">CS2</span>
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-gray-400 mt-3">Tabla general de rendimiento en vivo conectada con Leetify API</motion.p>
          
          {/* Leetify Attribution Logo */}
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-4 inline-block bg-white/[0.02] border border-white/10 rounded-lg p-2.5 max-w-[200px] mx-auto">
            <img src="/images/leetify_logo.png" alt="Data provided by Leetify" className="w-full h-auto object-contain" />
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20">
        {/* Sort and Live Status Indicators */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-gray-500 text-sm flex items-center mr-2">Ordenar por:</span>
            {sortOptions.map((opt) => (
              <button key={opt.key} onClick={() => setSortBy(opt.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === opt.key ? 'bg-[#F5A623] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {anyLoading ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                <RefreshCw size={12} className="animate-spin" /> Actualizando API...
              </span>
            ) : anyLive ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold">
                <CheckCircle2 size={12} /> Live API
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                <AlertTriangle size={12} /> Local Cache
              </span>
            )}
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
          {rankedSorted.slice(0, 3).map((entry, i) => (
            <motion.div key={entry.playerId}
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
              className={`text-center p-4 rounded-xl border relative overflow-hidden ${
                i === 0 ? 'bg-yellow-400/5 border-yellow-400/30 order-2' :
                i === 1 ? 'bg-gray-300/5 border-gray-300/20 order-1 mt-6' :
                'bg-amber-600/5 border-amber-600/20 order-3 mt-10'
              }`}>
              {entry.isLoading && (
                <div className="absolute top-2 right-2">
                  <RefreshCw size={10} className="animate-spin text-[#F5A623]" />
                </div>
              )}
              <img src={entry.foto} alt={entry.playerNickname}
                className={`w-16 h-16 rounded-full mx-auto object-cover border-2 ${
                  i === 0 ? 'border-yellow-400' : i === 1 ? 'border-gray-300' : 'border-amber-600'
                }`} />
              <p className={`font-bold mt-2 text-sm ${getRankColor(i + 1)}`}>#{i + 1}</p>
              <p className="text-white font-semibold text-sm truncate">{entry.playerNickname}</p>
              <p className="text-gray-500 text-xs">{entry.points === 0 ? 'Sin Rango' : `${entry.points.toLocaleString()} pts`}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-white/[0.02] rounded-xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-white/5 text-gray-500 text-xs uppercase tracking-wider font-semibold">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Jugador</div>
            <div className="col-span-2 text-center">Partidas</div>
            <div className="col-span-1 text-center">K/D (Est.)</div>
            <div className="col-span-2 text-center">Win Rate</div>
            <div className="col-span-1 text-center">Trend</div>
            <div className="col-span-1 text-right">Pts</div>
          </div>

          {/* Rows */}
          {rankedSorted.map((entry, index) => (
            <Link to={`/cs2-stats?player=${entry.playerId}`} key={entry.playerId}>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 * index }}
                className={`grid grid-cols-12 gap-2 px-4 py-3 border-t border-white/5 items-center hover:bg-white/5 transition-colors cursor-pointer group ${
                  index < 3 ? 'bg-white/[0.02]' : ''
                }`}
              >
                <div className="col-span-1">
                  <span className={`font-bold ${getRankColor(entry.currentPosition)}`}>#{entry.currentPosition}</span>
                </div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="relative">
                    <img src={entry.foto} alt={entry.playerNickname} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    {entry.isLoading && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                        <RefreshCw size={10} className="animate-spin text-[#F5A623]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold group-hover:text-[#F5A623] transition-colors flex items-center gap-1.5">
                      {entry.playerNickname}
                      {entry.isLive && (
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" title="Datos en vivo" />
                      )}
                    </p>
                    <p className="text-gray-600 text-xs">{entry.playerName}</p>
                  </div>
                </div>
                <div className="col-span-2 text-center text-gray-300 text-sm">{entry.matches}</div>
                <div className="col-span-1 text-center text-sm font-semibold" style={{ color: entry.kd >= 1.2 ? '#00ff88' : entry.kd >= 0.95 ? '#F5A623' : '#ef4444' }}>
                  {entry.kd.toFixed(2)}
                </div>
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${entry.winRate}%`, backgroundColor: entry.winRate >= 54 ? '#00ff88' : entry.winRate >= 46 ? '#F5A623' : '#ef4444' }} />
                    </div>
                    <span className="text-gray-300 text-xs">{entry.winRate}%</span>
                  </div>
                </div>
                <div className="col-span-1 flex justify-center">{getTrendIcon(entry.trend)}</div>
                <div className="col-span-1 text-right">
                  <span className="text-[#F5A623] font-bold text-sm flex items-center justify-end gap-1">
                    <Star size={12} /> {entry.points === 0 ? 'Sin Rango' : entry.points.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Link to individual stats */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-8 text-center">
          <Link to="/cs2-stats"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5A623] text-black font-bold rounded-lg hover:bg-[#d9911f] transition-all hover:scale-105">
            <Crosshair size={18} />
            Ver Estadísticas Individuales
            <ChevronRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
