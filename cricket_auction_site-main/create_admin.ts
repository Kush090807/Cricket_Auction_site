
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function createAdminUser() {
    try {
        const { auth } = await import('./firebase');
        const { createUserWithEmailAndPassword } = await import('firebase/auth');

        const email = 'admin@auction.com';
        const password = 'admin123';

        console.log(`Attempting to create admin user: ${email}...`);

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Admin user created successfully!');
        console.log('User UID:', userCredential.user.uid);

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('Admin user already exists. You can now log in.');
        } else {
            console.error('Failed to create admin user:', error.message);
            console.log('Help: Ensure you have enabled Email/Password authentication in the Firebase Console.');
        }
    }
}

createAdminUser();
