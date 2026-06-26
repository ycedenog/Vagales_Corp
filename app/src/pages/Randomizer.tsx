import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Users, Swords, Map, RotateCcw, Trophy, Check, Scale } from 'lucide-react';
import { friends } from '../data/friends';
import { cs2Leaderboard } from '../data/leaderboard';

const LOL_MAPS = ['Grieta del Invocador', 'Abismo de los Lamentos', 'Teamfight Tactics'];
const LOL_ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
const CS2_MAPS = ['Dust II', 'Mirage', 'Inferno', 'Nuke', 'Overpass', 'Ancient', 'Vertigo', 'Anubis'];

interface Team {
  players: typeof friends;
  roles?: string[];
  totalElo?: number;
}

export default function Randomizer() {
  const [gameMode, setGameMode] = useState<'lol' | 'cs2'>('lol');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [selectedMap, setSelectedMap] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const getPlayerPoints = (id: string): number => {
    const entry = cs2Leaderboard.find(l => l.playerId === id);
    return entry ? entry.points : 1000; // Default fallback to 1000 Elo
  };

  const togglePlayer = (id: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      }
      if (prev.length >= 10) return prev; // Limit to exactly 10
      return [...prev, id];
    });
    // Reset generated teams when selection changes
    setTeamA(null);
    setTeamB(null);
  };

  const selectRandomTen = () => {
    const shuffled = [...friends].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10).map(f => f.id);
    setSelectedPlayers(selected);
    setTeamA(null);
    setTeamB(null);
  };

  const clearSelection = () => {
    setSelectedPlayers([]);
    setTeamA(null);
    setTeamB(null);
  };

  // Mathematically balances 10 players into two 5v5 teams minimizing Elo difference
  const balanceCS2Teams = (selectedIds: string[]): { teamA: typeof friends; teamB: typeof friends } => {
    const activePlayers = friends.filter(f => selectedIds.includes(f.id));
    
    let bestDifference = Infinity;
    let bestSplits: { teamA: typeof friends; teamB: typeof friends }[] = [];

    // Helper to generate combinations of 5 from 10
    const combine = (arr: typeof friends, k: number): typeof friends[] => {
      const result: typeof friends[] = [];
      const helper = (start: number, combo: typeof friends) => {
        if (combo.length === k) {
          result.push([...combo]);
          return;
        }
        for (let i = start; i < arr.length; i++) {
          combo.push(arr[i]);
          helper(i + 1, combo);
          combo.pop();
        }
      };
      helper(0, []);
      return result;
    };

    const combos = combine(activePlayers, 5);

    for (const teamACombo of combos) {
      const teamBCombo = activePlayers.filter(p => !teamACombo.some(ta => ta.id === p.id));
      
      const sumA = teamACombo.reduce((sum, p) => sum + getPlayerPoints(p.id), 0);
      const sumB = teamBCombo.reduce((sum, p) => sum + getPlayerPoints(p.id), 0);
      const diff = Math.abs(sumA - sumB);

      if (diff < bestDifference) {
        bestDifference = diff;
        bestSplits = [{ teamA: teamACombo, teamB: teamBCombo }];
      } else if (diff === bestDifference) {
        bestSplits.push({ teamA: teamACombo, teamB: teamBCombo });
      }
    }

    // Pick one of the optimal balanced splits at random
    return bestSplits[Math.floor(Math.random() * bestSplits.length)];
  };

  const generateTeams = useCallback(() => {
    if (selectedPlayers.length !== 10) return;

    setIsGenerating(true);
    setTimeout(() => {
      const activePlayers = friends.filter(f => selectedPlayers.includes(f.id));

      if (gameMode === 'cs2') {
        const balanced = balanceCS2Teams(selectedPlayers);
        
        const eloA = balanced.teamA.reduce((sum, p) => sum + getPlayerPoints(p.id), 0);
        const eloB = balanced.teamB.reduce((sum, p) => sum + getPlayerPoints(p.id), 0);

        setTeamA({ players: balanced.teamA, totalElo: eloA });
        setTeamB({ players: balanced.teamB, totalElo: eloB });
      } else {
        // Random LoL split
        const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
        const a = shuffled.slice(0, 5);
        const b = shuffled.slice(5);
        const roles = [...LOL_ROLES];

        setTeamA({ players: a, roles: roles });
        setTeamB({ players: b, roles: roles });
      }

      setSelectedMap(gameMode === 'lol'
        ? LOL_MAPS[Math.floor(Math.random() * LOL_MAPS.length)]
        : CS2_MAPS[Math.floor(Math.random() * CS2_MAPS.length)]
      );
      setIsGenerating(false);
    }, 850);
  }, [gameMode, selectedPlayers]);

  const sortedFriends = [...friends].sort((a, b) => a.nickname.localeCompare(b.nickname));

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-16">
      {/* Header */}
      <div className="relative overflow-hidden py-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ff88]/10 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-white font-['Orbitron']">
            <span className="text-[#00ff88]">RANDOMIZER</span>
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-gray-400 mt-3">Selecciona exactamente 10 jugadores para formar equipos equilibrados 5v5</motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Mode selector */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex justify-center gap-4 mb-8">
          <button onClick={() => { setGameMode('lol'); setTeamA(null); setTeamB(null); }}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              gameMode === 'lol' ? 'bg-[#0BC6E3] text-black scale-105' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}>
            <Swords size={16} /> League of Legends
          </button>
          <button onClick={() => { setGameMode('cs2'); setTeamA(null); setTeamB(null); }}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              gameMode === 'cs2' ? 'bg-[#F5A623] text-black scale-105' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}>
            <Trophy size={16} /> Counter-Strike 2
          </button>
        </motion.div>

        {/* Player Selection Area */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-[#00ff88]" /> 
              Pool de Jugadores 
              <span className={`px-2 py-0.5 rounded text-xs font-black ${selectedPlayers.length === 10 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                ({selectedPlayers.length} / 10 Seleccionados)
              </span>
            </h3>

            <div className="flex gap-2">
              <button 
                onClick={selectRandomTen}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-semibold transition-all"
              >
                Elegir 10 Aleatorios
              </button>
              <button 
                onClick={clearSelection}
                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-all"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {sortedFriends.map((player) => {
              const isSelected = selectedPlayers.includes(player.id);
              const points = getPlayerPoints(player.id);

              return (
                <div 
                  key={player.id}
                  onClick={() => togglePlayer(player.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2 relative overflow-hidden select-none ${
                    isSelected 
                      ? 'bg-[#00ff88]/5 border-[#00ff88]/40 hover:bg-[#00ff88]/10' 
                      : 'bg-white/[0.01] border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <img src={player.foto} alt={player.nickname} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-[#00ff88]' : 'text-gray-300'}`}>{player.nickname}</p>
                    <p className="text-[9px] text-gray-500 font-medium">Elo: {points}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#00ff88] rounded-full flex items-center justify-center text-black">
                      <Check size={8} strokeWidth={4} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Generate Button */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center mb-12">
          <button 
            onClick={generateTeams} 
            disabled={isGenerating || selectedPlayers.length !== 10}
            className="px-10 py-4 bg-[#00ff88] text-black font-black text-lg rounded-xl hover:bg-[#00cc6a] transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 flex items-center gap-3 mx-auto"
          >
            {isGenerating ? <RotateCcw size={20} className="animate-spin" /> : <Shuffle size={20} />}
            {isGenerating 
              ? 'Generando...' 
              : selectedPlayers.length === 10 
                ? (teamA ? 'Re-Generar Equipos' : 'Generar Equipos') 
                : `Faltan ${10 - selectedPlayers.length} jugadores`}
          </button>
        </motion.div>

        {/* Teams Display */}
        <AnimatePresence>
          {teamA && teamB && selectedMap && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} className="space-y-8">

              {/* Bracket */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                
                {/* Team A */}
                <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-red-500/10 to-red-900/10 rounded-2xl border border-red-500/20 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-red-400" />
                      <h3 className="text-red-400 font-black text-lg font-['Orbitron']">EQUIPO A</h3>
                    </div>
                    {gameMode === 'cs2' && teamA.totalElo && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                        Elo Total: {teamA.totalElo.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {teamA.players.map((p, i) => (
                      <motion.div key={p.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.02]">
                        <img src={p.foto} alt={p.nickname} className="w-8 h-8 rounded-full object-cover border border-red-500/30" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{p.nickname}</p>
                          <p className="text-[10px] text-gray-500 font-medium">Elo: {getPlayerPoints(p.id)}</p>
                        </div>
                        {gameMode === 'lol' && teamA.roles && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">{teamA.roles[i]}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* VS + Map & Elo Balance Status */}
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: 'spring' }}
                  className="text-center space-y-4">
                  <div className="text-5xl font-black text-[#00ff88] font-['Orbitron']">VS</div>
                  
                  {gameMode === 'cs2' && teamA.totalElo && teamB.totalElo && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold">
                      <Scale size={12} />
                      Equilibrado (Dif: {Math.abs(teamA.totalElo - teamB.totalElo)} pts)
                    </div>
                  )}

                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.05] border border-[#00ff88]/30">
                    <Map size={18} className="text-[#00ff88]" />
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Mapa</p>
                      <p className="text-white font-bold text-sm">{selectedMap}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <span>5 vs 5</span>
                    <span>•</span>
                    <span>{gameMode.toUpperCase()}</span>
                  </div>
                </motion.div>

                {/* Team B */}
                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-900/10 rounded-2xl border border-blue-500/20 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-blue-400" />
                      <h3 className="text-blue-400 font-black text-lg font-['Orbitron']">EQUIPO B</h3>
                    </div>
                    {gameMode === 'cs2' && teamB.totalElo && (
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        Elo Total: {teamB.totalElo.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {teamB.players.map((p, i) => (
                      <motion.div key={p.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.02]">
                        <img src={p.foto} alt={p.nickname} className="w-8 h-8 rounded-full object-cover border border-blue-500/30" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{p.nickname}</p>
                          <p className="text-[10px] text-gray-500 font-medium">Elo: {getPlayerPoints(p.id)}</p>
                        </div>
                        {gameMode === 'lol' && teamB.roles && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">{teamB.roles[i]}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

              </div>

              {/* Matchup lines */}
              <div className="hidden md:block relative h-4">
                <div className="absolute left-[33.33%] right-[33.33%] top-1/2 h-[2px] bg-gradient-to-r from-red-500/30 via-[#00ff88]/30 to-blue-500/30" />
                <div className="absolute left-[33.33%] top-0 w-3 h-3 rounded-full bg-red-500 -translate-x-1/2" />
                <div className="absolute right-[33.33%] top-0 w-3 h-3 rounded-full bg-blue-500 translate-x-1/2" />
                <div className="absolute left-1/2 top-0 w-3 h-3 rounded-full bg-[#00ff88] -translate-x-1/2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
