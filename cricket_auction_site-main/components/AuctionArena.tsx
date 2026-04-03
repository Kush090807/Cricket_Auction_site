
import React, { useState, useEffect } from 'react';
import { Player, Team, PlayerStatus, UserRole, BidInfo } from '../types';
import { formatPrice, getRoleColor } from '../constants';
import { Gavel, User, X, Maximize2, Shield, Search, TrendingUp, Send, CheckCircle2 } from 'lucide-react';

interface Props {
  players: Player[];
  teams: Team[];
  userRole: UserRole;
  onUpdatePlayer: (player: Player) => void;
  onUpdateTeam: (team: Team) => void;
  onSaleCelebration: (player: Player, team: Team) => void;
  isCelebrationActive: boolean;
  currentBid?: BidInfo;
  onBidUpdate: (bid: BidInfo) => void;
  onBroadcastBid: () => void;
}

const AuctionArena: React.FC<Props> = ({ 
  players, teams, userRole, onUpdatePlayer, onUpdateTeam, 
  onSaleCelebration, isCelebrationActive, currentBid, onBidUpdate, onBroadcastBid
}) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [leadingTeamId, setLeadingTeamId] = useState<string | null>(null);
  const [pendingIncrement, setPendingIncrement] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const isAdmin = userRole === UserRole.ADMIN;

  useEffect(() => {
    if (searchQuery.trim() === '') { setSuggestions([]); return; }
    const filtered = players.filter(p => p.status === PlayerStatus.UNSOLD && p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
    setSuggestions(filtered);
  }, [searchQuery, players]);

  // AUTO-BROADCAST EFFECT
  // When currentBid changes in the parent (via onBidUpdate), we auto-trigger the broadcast
  // so the spectator sees the "Bid Row" instantly.
  useEffect(() => {
    if (isAdmin && currentBid && currentBid.teamName !== 'No Bids Yet') {
      onBroadcastBid();
    }
  }, [currentBid, isAdmin]);

  const selectSpotlightPlayer = (player: Player) => {
    setCurrentPlayer(player);
    setLeadingTeamId(null);
    setSearchQuery('');
    setSuggestions([]);
    if (isAdmin) {
      onBidUpdate({ 
        teamName: 'No Bids Yet', 
        amount: player.basePrice, 
        timestamp: Date.now(),
        playerName: player.name,
        playerPhoto: player.imageUrl 
      });
      setFinalPrice(player.basePrice);
    }
  };

  const handleIncrementClick = (inc: number) => {
    if (!currentPlayer || isCelebrationActive) return;
    setPendingIncrement(inc);
  };

  const handleTeamBid = (team: Team) => {
    if (!currentPlayer || pendingIncrement === null) return;
    const newAmount = (currentBid?.amount || currentPlayer.basePrice) + pendingIncrement;
    if (newAmount > team.remainingBudget) { alert("Insufficient budget!"); return; }
    
    // This updates MatchCenter score and triggers the useEffect above to Broadcast automatically
    onBidUpdate({ 
      teamName: team.name, 
      amount: newAmount, 
      timestamp: Date.now(), 
      playerPhoto: currentPlayer.imageUrl, 
      playerName: currentPlayer.name 
    });
    
    setLeadingTeamId(team.id);
    setFinalPrice(newAmount);
    setPendingIncrement(null);
    setBroadcastSent(false);
  };

  const handleFinalizeSale = () => {
    if (!currentPlayer || !leadingTeamId || !isAdmin) return;
    const winningTeam = teams.find(t => t.id === leadingTeamId)!;
    const soldPlayer = { ...currentPlayer, status: PlayerStatus.SOLD, teamId: leadingTeamId, currentPrice: finalPrice };
    onUpdateTeam({ ...winningTeam, remainingBudget: winningTeam.remainingBudget - finalPrice });
    onUpdatePlayer(soldPlayer);
    onSaleCelebration(soldPlayer, winningTeam);
    setIsSoldModalOpen(false);
    setCurrentPlayer(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-1000 relative pb-24">
      
      {currentPlayer && currentBid && currentBid.teamName !== 'No Bids Yet' && (
        <div key={currentBid.timestamp} className="lg:col-span-12 animate-in slide-in-from-top-12 duration-500 z-50">
           <div className="glass-panel p-6 rounded-[2.5rem] border-emerald-500 bg-emerald-600/90 shadow-[0_0_80px_rgba(16,185,129,0.3)] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/20 flex items-center justify-center overflow-hidden">
                   {currentBid.playerPhoto ? <img src={currentBid.playerPhoto} className="w-full h-full object-cover" /> : <User className="w-8 h-8" />}
                </div>
                <div>
                   <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Staged Bid</p>
                   <h4 className="text-2xl font-orbitron font-black text-white uppercase italic">{currentBid.playerName}</h4>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center">
                 <div className="text-[10px] font-black text-black uppercase tracking-[0.4em] mb-1">Staged Team</div>
                 <div className="text-4xl md:text-5xl font-orbitron font-black text-white uppercase tracking-tighter">{currentBid.teamName}</div>
              </div>

              <div className="text-right">
                 <p className="text-[10px] font-black text-black uppercase tracking-widest mb-1">Current Value</p>
                 <div className="text-5xl md:text-6xl font-orbitron font-black text-white leading-none">{formatPrice(currentBid.amount)}</div>
              </div>
           </div>
        </div>
      )}

      <div className="lg:col-span-8 space-y-8">
        {isAdmin && (
          <div className="relative z-[50]">
            <div className="glass-panel p-5 rounded-full flex items-center gap-4 border-emerald-500/30 focus-within:border-emerald-500 shadow-2xl transition-all">
              <Search className="w-6 h-6 text-emerald-500 ml-4" />
              <input type="text" placeholder="SPOTLIGHT SEARCH..." className="bg-transparent border-none outline-none flex-1 text-white font-orbitron font-black text-xl uppercase italic" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-[2rem] p-3 shadow-3xl overflow-hidden z-[100]">
                {suggestions.map(p => (
                  <button key={p.id} onClick={() => selectSpotlightPlayer(p)} className="w-full p-4 flex items-center justify-between rounded-xl hover:bg-emerald-600 transition-all group">
                    <span className="text-lg font-black text-white uppercase italic">{p.name}</span>
                    <span className="text-sm font-orbitron text-emerald-500 group-hover:text-white">{formatPrice(p.basePrice)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`glass-panel rounded-[4rem] p-12 flex flex-col items-center justify-center text-center relative h-[600px] overflow-hidden ${!currentPlayer ? 'opacity-30' : ''}`}>
          {currentPlayer ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
              <div className="w-64 h-64 rounded-[3rem] bg-slate-900 border-4 border-emerald-500/20 shadow-2xl overflow-hidden mb-8 transform hover:scale-105 transition-transform">
                {currentPlayer.imageUrl ? <img src={currentPlayer.imageUrl} className="w-full h-full object-cover" /> : <User className="w-24 h-24 m-auto mt-20 text-slate-800" />}
              </div>
              <h2 className="text-6xl font-orbitron font-black text-white italic uppercase tracking-tighter mb-4 leading-none italic">{currentPlayer.name}</h2>
              <div className={`inline-block px-8 py-2 rounded-full font-black text-[10px] uppercase border tracking-widest ${getRoleColor(currentPlayer.role)}`}>{currentPlayer.role}</div>
              
              {isAdmin && (
                <div className="mt-12 w-full max-w-xl space-y-8">
                  <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map(inc => (
                      <button key={inc} onClick={() => handleIncrementClick(inc)} className={`py-4 rounded-xl font-orbitron font-black text-lg transition-all border ${pendingIncrement === inc ? 'bg-amber-500 border-amber-300 text-black scale-110 shadow-xl' : 'bg-white/5 border-white/10 hover:bg-emerald-600'}`}>+{inc}L</button>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={onBroadcastBid} 
                      disabled={!currentBid || currentBid.teamName === 'No Bids Yet' || isCelebrationActive} 
                      className="flex-1 py-8 rounded-[2.5rem] bg-blue-600 font-orbitron font-black text-2xl text-white flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all disabled:opacity-20 uppercase italic"
                    >
                      <Send className="w-8 h-8" /> Force Broadcast
                    </button>
                    <button onClick={() => setIsSoldModalOpen(true)} disabled={!leadingTeamId || isCelebrationActive} className="px-12 bg-emerald-600 text-white rounded-[2.5rem] font-orbitron font-black text-xl disabled:opacity-20 active:scale-95 transition-all uppercase italic shadow-2xl">
                      Sold!
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-6">
              <Gavel className="w-24 h-24 text-slate-800 mx-auto animate-pulse" />
              <p className="text-slate-500 font-black uppercase tracking-[0.5em] italic">Awaiting Spotlight Selection</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="glass-panel p-8 rounded-[3.5rem] h-full flex flex-col border-white/5 overflow-hidden">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 italic text-center">Active Bidding Paddles</h3>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {teams.map(team => (
              <button 
                key={team.id} 
                onClick={() => handleTeamBid(team)}
                disabled={!isAdmin || !currentPlayer || pendingIncrement === null}
                className={`w-full p-6 rounded-[2rem] border text-left transition-all active:scale-95 relative overflow-hidden group ${leadingTeamId === team.id ? 'bg-emerald-600/20 border-emerald-500 shadow-lg' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
              >
                <div className="flex justify-between items-center mb-2">
                   <p className="text-[9px] font-black text-slate-500 uppercase">Wallet: {formatPrice(team.remainingBudget)}</p>
                   {leadingTeamId === team.id && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                </div>
                <h4 className={`text-xl font-black uppercase tracking-tight italic ${leadingTeamId === team.id ? 'text-white' : 'text-slate-400'}`}>{team.name}</h4>
                {isAdmin && pendingIncrement && (
                   <p className="mt-3 text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 animate-pulse">
                     <TrendingUp className="w-3 h-3" /> Assign {formatPrice((currentBid?.amount || 0) + pendingIncrement)} Bid
                   </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isSoldModalOpen && currentPlayer && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 animate-in fade-in">
           <div className="max-w-2xl w-full glass-panel rounded-[4rem] p-16 text-center border-emerald-500/40 relative">
              <button onClick={() => setIsSoldModalOpen(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all"><X className="w-10 h-10" /></button>
              <h3 className="text-4xl font-orbitron font-black text-white italic uppercase mb-8 tracking-tighter leading-none italic">Hammer Confirmation</h3>
              <div className="bg-black/60 p-12 rounded-[3rem] border border-white/10 mb-8">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">Final Sale Value</p>
                <input type="number" className="w-full bg-transparent text-white font-orbitron font-black text-8xl text-center outline-none" value={finalPrice} onChange={e => setFinalPrice(Number(e.target.value))} />
              </div>
              <div className="flex justify-between p-8 bg-white/5 rounded-[2.5rem] mb-10 text-left">
                <div><p className="text-[10px] font-black text-slate-500 uppercase italic">Team</p><p className="text-2xl font-black text-white uppercase italic">{teams.find(t => t.id === leadingTeamId)?.name}</p></div>
                <div className="text-right"><p className="text-[10px] font-black text-slate-500 uppercase italic">Player</p><p className="text-2xl font-black text-white uppercase italic">{currentPlayer.name}</p></div>
              </div>
              <button onClick={handleFinalizeSale} className="w-full py-8 bg-emerald-600 rounded-[2.5rem] text-white font-orbitron font-black text-3xl shadow-3xl transform active:scale-95 transition-all uppercase italic">Confirm Sale</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AuctionArena;
