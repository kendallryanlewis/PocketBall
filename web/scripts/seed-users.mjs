/**
 * Seed dummy users into Firestore `profiles/` collection for testing friend search.
 *
 * SETUP (one-time):
 *   1. Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Save the downloaded JSON as: web/scripts/service-account.json
 *   3. Run: node scripts/seed-users.mjs
 *
 * The Admin SDK bypasses Firestore security rules, so no auth is needed.
 */

import { createRequire } from 'module';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const KEY_PATH = resolve(__dirname, 'service-account.json');
if (!existsSync(KEY_PATH)) {
    console.error('❌  Missing service-account.json');
    console.error('   Firebase Console → Project Settings → Service Accounts → Generate new private key');
    console.error(`   Save to: ${KEY_PATH}`);
    process.exit(1);
}

const admin = require('firebase-admin');
const serviceAccount = require(KEY_PATH);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'pocketball-9e9f3',
});

const db = admin.firestore();
const { FieldValue } = admin.firestore;

function friendCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const USERS = [
    {
        userId: 'seed_user_001',
        displayName: 'Tiger Woods',
        displayNameSearch: 'tiger woods',
        username: 'tiger_woods',
        email: 'tiger@carnivore.golf',
        friendCode: friendCode(),
        clubs: [],
        updatedAt: Date.now(),
    },
    {
        userId: 'seed_user_002',
        displayName: 'Rory McIlroy',
        displayNameSearch: 'rory mcilroy',
        username: 'rory_mcilroy',
        email: 'rory@carnivore.golf',
        friendCode: friendCode(),
        clubs: [],
        updatedAt: Date.now(),
    },
    {
        userId: 'seed_user_003',
        displayName: 'Scottie Scheffler',
        displayNameSearch: 'scottie scheffler',
        username: 'scottie_s',
        email: 'scottie@carnivore.golf',
        friendCode: friendCode(),
        clubs: [],
        updatedAt: Date.now(),
    },
    {
        userId: 'seed_user_004',
        displayName: 'Jon Rahm',
        displayNameSearch: 'jon rahm',
        username: 'jon_rahm',
        email: 'jon@carnivore.golf',
        friendCode: friendCode(),
        clubs: [],
        updatedAt: Date.now(),
    },
    {
        userId: 'seed_user_005',
        displayName: 'Jordan Spieth',
        displayNameSearch: 'jordan spieth',
        username: 'jordan_spieth',
        email: 'jordan@carnivore.golf',
        friendCode: friendCode(),
        clubs: [],
        updatedAt: Date.now(),
    },
    {
        userId: 'seed_user_006',
        displayName: 'Justin Thomas',
        displayNameSearch: 'justin thomas',
        username: 'jt_golf',
        email: 'justin@carnivore.golf',
        friendCode: friendCode(),
        clubs: [],
        updatedAt: Date.now(),
    },
    {
        userId: 'seed_user_007',
        displayName: 'Collin Morikawa',
        displayNameSearch: 'collin morikawa',
        username: 'collin_m',
        email: 'collin@carnivore.golf',
        friendCode: friendCode(),
        clubs: [],
        updatedAt: Date.now(),
    },
    {
        userId: 'seed_user_008',
        displayName: 'Xander Schauffele',
        displayNameSearch: 'xander schauffele',
        username: 'xander_golf',
        email: 'xander@carnivore.golf',
        friendCode: friendCode(),
        clubs: [],
        updatedAt: Date.now(),
    },
];

let ok = 0;
let fail = 0;

for (const user of USERS) {
    try {
        await db.collection('profiles').doc(user.userId).set(user, { merge: true });
        console.log(`✔  ${user.displayName} (${user.email})`);
        ok++;
    } catch (e) {
        console.error(`✘  ${user.displayName}: ${e.message}`);
        fail++;
    }
}

console.log(`\nDone — ${ok} seeded, ${fail} failed.`);
process.exit(fail > 0 ? 1 : 0);
