
import React, { useState, useEffect } from 'react';
import { UserRole, LeagueConfig } from '../types';
import { Trophy, ChevronRight, Mail, Lock, Key, Eye, Radio, AlertCircle } from 'lucide-react';

interface Props {
  onLogin: (role: UserRole) => void;
  config: LeagueConfig;
}

const Login: React.FC<Props> = ({ onLogin, config }) => {
  const [activeTab, setActiveTab] = useState<'spectator' | 'admin'>('spectator');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  // Clear error on tab switch
  useEffect(() => {
    setError('');
  }, [activeTab]);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier.toLowerCase() === 'admin@auction.com' && password === 'admin123') {
      onLogin(UserRole.ADMIN);
    } else {
      setError('AUTH FAILURE: INVALID CREDENTIALS');
    }
  };

  const handleSpectatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize target code from the latest config prop
    const targetCode = (config?.inviteCode || 'CRICKET2025').trim().toUpperCase();
    const userInput = inviteCode.trim().toUpperCase();
    
    console.log('Validating spectator entry:', { userInput, targetCode });

    if (userInput === targetCode) {
      onLogin(UserRole.VIEWER);
    } else {
      setError(`INVALID ACCESS CODE. RE-CHECK SYSTEM KEY.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#040d0a] relative overflow-hidden text-slate-200">
      <div className="absolute inset-0 opacity-20 stadium-gradient" />
      
      {/* Visual Light FX */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="max-w-md w-full space-y-12 animate-in fade-in zoom-in-95 duration-1000 relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-block p-8 bg-black/50 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl mb-4 group">
            <Trophy className="w-16 h-16 text-emerald-500 transition-transform group-hover:scale-125 duration-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-orbitron font-black text-white tracking-tighter uppercase leading-none italic">
            {config?.name || 'PREMIER AUCTION'}
          </h1>
          <div className="flex items-center justify-center gap-3 text-emerald-500/60 font-black text-[10px] tracking-[0.5em] uppercase">
            <Radio className="w-4 h-4 animate-pulse" /> BROADCAST PORTAL
          </div>
        </div>

        <div className="glass-panel p-10 md:p-12 rounded-[4rem] border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] space-y-10">
          <div className="flex bg-black/60 p-2 rounded-full border border-white/5">
            <button onClick={() => setActiveTab('spectator')}
              className={`flex-1 py-4 rounded-full text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'spectator' ? 'bg-emerald-600 text-[#040d0a] shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
              <Eye className="w-4 h-4" /> SPECTATOR
            </button>
            <button onClick={() => setActiveTab('admin')}
              className={`flex-1 py-4 rounded-full text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'admin' ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
              <Lock className="w-4 h-4" /> ADMIN
            </button>
          </div>

          {error && (
            <div className="p-5 bg-rose-600/10 border border-rose-600/30 rounded-[2rem] text-rose-400 text-[10px] font-black text-center tracking-widest flex items-center justify-center gap-3">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {activeTab === 'spectator' ? (
            <form onSubmit={handleSpectatorSubmit} className="space-y-10">
              <div className="space-y-4 text-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] leading-loose">Enter stadium access code</p>
                <div className="relative">
                  <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/50" />
                  <input 
                    type="text" 
                    placeholder="STADIUM CODE..."
                    className="w-full bg-black/80 border border-white/10 rounded-[2.5rem] py-7 pl-16 pr-6 text-white font-orbitron font-black tracking-[0.4em] focus:border-emerald-500 outline-none transition-all text-center placeholder:text-slate-900/40 text-xl"
                    value={inviteCode} 
                    onChange={(e) => setInviteCode(e.target.value)} 
                    required 
                  />
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                   <p className="text-[9px] text-emerald-500/50 font-black uppercase tracking-widest">
                     HINT: {config?.inviteCode || 'CRICKET2025'}
                   </p>
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-[#040d0a] font-orbitron font-black py-8 rounded-[2.5rem] shadow-3xl flex items-center justify-center gap-4 transition-all active:scale-95 text-xl tracking-tighter uppercase italic">
                ENTER ARENA <ChevronRight className="w-8 h-8" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input type="email" placeholder="ADMIN ID" className="w-full bg-black/80 border border-white/10 rounded-[2rem] py-5 pl-16 pr-6 text-sm text-white focus:border-emerald-500 outline-none"
                  value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input type="password" placeholder="PASSPHRASE" className="w-full bg-black/80 border border-white/10 rounded-[2rem] py-5 pl-16 pr-6 text-sm text-white focus:border-emerald-500 outline-none"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="w-full bg-white hover:bg-slate-100 text-black font-orbitron font-black py-6 rounded-[2rem] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 text-lg uppercase italic">
                AUTHENTICATE <ChevronRight className="w-6 h-6" />
              </button>
            </form>
          )}
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.6em] flex items-center justify-center gap-3 italic">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> BROADCASTING LIVE 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
