
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function createTeamAccounts() {
    try {
        const { auth } = await import('./firebase');
        const { createUserWithEmailAndPassword } = await import('firebase/auth');

        const teams = [
            { name: 'Akshar Royals', email: 'akshar@auction.com', password: 'aksharroyals' },
            { name: 'Bhulku Flights', email: 'bhulku@auction.com', password: 'bhulkuflights' },
            { name: 'Dazzling Das', email: 'dazzling@auction.com', password: 'dazzlingdas' },
            { name: 'Ekantik Eagles', email: 'ekantik@auction.com', password: 'ekantikeagles' },
            { name: 'Jagrat Lions', email: 'jagrat@auction.com', password: 'jagratlions' },
            { name: 'Nishchay Tigers', email: 'nishchay@auction.com', password: 'nishchaytigers' },
            { name: 'Prabodham Titans', email: 'prabodham@auction.com', password: 'prabodhamtitans' },
            { name: 'Samarpan Storm', email: 'samarpan@auction.com', password: 'samarpanstorm' },
            { name: 'Sarvam Spikers', email: 'sarvam@auction.com', password: 'sarvamspikers' },
            { name: 'Satsangi Lions', email: 'satsangi@auction.com', password: 'satsangilions' },
        ];

        for (const team of teams) {
            try {
                console.log(`Creating account for ${team.name} (${team.email})...`);
                await createUserWithEmailAndPassword(auth, team.email, team.password);
                console.log(`Account created for ${team.name}!`);
            } catch (err: any) {
                if (err.code === 'auth/email-already-in-use') {
                    console.log(`Account for ${team.name} already exists.`);
                } else {
                    console.error(`Failed to create account for ${team.name}:`, err.message);
                }
            }
        }

        console.log('All team accounts processed.');

    } catch (error: any) {
        console.error('An error occurred:', error.message);
    }
}

createTeamAccounts();
