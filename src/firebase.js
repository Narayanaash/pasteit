// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyApfNiGAGljpMuodH5FYIJzaPyVKSQVJy4',
  authDomain: 'pasteit-93020.firebaseapp.com',
  projectId: 'pasteit-93020',
  storageBucket: 'pasteit-93020.appspot.com',
  messagingSenderId: '707919477217',
  appId: '1:707919477217:web:7663e158dbd904ac4e7aa0',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;

export const db = getFirestore(app);
