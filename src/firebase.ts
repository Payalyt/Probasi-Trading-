import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD0pUzqVXSxAJ7yGNKUiAOIXmv2A7SLFP0",
  authDomain: "vo3-483404.firebaseapp.com",
  projectId: "vo3-483404",
  storageBucket: "vo3-483404.firebasestorage.app",
  messagingSenderId: "219915998978",
  appId: "1:219915998978:web:9fbdd91bb030b8f805541b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
