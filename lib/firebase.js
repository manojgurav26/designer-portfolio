import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDtN3Gj9-KKLGc3kN0ARuBxbDaTXjmVMY0",
  authDomain: "designer-portfolio-b027a.firebaseapp.com",
  projectId: "designer-portfolio-b027a",
  storageBucket: "designer-portfolio-b027a.firebasestorage.app",
  messagingSenderId: "893337149966",
  appId: "1:893337149966:web:ddfb589a5ebbc36d0f125f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
