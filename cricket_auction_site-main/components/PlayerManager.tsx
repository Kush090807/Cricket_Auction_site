
import React, { useState, useRef } from 'react';
import { Player, PlayerRole, PlayerStatus, UserRole } from '../types';
import { Plus, Trash2, Edit3, Search, Check, X, Lock, Users, Camera, Image as ImageIcon, MapPin, Hash, Trophy, Target, Maximize2, User } from 'lucide-react';
import { getRoleColor, formatPrice } from '../constants';

interface Props {
  players: Player[];
  userRole: UserRole;
  onAdd: (player: Player) => void;
  onUpdate: (player: Player) => void;
  onDelete: (id: string) => void;
}

const PlayerManager: React.FC<Props> = ({ players, userRole, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isAdmin = userRole === UserRole.ADMIN;
  const [priceUnit, setPriceUnit] = useState<'L' | 'Cr'>('L');

  const [formData, setFormData] = useState<Partial<Player>>({
    name: '',
    role: PlayerRole.BATSMAN,
    basePrice: 20,
    roomNo: '',
    groupName: '',
    imageUrl: '',
    totalRuns: 0,
    totalWickets: 0,
    matchesPlayed: 0,
    highestScore: 0
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !formData.name || formData.basePrice === undefined) return;
    const priceInLakhs = priceUnit === 'Cr' ? Number(formData.basePrice) * 100 : Number(formData.basePrice);

    if (editingId) {
      const existing = players.find(p => p.id === editingId)!;
      onUpdate({ 
        ...existing, 
        ...formData, 
        basePrice: priceInLakhs, 
        currentPrice: existing.status === PlayerStatus.UNSOLD ? priceInLakhs : existing.currentPrice 
      } as Player);
      setEditingId(null);
    } else {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: formData.name!,
        role: formData.role as PlayerRole,
        basePrice: priceInLakhs,
        currentPrice: priceInLakhs,
        status: PlayerStatus.UNSOLD,
        roomNo: formData.roomNo || '',
        groupName: formData.groupName || '',
        imageUrl: formData.imageUrl || '',
        totalRuns: Number(formData.totalRuns) || 0,
        totalWickets: Number(formData.totalWickets) || 0,
        matchesPlayed: Number(formData.matchesPlayed) || 0,
        highestScore: Number(formData.highestScore) || 0
      };
      onAdd(newPlayer);
      setIsAdding(false);
    }
    setFormData({ name: '', role: PlayerRole.BATSMAN, basePrice: 20, roomNo: '', groupName: '', imageUrl: '', totalRuns: 0, totalWickets: 0, matchesPlayed: 0, highestScore: 0 });
    setPriceUnit('L');
  };

  const startEdit = (player: Player) => {
    if (!isAdmin) return;
    setEditingId(player.id);
    const unit = player.basePrice >= 100 ? 'Cr' : 'L';
    const value = unit === 'Cr' ? player.basePrice / 100 : player.basePrice;
    setFormData({ ...player, basePrice: value });
    setPriceUnit(unit);
    setIsAdding(true);
  };

  const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-orbitron font-bold text-white tracking-tight uppercase">STADIUM POOL</h2>
          <p className="text-slate-500 font-medium text-sm">Managing {players.length} elite participants.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
             <input type="text" placeholder="FIND PLAYER..." className="bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs text-white outline-none focus:border-emerald-500 transition-all" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {isAdmin && (
            <button 
              onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', role: PlayerRole.BATSMAN, basePrice: 20, roomNo: '', groupName: '', imageUrl: '', totalRuns: 0, totalWickets: 0, matchesPlayed: 0, highestScore: 0 }); }}
              className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-2xl flex items-center gap-3 font-bold text-white transition-all shadow-xl"
            >
              <Plus className="w-6 h-6" /> REGISTER PLAYER
            </button>
          )}
        </div>
      </div>

      {isAdding && isAdmin && (
        <div className="glass-panel p-10 rounded-[2.5rem] animate-in slide-in-from-top duration-500 relative z-50 border-emerald-500/30">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2rem] bg-black/40 hover:border-emerald-500 transition-all cursor-pointer group h-full min-h-[200px]" onClick={() => fileInputRef.current?.click()}>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-12 h-12 text-slate-800 group-hover:text-emerald-500 transition-all" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">UPLOAD PHOTO</p>
                  </div>
                )}
              </div>

              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">PLAYER NAME</label>
                  <input type="text" required className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ROLE</label>
                  <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as PlayerRole })}>
                    {Object.values(PlayerRole).map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">BASE PRICE</label>
                  <div className="flex bg-slate-950 border border-white/10 rounded-xl overflow-hidden">
                    <input type="number" required step="0.01" className="flex-1 bg-transparent px-4 py-3 text-white outline-none" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })} />
                    <button type="button" onClick={() => setPriceUnit(priceUnit === 'L' ? 'Cr' : 'L')} className="bg-white/5 border-l border-white/10 px-4 font-bold text-emerald-500">{priceUnit}</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest">GROUP NAME</label>
                  <input type="text" placeholder="e.g. Set A" className="w-full bg-slate-950 border border-amber-500/20 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" value={formData.groupName} onChange={e => setFormData({ ...formData, groupName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest">ROOM NO.</label>
                  <input type="text" placeholder="e.g. 101" className="w-full bg-slate-950 border border-amber-500/20 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" value={formData.roomNo} onChange={e => setFormData({ ...formData, roomNo: e.target.value })} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">MATCHES</label>
                  <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={formData.matchesPlayed} onChange={e => setFormData({ ...formData, matchesPlayed: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">TOTAL RUNS</label>
                  <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={formData.totalRuns} onChange={e => setFormData({ ...formData, totalRuns: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">TOTAL WICKETS</label>
                  <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={formData.totalWickets} onChange={e => setFormData({ ...formData, totalWickets: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HIGHEST SCORE</label>
                  <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" value={formData.highestScore} onChange={e => setFormData({ ...formData, highestScore: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
              <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">CANCEL</button>
              <button type="submit" className="bg-emerald-600 px-10 py-3 rounded-2xl font-black text-white shadow-xl hover:bg-emerald-500 transition-all">{editingId ? 'SAVE UPDATE' : 'REGISTER PLAYER'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredPlayers.map(player => (
          <div key={player.id} onClick={() => setSelectedPlayer(player)} className="glass-panel rounded-[2.5rem] overflow-hidden group hover-float relative flex flex-col cursor-pointer">
            <div className="p-8 space-y-6 flex-1 relative">
              <div className="flex justify-between items-start relative z-10">
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${getRoleColor(player.role)}`}>{player.role}</div>
                {isAdmin && (
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => startEdit(player)} className="p-2 text-slate-600 hover:text-emerald-400 bg-black/40 border border-white/5 rounded-lg transition-all"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirmId(player.id)} className="p-2 text-slate-600 hover:text-rose-400 bg-black/40 border border-white/5 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 bg-slate-950 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center transition-transform group-hover:scale-110">
                  {player.imageUrl ? <img src={player.imageUrl} className="w-full h-full object-cover" /> : <Users className="w-6 h-6 text-slate-800" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-black text-white truncate uppercase tracking-tight group-hover:text-emerald-500 transition-colors">{player.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{formatPrice(player.basePrice)} BASE</p>
                    {(player.groupName || player.roomNo) && <span className="w-1 h-1 bg-white/10 rounded-full" />}
                    {player.groupName && <p className="text-amber-500/80 text-[9px] font-black uppercase tracking-widest">{player.groupName}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 relative z-10 text-center">
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 group-hover:border-emerald-500/30 transition-all">
                  <p className="text-[8px] font-black text-slate-600 uppercase">RUNS</p>
                  <p className="text-lg font-orbitron font-black text-emerald-500">{player.totalRuns || 0}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 group-hover:border-rose-500/30 transition-all">
                  <p className="text-[8px] font-black text-slate-600 uppercase">WICKETS</p>
                  <p className="text-lg font-orbitron font-black text-rose-500">{player.totalWickets || 0}</p>
                </div>
              </div>
            </div>

            <div className={`px-8 py-4 border-t border-white/5 flex items-center justify-between ${player.status === PlayerStatus.SOLD ? 'bg-emerald-600/10' : 'bg-black/40'}`}>
              <span className={`text-[9px] font-black uppercase tracking-widest ${player.status === PlayerStatus.SOLD ? 'text-emerald-400' : 'text-slate-600'}`}>{player.status.toUpperCase()}</span>
              {player.status === PlayerStatus.SOLD && <span className="text-xs font-black text-white font-orbitron">{formatPrice(player.currentPrice)}</span>}
            </div>

            {deleteConfirmId === player.id && (
              <div className="absolute inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center p-6 text-center animate-in fade-in" onClick={e => e.stopPropagation()}>
                <p className="text-xs font-black text-white mb-6 uppercase tracking-[0.2em]">REMOVE PARTICIPANT?</p>
                <div className="flex gap-4">
                  <button onClick={() => { onDelete(player.id); setDeleteConfirmId(null); }} className="bg-rose-600 text-white px-6 py-2 rounded-xl font-black text-xs">DELETE</button>
                  <button onClick={() => setDeleteConfirmId(null)} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-black text-xs">CANCEL</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DETAIL MODAL (ZOOM FEATURE) */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 animate-in fade-in duration-300">
          <div className="max-w-4xl w-full glass-panel rounded-[4rem] p-10 md:p-16 border-emerald-500/20 relative shadow-[0_0_100px_rgba(16,185,129,0.1)]">
            <button onClick={() => { setSelectedPlayer(null); setIsZoomed(false); }} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all"><X className="w-10 h-10" /></button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative group cursor-zoom-in" onClick={() => setIsZoomed(!isZoomed)}>
                <div className={`overflow-hidden rounded-[3rem] border-4 border-emerald-500/20 shadow-2xl transition-all duration-1000 ${isZoomed ? 'scale-125 z-[100] ring-[100px] ring-black/80' : ''}`}>
                   {selectedPlayer.imageUrl ? <img src={selectedPlayer.imageUrl} className="w-full aspect-square object-cover" /> : <div className="w-full aspect-square bg-slate-900 flex items-center justify-center"><User className="w-32 h-32 text-slate-800" /></div>}
                </div>
                {!isZoomed && <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all rounded-[3rem] flex items-center justify-center"><Maximize2 className="text-white w-12 h-12 opacity-0 group-hover:opacity-100 transition-all" /></div>}
              </div>
              
              <div className="space-y-10">
                <div>
                  <h3 className="text-5xl md:text-6xl font-orbitron font-black text-white italic uppercase leading-none tracking-tighter">{selectedPlayer.name}</h3>
                  <div className={`inline-block mt-6 px-8 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border ${getRoleColor(selectedPlayer.role)} shadow-xl`}>{selectedPlayer.role}</div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center hover:border-emerald-500/20 transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">MATCHES</p>
                    <p className="text-4xl font-orbitron font-black text-white">{selectedPlayer.matchesPlayed || 0}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center hover:border-emerald-500/20 transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">TOTAL RUNS</p>
                    <p className="text-4xl font-orbitron font-black text-emerald-500">{selectedPlayer.totalRuns || 0}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center hover:border-emerald-500/20 transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">WICKETS</p>
                    <p className="text-4xl font-orbitron font-black text-rose-500">{selectedPlayer.totalWickets || 0}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-center hover:border-emerald-500/20 transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">H.S.</p>
                    <p className="text-4xl font-orbitron font-black text-amber-500">{selectedPlayer.highestScore || 0}</p>
                  </div>
                </div>

                <div className="p-8 bg-black/60 rounded-[3rem] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <span>GROUP / ROOM</span>
                    <span className="text-amber-500">{(selectedPlayer.groupName || 'POOL A') + (selectedPlayer.roomNo ? ` / RM ${selectedPlayer.roomNo}` : '')}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <span>VALUATION</span>
                    <span className="text-white font-orbitron">{formatPrice(selectedPlayer.status === PlayerStatus.SOLD ? selectedPlayer.currentPrice : selectedPlayer.basePrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <span>STATUS</span>
                    <span className={`font-orbitron font-black ${selectedPlayer.status === PlayerStatus.SOLD ? 'text-emerald-400' : 'text-slate-400'}`}>{selectedPlayer.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManager;
