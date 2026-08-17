import { initializeApp } from "firebase/app";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize analytics conditionally to prevent errors if running in an environment without a window object
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
