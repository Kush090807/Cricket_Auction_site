
import React, { useState } from 'react';
import { Player, Team, PlayerStatus, TabType, LeagueConfig, UserRole } from '../types';
import { formatPrice } from '../constants';
import { Users, Gavel, Shield, CreditCard, PieChart, Edit3, Key, ArrowUpRight, Trophy } from 'lucide-react';

interface Props {
  players: Player[];
  teams: Team[];
  config: LeagueConfig;
  userRole: UserRole;
  onUpdateConfig: (config: LeagueConfig) => void;
  onNavigate: (tab: TabType) => void;
}

const Dashboard: React.FC<Props> = ({ players, teams, config, userRole, onUpdateConfig, onNavigate }) => {
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState<LeagueConfig>(config);

  const isAdmin = userRole === UserRole.ADMIN;
  const soldPlayers = players.filter(p => p.status === PlayerStatus.SOLD);
  const totalSpent = soldPlayers.reduce((sum, p) => sum + p.currentPrice, 0);
  
  const stats = [
    { label: 'REGISTERED POOL', value: players.length, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'HAMMERS DOWN', value: soldPlayers.length, icon: Gavel, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'ACTIVE TEAMS', value: teams.length, icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'MARKET VOLUME', value: formatPrice(totalSpent), icon: CreditCard, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-1">
              <h2 className="text-5xl md:text-6xl font-orbitron font-black text-white uppercase tracking-tighter leading-none">
                {config.name}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-black text-xs uppercase tracking-[0.4em]">{config.season}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> LIVE STREAMING
                </span>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && !isEditingConfig && (
          <div className="flex items-center gap-4">
            <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-4">
               <Key className="w-4 h-4 text-amber-400" />
               <div className="text-left">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ACCESS CODE</p>
                 <p className="text-lg font-orbitron font-black text-white">{config.inviteCode}</p>
               </div>
            </div>
            <button onClick={() => { setTempConfig(config); setIsEditingConfig(true); }} className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 transition-all shadow-xl">
              <Edit3 className="w-6 h-6" />
            </button>
          </div>
        )}

        {isEditingConfig && isAdmin && (
          <div className="glass-panel p-8 rounded-[2.5rem] border-emerald-500/20 w-full md:max-w-xl animate-in zoom-in-95">
             <div className="grid grid-cols-2 gap-6 mb-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LEAGUE NAME</label>
                 <input value={tempConfig.name} onChange={e => setTempConfig({...tempConfig, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-emerald-500 outline-none" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">INVITE CODE</label>
                 <input value={tempConfig.inviteCode} onChange={e => setTempConfig({...tempConfig, inviteCode: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-emerald-500 outline-none" />
               </div>
             </div>
             <div className="flex justify-end gap-3">
                <button onClick={() => setIsEditingConfig(false)} className="px-6 py-2 text-xs font-black text-slate-500">CANCEL</button>
                <button onClick={() => { onUpdateConfig(tempConfig); setIsEditingConfig(false); }} className="bg-emerald-600 px-8 py-3 rounded-2xl text-xs font-black text-white">UPDATE SYSTEM</button>
             </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-8 rounded-[3rem] hover-float relative overflow-hidden group">
            <div className={`w-16 h-16 rounded-3xl ${stat.bg} ${stat.color} flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mb-3">{stat.label}</p>
              <p className="text-4xl font-black text-white font-orbitron tracking-tighter">{stat.value}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-5 ${stat.color} transform -rotate-12`}>
              <stat.icon className="w-full h-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">
        <div className="glass-panel p-10 rounded-[4rem] border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-black text-white flex items-center gap-4">
              <Shield className="w-8 h-8 text-emerald-500" /> FRANCHISE PURSE
            </h3>
            <button onClick={() => onNavigate('teams')} className="text-xs font-black text-emerald-500 flex items-center gap-2 tracking-[0.2em] uppercase transition-all hover:gap-4">
              DETAILED VIEW <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {teams.map(team => {
              const spent = team.totalBudget - team.remainingBudget;
              const percentage = (spent / team.totalBudget) * 100;
              return (
                <div key={team.id} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-white text-base uppercase tracking-tight">{team.name}</span>
                    <span className="text-sm font-orbitron font-bold text-emerald-400">{formatPrice(team.remainingBudget)}</span>
                  </div>
                  <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-1">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-lime-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={{ width: `${Math.min(percentage, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
