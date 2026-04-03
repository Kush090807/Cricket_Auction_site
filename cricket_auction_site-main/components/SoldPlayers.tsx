
import React, { useState } from 'react';
import { Player, Team, PlayerStatus } from '../types';
import { formatPrice, getRoleColor } from '../constants';
import { History, Search, Download } from 'lucide-react';

interface Props {
  players: Player[];
  teams: Team[];
}

const SoldPlayers: React.FC<Props> = ({ players, teams }) => {
  const [search, setSearch] = useState('');
  
  const soldPlayers = players.filter(p => p.status === PlayerStatus.SOLD)
    .sort((a, b) => b.currentPrice - a.currentPrice); // Highest price first

  const filtered = soldPlayers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-orbitron font-bold text-white">Sold History</h2>
          <p className="text-slate-400">Review all players acquired during this auction cycle.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all text-slate-300"
        >
          <Download className="w-5 h-5" />
          Export PDF
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input 
          type="text"
          placeholder="Filter by player name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Player</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Buying Team</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Base Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Final Bid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                    {search ? "No results found for your search." : "No players sold yet. Head over to the Arena!"}
                  </td>
                </tr>
              ) : (
                filtered.map(player => {
                  const team = teams.find(t => t.id === player.teamId);
                  return (
                    <tr key={player.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-5">
                        <span className="font-bold text-white text-lg">{player.name}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleColor(player.role)}`}>
                          {player.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-semibold text-cyan-400">{team?.name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-5 text-slate-400 font-medium">
                        {formatPrice(player.basePrice)}
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-orbitron font-bold text-emerald-400 text-lg">
                          {formatPrice(player.currentPrice)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SoldPlayers;
