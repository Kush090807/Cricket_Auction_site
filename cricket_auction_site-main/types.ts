
export enum PlayerRole {
  BATSMAN = 'Batsman',
  BOWLER = 'Bowler',
  ALL_ROUNDER = 'All-Rounder',
  WICKET_KEEPER = 'Wicket Keeper'
}

export enum PlayerStatus {
  UNSOLD = 'unsold',
  SOLD = 'sold',
  SKIPPED = 'skipped'
}

export enum UserRole {
  ADMIN = 'admin',
  TEAM = 'team',
  VIEWER = 'viewer'
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  basePrice: number; // in Lakhs
  currentPrice: number;
  status: PlayerStatus;
  teamId?: string;
  imageUrl?: string;
  roomNo?: string;
  groupName?: string;
  // Stats
  totalRuns?: number;
  totalWickets?: number;
  matchesPlayed?: number;
  highestScore?: number;
  bowlingStyle?: string; // e.g. 'Right-arm Fast', 'Leg Spin'
}

export interface Team {
  id: string;
  name: string;
  email?: string;
  owner?: string;
  captain?: string;
  viceCaptain?: string;
  totalBudget: number; // in Lakhs
  remainingBudget: number;
  logoUrl?: string;
}

export interface BatsmanScore {
  name: string;
  runs: number;
  balls: number;
}

export interface BidInfo {
  teamName: string;
  amount: number;
  timestamp: number;
  playerName?: string;
  playerPhoto?: string;
  playerId?: string;
  isPushed?: boolean;
}

export interface MatchScore {
  battingTeam: string;
  bowlingTeam: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  striker: BatsmanScore;
  nonStriker: BatsmanScore;
  bowler: {
    name: string;
    overs: number;
    runs: number;
    wickets: number;
  };
  isLive: boolean;
  target?: number;
  currentBid?: BidInfo;
  tossWinner?: string;
  // New Scoring Fields
  battingTeamId: string;
  bowlingTeamId: string;
  currentOver: BallEvent[];
  inningsHistory: OverSummary[];
  specialBallState: 'none' | 'golden' | 'magical' | 'golden-noball' | 'magical-noball'; // Track special states
  isFreeHit: boolean;
  requiredRuns?: number;

  // Detailed Player Stats for the Match
  batsmenStats: Record<string, BatsmanMatchStats>; // Key: PlayerID
  bowlerStats: Record<string, BowlerMatchStats>; // Key: PlayerID

  // Current Play State
  strikerId: string;
  nonStrikerId: string;
  currentBowlerId: string;
}

export interface BallEvent {
  ballNumber: number; // 1-6 normally, higher for extras
  runsScored: number;
  isWicket: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket';
  isExtra: boolean;
  extraType?: 'wide' | 'noball' | 'legbye' | 'bye';
  extraRuns: number; // Runs from the extra itself
  specialBall?: 'golden' | 'magical';
  batterName: string;
  bowlerName: string;
}

export interface OverSummary {
  overNumber: number;
  runsConceded: number;
  wicketsTaken: number;
  bowlerId: string;
  bowlerName: string;
  balls: BallEvent[];
}

export interface BatsmanMatchStats {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissalInfo?: string; // e.g., "b. BowlerName"
  strikeRate: number;
}

export interface BowlerMatchStats {
  playerId: string;
  name: string;
  overs: number; // e.g. 3.2
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  ballsBowled: number; // Total legal balls
}

export interface LeagueConfig {
  name: string;
  season: string;
  inviteCode: string;
}

export type TabType = 'dashboard' | 'players' | 'teams' | 'auction' | 'history' | 'match-center';
