
import { Player, PlayerRole, PlayerStatus, Team } from './types';

// Data is now managed entirely via Firebase Firestore
export const INITIAL_PLAYERS: Player[] = [];
export const INITIAL_TEAMS: Team[] = [];

export const formatPrice = (priceInLakhs: number) => {
  if (priceInLakhs >= 100) {
    const crores = priceInLakhs / 100;
    return `₹${crores.toFixed(2)} CR`;
  }
  if (priceInLakhs < 1 && priceInLakhs > 0) {
    return `₹${(priceInLakhs * 100).toFixed(0)} K`;
  }
  return `₹${priceInLakhs} L`;
};

export const getRoleColor = (role: PlayerRole) => {
  switch (role) {
    case PlayerRole.BATSMAN: return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case PlayerRole.BOWLER: return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
    case PlayerRole.ALL_ROUNDER: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    case PlayerRole.WICKET_KEEPER: return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
};
