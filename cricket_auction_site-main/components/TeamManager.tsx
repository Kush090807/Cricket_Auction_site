
import React, { useState, useRef } from 'react';
import { Team, UserRole, Player } from '../types';
import { Shield, Plus, Trash2, Edit3, Check, X, Lock, Users, Crown, Camera, Image as ImageIcon, Star } from 'lucide-react';
import { formatPrice, getRoleColor } from '../constants';

interface Props {
  teams: Team[];
  players: Player[];
  userRole: UserRole;
  onAdd: (team: Team) => void;
  onUpdate: (team: Team) => void;
  onDelete: (id: string) => void;
}

const TeamManager: React.FC<Props> = ({ teams, players, userRole, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedTeamSquad, setSelectedTeamSquad] = useState<Team | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isAdmin = userRole === UserRole.ADMIN;
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    owner: '',
    captain: '',
    viceCaptain: '',
    totalBudget: 10000,
    logoUrl: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !formData.name || !formData.totalBudget) return;

    if (editingId) {
      const existing = teams.find(t => t.id === editingId)!;
      const budgetDiff = Number(formData.totalBudget) - existing.totalBudget;
      onUpdate({ 
        ...existing, 
        name: formData.name!, 
        owner: formData.owner,
        captain: formData.captain,
        viceCaptain: formData.viceCaptain,
        logoUrl: formData.logoUrl,
        totalBudget: Number(formData.totalBudget),
        remainingBudget: existing.remainingBudget + budgetDiff
      });
      setEditingId(null);
    } else {
      const newTeam: Team = {
        id: 'team-' + Date.now(),
        name: formData.name!,
        owner: formData.owner,
        captain: formData.captain,
        viceCaptain: formData.viceCaptain,
        logoUrl: formData.logoUrl,
        totalBudget: Number(formData.totalBudget),
        remainingBudget: Number(formData.totalBudget)
      };
      onAdd(newTeam);
      setIsAdding(false);
    }
    setFormData({ name: '', owner: '', captain: '', viceCaptain: '', totalBudget: 10000, logoUrl: '' });
  };

  const startEdit = (team: Team) => {
    if (!isAdmin) return;
    setEditingId(team.id);
    setFormData({ 
      name: team.name, 
      owner: team.owner || '', 
      captain: team.captain || '', 
      viceCaptain: team.viceCaptain || '',
      totalBudget: team.totalBudget,
      logoUrl: team.logoUrl || ''
    });
    setIsAdding(true);
  };

  const getTeamSquad = (teamId: string) => players.filter(p => p.teamId === teamId);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-orbitron font-bold text-white tracking-tight uppercase">FRANCHISE CONTROL</h2>
          <p className="text-slate-500 font-medium text-sm">Managing {teams.length} teams in active league ops.</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', owner: '', captain: '', viceCaptain: '', totalBudget: 10000, logoUrl: '' }); }} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl flex items-center gap-3 font-bold text-white transition-all shadow-xl shadow-indigo-900/40">
            <Plus className="w-6 h-6" /> CREATE FRANCHISE
          </button>
        )}
      </div>

      {isAdding && isAdmin && (
        <div className="glass-panel p-10 rounded-[3rem] animate-in slide-in-from-top duration-500 relative z-50 border-indigo-500/30">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-950/50 hover:border-indigo-500 transition-all cursor-pointer group h-full min-h-[250px]" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              {formData.logoUrl ? (
                <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden rounded-3xl">
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-12">
                  <ImageIcon className="w-16 h-16 text-slate-800 group-hover:text-indigo-400 transition-all" />
                  <p className="text-[10px] font-bold text-slate-600 group-hover:text-slate-400 tracking-[0.3em] uppercase">UPLOAD LOGO</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">FRANCHISE NAME</label>
                <input type="text" required className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TOTAL PURSE (L)</label>
                <input type="number" required min="100" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all" value={formData.totalBudget} onChange={e => setFormData({ ...formData, totalBudget: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OWNER</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all" value={formData.owner} onChange={e => setFormData({ ...formData, owner: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CAPTAIN</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all" value={formData.captain} onChange={e => setFormData({ ...formData, captain: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">VICE CAPTAIN</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all" value={formData.viceCaptain} onChange={e => setFormData({ ...formData, viceCaptain: e.target.value })} />
              </div>
            </div>

            <div className="lg:col-span-3 flex justify-end gap-6 pt-10 border-t border-slate-800/50">
              <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-3 text-xs font-bold text-slate-500 hover:text-slate-300">CANCEL</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 px-12 py-3 rounded-2xl font-bold text-white shadow-xl shadow-indigo-900/40">
                {editingId ? 'UPDATE FRANCHISE' : 'CONFIRM CREATION'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {teams.map(team => {
          const squad = getTeamSquad(team.id);
          return (
            <div key={team.id} className="glass-panel rounded-[3rem] p-10 space-y-8 relative overflow-hidden group hover-float flex flex-col">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none">
                {team.logoUrl ? <img src={team.logoUrl} className="w-64 h-64 -mr-24 -mt-24 object-cover rotate-12 group-hover:rotate-0" alt="" /> : <Shield className="w-48 h-48 -mr-16 -mt-16" />}
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
                  {team.logoUrl ? <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" /> : <Shield className="w-10 h-10 text-indigo-500" />}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedTeamSquad(team)} className="p-4 text-slate-600 hover:text-teal-400 bg-slate-950 border border-slate-900 rounded-2xl transition-all"><Users className="w-5 h-5" /></button>
                  {isAdmin && (
                    <>
                      <button onClick={() => startEdit(team)} className="p-4 text-slate-600 hover:text-indigo-400 bg-slate-950 border border-slate-900 rounded-2xl transition-all"><Edit3 className="w-5 h-5" /></button>
                      <button onClick={() => setDeleteConfirmId(team.id)} className="p-4 text-slate-600 hover:text-rose-400 bg-slate-950 border border-slate-900 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
                    </>
                  )}
                </div>
              </div>

              <div className="relative z-10 flex-1">
                <h3 className="text-3xl font-bold text-white mb-6 truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{team.name}</h3>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-bold uppercase tracking-widest bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>CAPT: {team.captain || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-widest bg-slate-950/30 p-3 rounded-xl border border-slate-800/50">
                    <Star className="w-4 h-4 text-indigo-400" />
                    <span>VICE: {team.viceCaptain || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-2 tracking-widest uppercase">
                      <span>PURSE UTILIZATION</span>
                      <span>{Math.round(((team.totalBudget - team.remainingBudget) / team.totalBudget) * 100)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-950 rounded-full border border-slate-900">
                      <div className="h-full bg-gradient-to-r from-indigo-700 to-indigo-400 transition-all duration-1000" style={{ width: `${Math.min(((team.totalBudget - team.remainingBudget) / team.totalBudget) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/60 p-5 rounded-3xl border border-slate-900">
                    <div>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">AVAILABLE</p>
                      <p className="text-xl font-orbitron font-bold text-teal-400">{formatPrice(team.remainingBudget)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">SQUAD</p>
                      <p className="text-xl font-orbitron font-bold text-white">{squad.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {deleteConfirmId === team.id && (
                <div className="absolute inset-0 bg-slate-950/98 z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                  <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest font-orbitron">Dissolve {team.name}?</p>
                  <div className="flex gap-4">
                    <button onClick={() => { onDelete(team.id); setDeleteConfirmId(null); }} className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold">YES</button>
                    <button onClick={() => setDeleteConfirmId(null)} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold">NO</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedTeamSquad && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-2xl rounded-[3rem] p-10 max-h-[85vh] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  {selectedTeamSquad.logoUrl ? <img src={selectedTeamSquad.logoUrl} alt="" className="w-full h-full object-cover" /> : <Shield className="w-10 h-10 text-indigo-400" />}
                </div>
                <div>
                  <h3 className="text-4xl font-orbitron font-bold text-white uppercase tracking-tighter">{selectedTeamSquad.name}</h3>
                  <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-[0.4em]">ACQUIRED ROSTER</p>
                </div>
              </div>
              <button onClick={() => setSelectedTeamSquad(null)} className="p-4 text-slate-600 hover:text-white transition-all"><X className="w-8 h-8" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
              {getTeamSquad(selectedTeamSquad.id).map(player => (
                <div key={player.id} className="flex items-center justify-between p-6 rounded-3xl bg-slate-950/80 border border-slate-900">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shrink-0">
                      {player.imageUrl && <img src={player.imageUrl} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xl">{player.name}</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getRoleColor(player.role)}`}>{player.role}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-orbitron font-bold text-white">{formatPrice(player.currentPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={() => setSelectedTeamSquad(null)} className="mt-8 bg-slate-900 text-white w-full py-4 rounded-2xl font-bold uppercase tracking-widest border border-slate-800">CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
