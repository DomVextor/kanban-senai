import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXJzIGpYxaolTpNaTFPy3POmJo8Q5lp8Q",
  authDomain: "kanban-senai.firebaseapp.com",
  projectId: "kanban-senai",
  storageBucket: "kanban-senai.firebasestorage.app",
  messagingSenderId: "464146256963",
  appId: "1:464146256963:web:aba298a55ddac9238c70f6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
