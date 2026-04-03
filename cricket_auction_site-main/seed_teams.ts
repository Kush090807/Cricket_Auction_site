
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local BEFORE any other imports
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { collection, doc, setDoc } from 'firebase/firestore';

const teamsData = [
    { id: 'team_1', name: 'Akshar Royals', email: 'akshar@auction.com', owner: 'Owner 1', totalBudget: 250, remainingBudget: 250, logoUrl: '/teams/akshar-royals.jpeg' },
    { id: 'team_2', name: 'Bhulku Flights', email: 'bhulku@auction.com', owner: 'Owner 2', totalBudget: 250, remainingBudget: 250, logoUrl: '/teams/bhulku-flights.jpeg' },
    { id: 'team_3', name: 'Dazzling Das', email: 'dazzling@auction.com', owner: 'Owner 3', totalBudget: 250, remainingBudget: 250, logoUrl: '/teams/dazzling-das.jpeg' },
    { id: 'team_4', name: 'Ekantik Eagles', email: 'ekantik@auction.com', owner: 'Owner 4', totalBudget: 250, remainingBudget: 250, logoUrl: '/teams/ekantik-eagles.jpeg' },
    { id: 'team_5', name: 'Jagrat Lions', email: 'jagrat@auction.com', owner: 'Owner 5', totalBudget: 250, remainingBudget: 250, logoUrl: '/teams/jagrat-lions.jpeg' },
    { id: 'team_6', name: 'Nishchay Tigers', email: 'nishchay@auction.com', owner: 'Owner 6', totalBudget: 250, remainingBudget: 250, logoUrl: '/teams/nishchay-tigers.jpeg' },
    { id: 'team_7', name: 'Prabodham Titans', email: 'prabodham@auction.com', owner: 'Owner 7', totalBudget: 250, remainingBudget: 250, logoUrl: '/teams/prabodham-titans.jpeg' },
    { id: 'team_8', name: 'Samarpan Storm', email: 'samarpan@auction.com', owner: 'Owner 8', totalBudget: 250, remainingBudget: 250, logoUrl: '/teams/samarpan-storm.jpeg' },
    { id: 'team_9', name: 'Sarvam Spikers', email: 'sarvam@auction.com', owner: 'Owner 9', totalBudget: 250, remainingBudget: 250, logoUrl: '/teams/sarvam-spikers.jpeg' },
    { id: 'team_10', name: 'Satsangi Lions', email: 'satsangi@auction.com', owner: 'Owner 10', totalBudget: 250, remainingBudget: 250, logoUrl: '/teams/satsangi-lions.jpeg' },
];

const seedTeams = async () => {
    console.log('Starting team migration...');

    try {
        const { db } = await import('./firebase');

        for (const team of teamsData) {
            const { id, ...data } = team;
            console.log(`Migrating team: ${team.name}`);
            await setDoc(doc(db, 'teams', id), data);
        }

        console.log('Team migration completed successfully!');
    } catch (error) {
        console.error('Team migration failed:', error);
    }
};

seedTeams();
