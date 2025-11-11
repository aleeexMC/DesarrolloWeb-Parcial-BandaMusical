import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAuATAQ7hQ87LvYnxZCZNSyJKtSxcwVp1E",
  authDomain: "webparcial-d4752.firebaseapp.com",
  projectId: "webparcial-d4752",
  storageBucket: "webparcial-d4752.firebasestorage.app",
  messagingSenderId: "368154441627",
  appId: "1:368154441627:web:dc960fc4227291f4a9933e",
  measurementId: "G-KXCVVTWMND"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

await setPersistence(auth, browserSessionPersistence);


export { browserLocalPersistence, browserSessionPersistence };