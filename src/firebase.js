import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCyt6X6-s2SXp_XWkIbHxEdCGhDFJt4sF4",
  authDomain: "mirsan-quiz.firebaseapp.com",
  databaseURL: "https://mirsan-quiz-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mirsan-quiz",
  storageBucket: "mirsan-quiz.firebasestorage.app",
  messagingSenderId: "581748605996",
  appId: "1:581748605996:web:a37b5bab589dc38d3c3d89",
  measurementId: "G-KRL965KSBS"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app); 