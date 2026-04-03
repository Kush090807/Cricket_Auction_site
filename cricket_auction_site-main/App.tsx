
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutDashboard, Users, Shield, Gavel, History, Radio, Tv, LogOut, Trophy, Menu, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TabType, Player, Team, PlayerStatus, LeagueConfig, UserRole, MatchScore, BidInfo } from './types';
import { formatPrice } from './constants';
import Dashboard from './components/Dashboard';
import PlayerManager from './components/PlayerManager';
import TeamManager from './components/TeamManager';
import AuctionArena from './components/AuctionArena';
import SoldPlayers from './components/SoldPlayers';
import Login from './components/Login';
import MatchCenter from './components/MatchCenter';

// Firebase Imports
import { db, auth } from './firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'players', label: 'Pool', icon: Users },
  { id: 'teams', label: 'Teams', icon: Shield },
  { id: 'auction', label: 'Live Arena', icon: Gavel },
  { id: 'match-center', label: 'Live Feed', icon: Tv },
  { id: 'history', label: 'History', icon: History },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isWatchingLive, setIsWatchingLive] = useState(() => {
    return localStorage.getItem('cricket_stadium_joined') === 'true';
  });
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [matchScore, setMatchScore] = useState<MatchScore>({
    battingTeam: 'Batting Team',
    bowlingTeam: 'Bowling Team',
    battingTeamId: '',
    bowlingTeamId: '',
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    striker: { name: 'Batsman 1', runs: 0, balls: 0 },
    nonStriker: { name: 'Batsman 2', runs: 0, balls: 0 },
    bowler: { name: 'Bowler', overs: 0, runs: 0, wickets: 0 },
    isLive: false,
    currentOver: [],
    inningsHistory: [],
    specialBallState: 'none',
    isFreeHit: false,
    batsmenStats: {},
    bowlerStats: {},
    strikerId: '',
    nonStrikerId: '',
    currentBowlerId: ''
  });

  const [leagueConfig, setLeagueConfig] = useState<LeagueConfig>({
    name: 'PREMIER AUCTION',
    season: 'SQUAD SEASON 2025',
    inviteCode: 'CRICKET2025'
  });

  const [celebration, setCelebration] = useState<{ player: Player; team: Team; timestamp: number } | null>(null);
  const lastCelebrationTime = useRef<number>(0);
  const bidHistoryStack = useRef<MatchScore[]>([]);

  const fireCrackers = useCallback(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 20000 };
    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  const triggerSaleCelebration = useCallback((player: Player, team: Team, ts: number) => {
    if (ts <= lastCelebrationTime.current) return;
    lastCelebrationTime.current = ts;
    setCelebration({ player, team, timestamp: ts });
    fireCrackers();

    // Auto-dismiss celebration after 10 seconds
    setTimeout(() => {
      setCelebration(current => current?.timestamp === ts ? null : current);
    }, 10000);
  }, [fireCrackers]);

  // Recursive utility to clean undefined values and nested objects for Firestore
  const cleanDataForFirestore = (data: any): any => {
    if (data === null || data === undefined) return null;
    if (Array.isArray(data)) return data.map(cleanDataForFirestore);
    if (typeof data === 'object') {
      return Object.fromEntries(
        Object.entries(data)
          .map(([k, v]) => [k, cleanDataForFirestore(v)])
          .filter(([_, v]) => v !== undefined)
      );
    }
    return data;
  };

  // FIREBASE REAL-TIME SYNC
  useEffect(() => {
    const unsubPlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
      setPlayers(playersData);
    }, (err) => console.error('SNAPSHOT ERROR (players):', err));

    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      setTeams(teamsData);
    }, (err) => console.error('SNAPSHOT ERROR (teams):', err));

    const unsubConfig = onSnapshot(doc(db, 'settings', 'leagueConfig'), (doc) => {
      if (doc.exists()) {
        setLeagueConfig(doc.data() as LeagueConfig);
      }
    }, (err) => console.error('SNAPSHOT ERROR (config):', err));

    const unsubScore = onSnapshot(doc(db, 'live', 'matchScore'), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as any;
        console.log('SYNC UPDATE: Received Live Match Score:', data.currentBid?.playerName, 'at', data.currentBid?.amount);
        setMatchScore(data);
        if (data.lastSale && data.lastSale.timestamp > lastCelebrationTime.current) {
          triggerSaleCelebration(data.lastSale.player, data.lastSale.team, data.lastSale.timestamp);
        }
        // Force clear celebration if a new player is being auctioned
        if (data.currentBid && data.currentBid.playerName && data.currentBid.playerName !== '') {
          setCelebration(null);
        }
      }
    }, (err) => console.error('SNAPSHOT ERROR (score):', err));

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email === 'admin@auction.com') {
          setUserRole(UserRole.ADMIN);
          localStorage.setItem('cricket_user_role', UserRole.ADMIN);
        } else if (user.email && user.email.endsWith('@auction.com')) {
          setUserRole(UserRole.TEAM);
          localStorage.setItem('cricket_user_role', UserRole.TEAM);
        } else {
          setUserRole(null);
          localStorage.removeItem('cricket_user_role');
        }
      } else {
        const storedRole = localStorage.getItem('cricket_user_role');
        if (storedRole === UserRole.VIEWER) {
          setUserRole(UserRole.VIEWER);
          setActiveTab('auction');
        } else {
          setUserRole(null);
        }
      }
      setIsLoaded(true);
    });

    return () => {
      unsubPlayers();
      unsubTeams();
      unsubConfig();
      unsubScore();
      unsubAuth();
    };
  }, [triggerSaleCelebration]);

  // Robust Team Identification Effect
  useEffect(() => {
    if (userRole === UserRole.TEAM && auth.currentUser) {
      const matchingTeam = teams.find(t => t.email === auth.currentUser?.email);
      if (matchingTeam) {
        console.log('IDENTIFIED TEAM:', matchingTeam.name, matchingTeam.id);
        setCurrentTeamId(matchingTeam.id);
      }
    } else if (userRole !== UserRole.TEAM) {
      setCurrentTeamId(null);
    }
  }, [teams, userRole]);

  const handleUpdateConfig = async (newConfig: LeagueConfig) => {
    if (userRole !== UserRole.ADMIN) return;
    await setDoc(doc(db, 'settings', 'leagueConfig'), cleanDataForFirestore(newConfig));
  };

  const handleMatchFinalize = async (finalScore: MatchScore) => {
    if (userRole !== UserRole.ADMIN) return;

    // 1. Update Player Stats in DB
    const batch = writeBatch(db);

    // Update Batsmen
    Object.values(finalScore.batsmenStats).forEach(stat => {
      if (stat.playerId) {
        const playerRef = doc(db, 'players', stat.playerId);
        // We need to increment existing stats. 
        // Since we don't have existing stats in 'stat' object (only match stats), 
        // we rely on Firestore increment, OR we need to trust that we have the latest player object?
        // Safer to use increment from firebase/firestore
        // But wait, I didn't import 'increment'. 
        // I'll just use the player data I have in state 'players' + match stats.
        const p = players.find(pl => pl.id === stat.playerId);
        if (p) {
          batch.update(playerRef, {
            totalRuns: (p.totalRuns || 0) + stat.runs,
            ballsFaced: (p.ballsFaced || 0) + stat.balls,
            matchesPlayed: (p.matchesPlayed || 0) + 1,
            highScore: Math.max(p.highScore || 0, stat.runs) // Simple High Score update
          });
        }
      }
    });

    // Update Bowlers
    Object.values(finalScore.bowlerStats).forEach(stat => {
      if (stat.playerId) {
        const playerRef = doc(db, 'players', stat.playerId);
        const p = players.find(pl => pl.id === stat.playerId);
        if (p) {
          batch.update(playerRef, {
            wickets: (p.wickets || 0) + stat.wickets,
            oversBowled: (p.oversBowled || 0) + stat.overs,
            runsConceded: (p.runsConceded || 0) + stat.runs
            // matchesPlayed aleady handled if they batted? 
            // Need to check if they batted to avoid double counting matches.
            // Actually, simpler: just increment matchesPlayed for everyone in the team? 
            // No, only those who played. 
            // I will check if they are already in batsmenStats.
          });

          // If not in batsmen stats, increment matches played here
          if (!finalScore.batsmenStats[stat.playerId]) {
            batch.update(playerRef, { matchesPlayed: (p.matchesPlayed || 0) + 1 });
          }
        }
      }
    });

    try {
      await batch.commit();
      console.log('STATS UPDATED SUCCESSFULLY');
      alert('Match Ended! Player stats have been updated in the pool.');
    } catch (err) {
      console.error('FAILED TO UPDATE STATS:', err);
      alert('Error updating stats. Check console.');
    }

    // Reset Score
    const resetScore: MatchScore = {
      battingTeam: 'Batting Team',
      bowlingTeam: 'Bowling Team',
      battingTeamId: '',
      bowlingTeamId: '',
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      striker: { name: 'Batsman 1', runs: 0, balls: 0 },
      nonStriker: { name: 'Batsman 2', runs: 0, balls: 0 },
      bowler: { name: 'Bowler', overs: 0, runs: 0, wickets: 0 },
      isLive: false,
      currentOver: [],
      inningsHistory: [],
      specialBallState: 'none',
      isFreeHit: false,
      batsmenStats: {},
      bowlerStats: {},
      strikerId: '',
      nonStrikerId: '',
      currentBowlerId: ''
    };

    // We also need to preserve the Bid info!
    resetScore.currentBid = finalScore.currentBid;

    handleUpdateScore(resetScore);

    // Also push reset to DB
    setDoc(doc(db, 'live', 'matchScore'), cleanDataForFirestore(resetScore));
  };

  const handleUpdateScore = async (newScore: MatchScore) => {
    // Only update local state for Admin to allow 'Drafting' before Push
    if (userRole === UserRole.ADMIN) {
      setMatchScore(newScore);
    }
    // Note: We don't write to Firestore here anymore. 
    // Data is only pushed globally when handlePushToBroadcast is called.
  };

  const handlePlaceBid = async (bid: BidInfo) => {
    // Determine if user is allowed to bid (Admin or Team)
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.TEAM) return;

    // Push current state to stack before updating (for Undo)
    // We only stack if there's a meaningful change (e.g. not just a timestamp tick)
    const currentState = JSON.parse(JSON.stringify(matchScore));
    bidHistoryStack.current.push(currentState);
    // Limit stack depth to 50 to prevent memory issues
    if (bidHistoryStack.current.length > 50) bidHistoryStack.current.shift();

    const newScore = {
      ...matchScore,
      currentBid: { ...bid, isPushed: true },
      lastSale: null
    };

    // Optimistic Local Update
    setMatchScore(newScore);

    console.log('AUTO-PUSHING BID:', bid);

    try {
      const cleanUpdate = cleanDataForFirestore(newScore);
      await setDoc(doc(db, 'live', 'matchScore'), cleanUpdate);

      // Update player document as well to keep it in sync
      if (bid.playerId) {
        const playerRef = doc(db, 'players', bid.playerId);
        await updateDoc(playerRef, {
          currentBid: cleanUpdate.currentBid,
          currentPrice: bid.amount
        });
      }
    } catch (err) {
      console.error('AUTO-PUSH FAILED:', err);
    }
  };

  const handleUndoBid = async () => {
    if (userRole !== UserRole.ADMIN) return; // Only Admin can undo for now to avoid conflicts
    if (bidHistoryStack.current.length === 0) return;

    const previousScore = bidHistoryStack.current.pop();
    if (!previousScore) return;

    console.log('UNDOING LAST ACTION, REVERTING TO:', previousScore);
    setMatchScore(previousScore);

    try {
      const cleanPrev = cleanDataForFirestore(previousScore);
      await setDoc(doc(db, 'live', 'matchScore'), cleanPrev);

      // Revert player doc if possible. 
      // Note: This is a bit tricky if the player changed, but generally safe for sequential undo.
      if (previousScore.currentBid && previousScore.currentBid.playerId) {
        const playerRef = doc(db, 'players', previousScore.currentBid.playerId);
        await updateDoc(playerRef, {
          currentBid: cleanPrev.currentBid,
          currentPrice: previousScore.currentBid.amount
        });
      } else if (matchScore.currentBid && matchScore.currentBid.playerId) {
        // If we are undoing TO a state with no bid, we should clear the current player's bid?
        // Or if the player ID changed, we might need to clear the *current* player's bid.
        // For simplistic Undo, we just revert the matchScore and let the Arena UI handle the display.
        // But sticking to the rule: "Revert one step".
        // Ideally we should revert the player doc of the *currently displayed* player to the previous price.
        const playerRef = doc(db, 'players', matchScore.currentBid.playerId);
        // Check if previous score had this player
        if (previousScore.currentBid?.playerId === matchScore.currentBid.playerId) {
          await updateDoc(playerRef, {
            currentBid: cleanPrev.currentBid,
            currentPrice: previousScore.currentBid?.amount || 0 // Revert to previous amount
          });
        }
      }

    } catch (err) {
      console.error('UNDO FAILED:', err);
    }
  };

  const handlePushToBroadcast = async (customCelebration?: { player: Player; team: Team }) => {
    if (userRole !== UserRole.ADMIN) return;

    // Use the latest matchScore from state
    const update: any = { ...matchScore };

    if (customCelebration) {
      update.lastSale = { ...customCelebration, timestamp: Date.now() };
      update.currentBid = {
        teamName: 'No Bids Yet',
        amount: 0,
        timestamp: Date.now(),
        playerName: '',
        playerPhoto: '',
        playerId: ''
      };

      // Clear history stack on sale
      bidHistoryStack.current = [];
    } else {
      update.lastSale = null;
      if (update.currentBid) {
        update.currentBid = { ...update.currentBid, isPushed: true };
      }
    }

    console.log('PUSHING BROADCAST UPDATE:', update);

    try {
      const cleanUpdate = cleanDataForFirestore(update);
      await setDoc(doc(db, 'live', 'matchScore'), cleanUpdate);
      console.log('BROADCAST PUSH SUCCESSFUL');

      // Also persist bid to player document if we have a current bid
      if (update.currentBid && update.currentBid.playerId) {
        const playerRef = doc(db, 'players', update.currentBid.playerId);
        await updateDoc(playerRef, {
          currentBid: cleanUpdate.currentBid,
          currentPrice: update.currentBid.amount
        });
      }
    } catch (err) {
      console.error('BROADCAST PUSH FAILED:', err);
    }
  };

  const handleAddPlayer = async (p: Player) => {
    if (userRole !== UserRole.ADMIN) return;
    const { id, ...data } = p;
    try {
      await setDoc(doc(db, 'players', id), cleanDataForFirestore(data));
    } catch (error: any) {
      console.error("Error adding player:", error);
      alert(`Failed to add player: ${error.message}`);
    }
  };

  const handleUpdatePlayer = async (p: Player) => {
    if (userRole !== UserRole.ADMIN) return;
    const { id, ...data } = p;
    try {
      await updateDoc(doc(db, 'players', id), cleanDataForFirestore(data));
    } catch (error: any) {
      console.error("Error updating player:", error);
      alert(`Failed to update player: ${error.message}. If uploading an image, ensure it is < 1MB.`);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (userRole !== UserRole.ADMIN) return;
    await deleteDoc(doc(db, 'players', id));
  };

  const handleAddTeam = async (t: Team) => {
    if (userRole !== UserRole.ADMIN) return;
    const { id, ...data } = t;
    await setDoc(doc(db, 'teams', id), cleanDataForFirestore(data));
  };

  const handleUpdateTeam = async (t: Team) => {
    if (userRole !== UserRole.ADMIN) return;
    const { id, ...data } = t;
    await updateDoc(doc(db, 'teams', id), cleanDataForFirestore(data));
  };

  const handleDeleteTeam = async (id: string) => {
    if (userRole !== UserRole.ADMIN) return;
    await deleteDoc(doc(db, 'teams', id));
  };

  const handleResetDatabase = async () => {
    if (userRole !== UserRole.ADMIN) return;
    if (!window.confirm('🚨 EMERGENCY RESET: Are you sure you want to revert EVERYTHING to initial state? This will clear all sold players and reset all budgets.')) return;

    try {
      const batch = writeBatch(db);

      // Reset Players
      players.forEach(p => {
        batch.update(doc(db, 'players', p.id), {
          status: PlayerStatus.UNSOLD,
          currentPrice: p.basePrice || 0.5,
          teamId: null,
          currentBid: null
        });
      });

      // Reset Teams
      teams.forEach(t => {
        batch.update(doc(db, 'teams', t.id), {
          remainingBudget: t.totalBudget
        });
      });

      // Reset Score
      batch.set(doc(db, 'live', 'matchScore'), {
        battingTeam: 'Batting Team',
        bowlingTeam: 'Bowling Team',
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        striker: { name: 'Batsman 1', runs: 0, balls: 0 },
        nonStriker: { name: 'Batsman 2', runs: 0, balls: 0 },
        bowler: { name: 'Bowler', overs: 0, runs: 0, wickets: 0 },
        isLive: false,
        currentBid: {
          teamName: 'No Bids Yet',
          amount: 0,
          timestamp: Date.now(),
          playerName: '',
          playerPhoto: '',
          playerId: ''
        }
      });

      await batch.commit();
      setCelebration(null);
      alert('✅ SYSTEM RESET SUCCESSFUL - Back to starting blocks!');
    } catch (err) {
      console.error('RESET ERROR:', err);
      alert('❌ Reset failed. Check console for details.');
    }
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('cricket_user_role', role);
    if (role === UserRole.VIEWER) setActiveTab('auction');
    if (role === UserRole.TEAM) setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    if (userRole === UserRole.ADMIN || userRole === UserRole.TEAM) {
      await signOut(auth);
    }
    localStorage.removeItem('cricket_user_role');
    localStorage.removeItem('cricket_stadium_joined');
    setUserRole(null);
    setIsWatchingLive(false);
    setCelebration(null);
    setActiveTab('dashboard');
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#040d0a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!userRole) return <Login onLogin={handleLogin} config={leagueConfig} />;

  const filteredNavItems = navItems.filter(item => {
    if (userRole === UserRole.ADMIN) return true;
    if (userRole === UserRole.TEAM) {
      return ['dashboard', 'players', 'auction', 'history'].includes(item.id);
    }
    if (userRole === UserRole.VIEWER) {
      return ['teams', 'auction', 'history'].includes(item.id);
    }
    return false;
  });

  return (
    <div className="flex min-h-screen text-slate-200 overflow-hidden relative">
      {celebration && (
        <div onClick={() => setCelebration(null)} className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-6 animate-in fade-in zoom-in cursor-pointer">
          <div className="max-w-4xl w-full glass-panel rounded-[4rem] p-16 text-center border-emerald-500/50 shadow-[0_0_100px_rgba(16,185,129,0.3)] pointer-events-none">
            <h2 className="text-8xl md:text-9xl font-orbitron font-black text-white italic mb-12 animate-pulse tracking-tighter uppercase leading-none italic">Sold!</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 mb-12">
              <div className="text-center">
                <div className="w-40 h-40 md:w-52 md:h-52 rounded-full border-4 border-emerald-500 overflow-hidden mx-auto mb-4 bg-slate-900 shadow-2xl">
                  {celebration.player.imageUrl ? <img src={celebration.player.imageUrl} className="w-full h-full object-cover" /> : <Users className="w-16 h-16 m-auto mt-14 text-slate-700" />}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold uppercase text-white italic">{celebration.player.name}</h3>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] border-4 border-blue-500 flex items-center justify-center mx-auto mb-4 overflow-hidden bg-slate-900 shadow-2xl">
                  {celebration.team.logoUrl ? <img src={celebration.team.logoUrl} className="w-full h-full object-cover" /> : <Shield className="w-16 h-16 text-blue-500" />}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold uppercase text-blue-400 italic">{celebration.team.name}</h3>
              </div>
            </div>
            <div className="inline-block bg-white text-black px-12 py-6 md:px-16 md:py-8 rounded-full font-orbitron font-black text-5xl md:text-7xl shadow-[0_20px_60px_rgba(255,255,255,0.2)]">
              {formatPrice(celebration.player.currentPrice)}
            </div>
            <p className="text-slate-500 mt-12 uppercase font-black text-[10px] tracking-[0.5em] animate-bounce">Awaiting next nomination</p>
          </div>
        </div>
      )}

      {userRole === UserRole.VIEWER && !isWatchingLive ? (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#040d0a]">
          <div className="glass-panel p-16 rounded-[5rem] text-center space-y-12 max-w-2xl w-full border-emerald-500/20 shadow-3xl">
            <Trophy className="w-24 h-24 text-emerald-500 mx-auto animate-bounce" />
            <div className="space-y-4">
              <h1 className="text-6xl font-orbitron font-black text-white uppercase italic tracking-tighter leading-none">{leagueConfig.name}</h1>
              <p className="text-emerald-500 font-black text-xs tracking-[0.6em] uppercase flex items-center justify-center gap-3">
                <Radio className="w-5 h-5 animate-pulse" /> Live Stadium Feed
              </p>
            </div>
            <button onClick={() => {
              setIsWatchingLive(true);
              localStorage.setItem('cricket_stadium_joined', 'true');
              setActiveTab('auction');
            }} className="bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron font-black px-16 py-8 rounded-full shadow-2xl transition-all active:scale-95 text-3xl uppercase tracking-tighter italic">
              Join Stadium
            </button>
          </div>
        </div>
      ) : (
        <>
          <aside className={`fixed inset-y-0 left-0 w-80 border-r border-white/5 bg-black/80 backdrop-blur-2xl flex flex-col z-[100] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-orbitron font-black text-sm text-white uppercase tracking-wider leading-tight">{leagueConfig.name}</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors group lg:hidden">
                <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
              </button>
            </div>

            <nav className="flex-1 px-6 space-y-3 mt-4">
              {filteredNavItems.map((item) => (
                <button key={item.id} onClick={() => {
                  setActiveTab(item.id as TabType);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)]' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
                  {activeTab === item.id && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                  <item.icon className={`w-5 h-5 relative z-10 ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`} />
                  <span className="text-xs font-black uppercase tracking-[0.15em] relative z-10">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-8 border-t border-white/5 relative">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <button onClick={handleLogout} className="w-full py-4 text-[10px] font-black text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all border border-white/5 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest group">
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> DISCONNECT
              </button>
            </div>
          </aside>

          {/* BACKGROUND OVERLAY TO CLOSE SIDEBAR */}
          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-[95] animate-in fade-in duration-300"
            />
          )}

          <main className="flex-1 overflow-y-auto p-4 md:p-12 relative">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed top-6 left-6 z-[90] p-4 bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 animate-in fade-in zoom-in duration-300 border border-emerald-400/20"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <div className={`max-w-7xl mx-auto transition-all duration-300 w-full`}>
              {activeTab === 'dashboard' && (
                <Dashboard
                  players={players}
                  teams={teams}
                  config={leagueConfig}
                  userRole={userRole!}
                  onUpdateConfig={handleUpdateConfig}
                  onNavigate={setActiveTab}
                  currentTeamId={currentTeamId}
                  currentBid={matchScore.currentBid}
                  onResetDatabase={handleResetDatabase}
                />
              )}
              {activeTab === 'players' && <PlayerManager players={players} teams={teams} userRole={userRole!} onAdd={handleAddPlayer} onUpdate={handleUpdatePlayer} onDelete={handleDeletePlayer} />}
              {activeTab === 'teams' && <TeamManager teams={teams} players={players} userRole={userRole!} onAdd={handleAddTeam} onUpdate={handleUpdateTeam} onDelete={handleDeleteTeam} />}
              {activeTab === 'auction' && (
                <AuctionArena
                  players={players}
                  teams={teams}
                  userRole={userRole!}
                  currentTeamId={currentTeamId}
                  onUpdatePlayer={handleUpdatePlayer}
                  onUpdateTeam={handleUpdateTeam}
                  onSaleCelebration={(p, t) => {
                    handlePushToBroadcast({ player: p, team: t });
                  }}
                  isCelebrationActive={!!celebration}
                  currentBid={matchScore.currentBid}
                  onBidUpdate={bid => {
                    handleUpdateScore({ ...matchScore, currentBid: bid });
                  }}
                  onBroadcastBid={() => {
                    handlePushToBroadcast();
                  }}
                  onPlaceBid={handlePlaceBid}
                  onUndoBid={handleUndoBid}
                />
              )}
              {activeTab === 'history' && <SoldPlayers players={players} teams={teams} />}
              {activeTab === 'match-center' && <MatchCenter score={matchScore} onUpdate={handleUpdateScore} onMatchFinalize={handleMatchFinalize} userRole={userRole!} teams={teams} players={players} />}
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default App;
