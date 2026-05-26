import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

let _db: Firestore | null = null;

/**
 * Firebase project: pocketball-9e9f3
 * Matches the iOS GoogleService-Info.plist.
 *
 * To get your web appId or confirm these values:
 * Firebase Console → Project Settings → Your apps
 * https://console.firebase.google.com/project/pocketball-9e9f3/settings/general
 */
export const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyDnegcSU2TdbCdyhJDwI61eQImxcutjR0M',
    authDomain: 'pocketball-9e9f3.firebaseapp.com',
    projectId: 'pocketball-9e9f3',
    storageBucket: 'pocketball-9e9f3.firebasestorage.app',
    messagingSenderId: '986064036080',
};

/** Returns the singleton FirebaseApp, initializing it if needed. */
export function getFirebaseApp(): FirebaseApp {
    return getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
}

/** Returns the singleton Firestore instance for pocketball-9e9f3. */
export function getFirestoreDb(): Firestore {
    if (!_db) _db = getFirestore(getFirebaseApp());
    return _db;
}
