import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDKr1ozSBxaXBSMDL0p2l5bv3O-m95tCH8",
  authDomain: "probasi-trding.firebaseapp.com",
  projectId: "probasi-trding",
  storageBucket: "probasi-trding.firebasestorage.app",
  messagingSenderId: "1055553976324",
  appId: "1:1055553976324:web:8ab8a4eb3739b837b39d51",
  measurementId: "G-CK3XER9FZY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
