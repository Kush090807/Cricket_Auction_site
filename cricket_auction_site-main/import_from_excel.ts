
import XLSX from 'xlsx';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function importPlayers() {
    console.log('Starting Excel Import...');

    try {
        const filePath = resolve('d:/cricket-auction-3/files/HSH Cricket Tournament 2026 (Responses).xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet) as any[];

        const fs = await import('fs');
        const path = await import('path');
        const imageDir = resolve('d:/cricket-auction-3/public/images');
        const imageFiles = fs.readdirSync(imageDir);

        const { db, auth } = await import('./firebase');
        const { doc, setDoc } = await import('firebase/firestore');
        const { createUserWithEmailAndPassword } = await import('firebase/auth');

        console.log(`Processing ${data.length} players...`);

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const fullName = row['Full Name'] || `Player ${i + 1}`;
            const normalizedName = fullName.replace(/\s+/g, '.').toUpperCase();
            const email = `${normalizedName}@player.auction.com`;
            const password = fullName; // Name and password same as requested
            const id = `player_${i + 1}`;

            // Find matching image
            const matchingImage = imageFiles.find(file => {
                const fileName = file.toLowerCase();
                const searchName = fullName.toLowerCase().trim();
                return fileName.includes(searchName);
            });

            const imageUrl = matchingImage ? `/images/${matchingImage}` : '';

            // Map Excel columns to Player object
            const player = {
                id: id,
                name: fullName,
                role: row['Role'] || 'Batsman',
                basePrice: 10,
                currentPrice: 10,
                status: 'unsold',
                roomNo: row['Hostel Room Number'] || '',
                groupName: row['Group Name (Standard)'] || '',
                tshirtSize: row['T-Shirt Size'] || '',
                imageUrl: imageUrl
            };

            console.log(`[${i + 1}/${data.length}] Importing: ${fullName}`);

            // 1. Upload to Firestore
            try {
                await setDoc(doc(db, 'players', id), player);
            } catch (fsErr: any) {
                console.error(`- Firestore failed for ${fullName}:`, fsErr.message);
            }

            // 2. Create Auth Account
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                console.log(`- Auth account created: ${email}`);
            } catch (authErr: any) {
                if (authErr.code === 'auth/email-already-in-use') {
                    // console.log(`- Auth account already exists for ${fullName}`);
                } else {
                    console.error(`- Auth failed for ${fullName}:`, authErr.message);
                }
            }
        }

        // Seed Teams too if they are missing
        const teams = [
            { id: 'team_1', name: 'Mumbai Titans', totalBudget: 250, remainingBudget: 250 },
            { id: 'team_2', name: 'Chennai Royals', totalBudget: 250, remainingBudget: 250 },
            { id: 'team_3', name: 'Bangalore Blasters', totalBudget: 250, remainingBudget: 250 },
            { id: 'team_4', name: 'Gujarat Giants', totalBudget: 250, remainingBudget: 250 },
            { id: 'team_5', name: 'Delhi Warriors', totalBudget: 250, remainingBudget: 250 },
            { id: 'team_6', name: 'Kolkata Kings', totalBudget: 250, remainingBudget: 250 },
            { id: 'team_7', name: 'Rajasthan Rangers', totalBudget: 250, remainingBudget: 250 },
            { id: 'team_8', name: 'Hyderabad Heroes', totalBudget: 250, remainingBudget: 250 },
            { id: 'team_9', name: 'Punjab Panthers', totalBudget: 250, remainingBudget: 250 },
            { id: 'team_10', name: 'Lucknow Legends', totalBudget: 250, remainingBudget: 250 },
        ];

        for (const team of teams) {
            await setDoc(doc(db, 'teams', team.id), team);
        }

        console.log('Import completed!');
    } catch (error: any) {
        console.error('Import failed:', error.message);
        console.log('Note: If you get "insufficient permissions", update your Firestore Rules to allow read/write.');
    }
}

importPlayers();
