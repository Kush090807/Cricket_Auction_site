import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local BEFORE any other imports
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Now import everything else
import { collection, doc, setDoc } from 'firebase/firestore';
import { initialPlayers } from './players_data';

const cleanDataForFirestore = (data: any) => {
    return Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
    );
};

const seedDatabase = async () => {
    console.log('Starting migration...');

    try {
        // Dynamic import to ensure process.env is already populated by dotenv
        console.log('Importing firebase module...');
        const { db } = await import('./firebase');
        console.log('Firebase imported successfully.');

        console.log(`Initial players count: ${initialPlayers.length}`);

        for (const player of initialPlayers) {
            const { id, ...data } = player;
            console.log(`Migrating player (${initialPlayers.indexOf(player) + 1}/${initialPlayers.length}): ${player.name}`);
            await setDoc(doc(db, 'players', id), cleanDataForFirestore(data));
        }

        // Initial league config
        await setDoc(doc(db, 'settings', 'leagueConfig'), {
            name: 'PREMIER AUCTION',
            season: 'SQUAD SEASON 2026',
            inviteCode: 'CRICKET2026'
        });

        // Initial match score
        await setDoc(doc(db, 'live', 'matchScore'), {
            battingTeam: 'Batting Team',
            bowlingTeam: 'Bowling Team',
            runs: 0,
            wickets: 0,
            overs: 0,
            balls: 0,
            striker: { name: 'Batsman 1', runs: 0, balls: 0 },
            nonStriker: { name: 'Batsman 2', runs: 0, balls: 0 },
            bowler: { name: 'Bowler', overs: 0, runs: 0, wickets: 0 },
            isLive: false
        });

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

seedDatabase();
