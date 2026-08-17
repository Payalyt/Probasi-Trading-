import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  projectId: "mythic-idea-56ppv",
  appId: "1:218811359782:web:92c71553e4d0d026007ce7",
  apiKey: "AIzaSyBeIcIPA5-PQP4sQV6lIo-sbAz3G0-F2CA",
  authDomain: "mythic-idea-56ppv.firebaseapp.com",
  storageBucket: "mythic-idea-56ppv.firebasestorage.app",
  messagingSenderId: "218811359782"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
