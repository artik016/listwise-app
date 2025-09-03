
import {initializeApp, getApps, getApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: 'listwise-jb7be',
  appId: '1:1057325785023:web:477104b6822b743abd4b0a',
  storageBucket: 'listwise-jb7be.firebasestorage.app',
  apiKey: 'AIzaSyA-1dy_bKIiHNTeXTJf1OgoDC4NHjZ2yLg',
  authDomain: 'listwise-jb7be.firebaseapp.com',
  messagingSenderId: '1057325785023',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export {app, auth, db};
