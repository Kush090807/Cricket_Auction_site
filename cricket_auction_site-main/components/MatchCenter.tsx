
import React, { useState, useEffect } from 'react';
import { MatchScore, UserRole, Team, Player } from '../types';
// Added Target to the import list
import { Radio, Tv, Shield, User, Zap, RotateCcw, ChevronRight, Settings2, Coins, Gavel, Sword, CircleDot, AlertTriangle, Target } from 'lucide-react';
import { formatPrice } from '../constants';

interface Props {
  score: MatchScore;
  onUpdate: (score: MatchScore) => void;
  userRole: UserRole;
  teams: Team[];
  players: Player[];
}

const MatchCenter: React.FC<Props> = ({ score, onUpdate, userRole, teams, players }) => {
  const isAdmin = userRole === UserRole.ADMIN;
  const [stagedScore, setStagedScore] = useState<MatchScore>(score);
  const [setupStep, setSetupStep] = useState<number>(score.battingTeam === 'Batting Team' ? 1 : 0);
  
  // Sync state for spectators
  useEffect(() => { if (!isAdmin) setStagedScore(score); }, [score, isAdmin]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      <header className="flex items-center justify-between border-b border-white/5 pb-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-600 rounded-2xl shadow-xl">
            <Tv className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-5xl font-orbitron font-black text-white italic uppercase tracking-tighter">LIVE BROADCAST</h2>
        </div>
        {isAdmin && (
          <button onClick={() => setSetupStep(1)} className="p-4 glass-panel rounded-2xl text-slate-400 hover:text-white hover:border-emerald-500 transition-all">
            <Settings2 className="w-6 h-6" />
          </button>
        )}
      </header>

      {/* SYNCED BID ROW (FOR SPECTATORS) */}
      {score.currentBid && score.currentBid.teamName !== 'No Bids Yet' && (
        <div key={score.currentBid.timestamp} className="animate-in slide-in-from-top-20 duration-1000">
           <div className="p-12 glass-panel rounded-[4rem] border-2 border-emerald-500 bg-emerald-600/10 shadow-[0_0_120px_rgba(16,185,129,0.3)] flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-10 relative z-10">
                <div className="w-32 h-32 rounded-[2rem] bg-slate-900 border-2 border-emerald-500/30 overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
                  {score.currentBid.playerPhoto ? (
                    <img src={score.currentBid.playerPhoto} className="w-full h-full object-cover" alt="Player" />
                  ) : (
                    <User className="w-12 h-12 text-slate-800 m-auto mt-10" />
                  )}
                </div>
                <div>
                   <p className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-3">CURRENTLY BIDDING</p>
                   <h3 className="text-5xl font-orbitron font-black text-white italic uppercase tracking-tighter leading-none">{score.currentBid.playerName}</h3>
                </div>
              </div>

              <div className="text-center relative z-10">
                 <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">HIGHEST BIDDER</p>
                 <div className="text-6xl lg:text-7xl font-orbitron font-black text-white uppercase tracking-tighter leading-none animate-pulse">{score.currentBid.teamName}</div>
              </div>

              <div className="text-right relative z-10">
                 <p className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-3">BID AMOUNT</p>
                 <div className="text-8xl font-orbitron font-black text-emerald-500 leading-none shadow-emerald-950">{formatPrice(score.currentBid.amount)}</div>
              </div>
           </div>
        </div>
      )}

      {/* ADMIN SETUP OVERLAY */}
      {isAdmin && setupStep > 0 && (
         <div className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
            <div className="max-w-4xl w-full glass-panel p-16 rounded-[4rem] border-emerald-500/20 text-center space-y-12 shadow-3xl">
               <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center">
                    <Radio className="w-10 h-10 text-white animate-pulse" />
                  </div>
               </div>
               <h2 className="text-5xl font-orbitron font-black text-white uppercase italic tracking-tighter">Initialize Broadcast</h2>
               <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4 text-left">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">BATTING FRANCHISE</p>
                     <select className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 text-white text-xl uppercase font-black outline-none focus:border-emerald-500 transition-all" onChange={e => setStagedScore({...stagedScore, battingTeam: e.target.value})}>
                        <option>SELECT FRANCHISE</option>
                        {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-4 text-left">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">FIELDING FRANCHISE</p>
                     <select className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 text-white text-xl uppercase font-black outline-none focus:border-emerald-500 transition-all" onChange={e => setStagedScore({...stagedScore, bowlingTeam: e.target.value})}>
                        <option>SELECT FRANCHISE</option>
                        {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                     </select>
                  </div>
               </div>
               <div className="flex gap-4">
                 <button onClick={() => setSetupStep(0)} className="flex-1 py-8 text-slate-500 font-bold uppercase tracking-widest">Cancel</button>
                 <button onClick={() => { setSetupStep(0); onUpdate(stagedScore); }} className="flex-[2] py-8 bg-emerald-600 hover:bg-emerald-500 rounded-[2.5rem] font-orbitron font-black text-3xl text-white shadow-2xl transition-all active:scale-95">GO LIVE</button>
               </div>
            </div>
         </div>
      )}

      {/* LIVE SCOREBOARD SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="glass-panel p-12 rounded-[4rem] border-emerald-500/10 space-y-10 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.5em]">{score.battingTeam}</h3>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">LIVE SCORE</span>
              </div>
            </div>
            <div className="flex justify-between items-end">
               <span className="text-9xl font-orbitron font-black text-white leading-none tracking-tighter">{score.runs}<span className="text-6xl text-rose-600 font-normal">/{score.wickets}</span></span>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">OVERS COMPLETED</p>
                  <span className="text-5xl font-orbitron font-black text-slate-700 leading-none">{score.overs}.{score.balls}</span>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
               {[score.striker, score.nonStriker].map((bat, i) => (
                  <div key={i} className={`p-8 rounded-[2.5rem] transition-all ${i === 0 ? 'bg-emerald-600/10 border border-emerald-500/30 shadow-lg' : 'bg-black/40 border border-white/5'}`}>
                     <div className="flex items-center gap-3 mb-4">
                       <p className="text-white font-black uppercase text-sm tracking-tight">{bat.name}</p>
                       {i === 0 && <CircleDot className="w-3 h-3 text-emerald-500 animate-pulse" />}
                     </div>
                     <div className="flex justify-between items-end">
                        <p className="text-4xl font-orbitron font-black text-white leading-none">{bat.runs}</p>
                        <p className="text-sm font-bold text-slate-600">({bat.balls})</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="glass-panel p-12 rounded-[4rem] border-rose-500/10 space-y-10 hover:border-rose-500/30 transition-all">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-black text-rose-500 uppercase tracking-[0.5em]">{score.bowlingTeam}</h3>
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">FIELDING ATTACK</span>
            </div>
            <div className="p-10 bg-rose-600/10 border border-rose-500/30 rounded-[3rem] shadow-xl">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-black text-white uppercase italic">{score.bowler.name}</p>
                  </div>
                  <div className="bg-rose-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">CURRENT SPELL</div>
               </div>
               <div className="grid grid-cols-3 gap-8">
                  <div className="text-center group"><p className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest group-hover:text-rose-500 transition-colors">OVERS</p><p className="text-4xl font-orbitron font-black text-white">{score.bowler.overs}</p></div>
                  <div className="text-center group border-x border-white/10"><p className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest group-hover:text-rose-500 transition-colors">RUNS</p><p className="text-4xl font-orbitron font-black text-white">{score.bowler.runs}</p></div>
                  <div className="text-center group"><p className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest group-hover:text-rose-500 transition-colors">WKTS</p><p className="text-5xl font-orbitron font-black text-rose-500">{score.bowler.wickets}</p></div>
               </div>
            </div>
            
            <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500/40" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">TARGET SCORE</p>
               </div>
               <p className="text-3xl font-orbitron font-black text-white">{score.target || '---'}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MatchCenter;
