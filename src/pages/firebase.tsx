import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, RecaptchaVerifier } from "firebase/auth"; // Add this import

const firebaseConfig = {
    apiKey: "AIzaSyC2mQgTFHLx_G44fW0CxDSDEedmN2h5s_Y",
    authDomain: "refined-sunup-438907-d2.firebaseapp.com",
    projectId: "refined-sunup-438907-d2",
    storageBucket: "refined-sunup-438907-d2.firebasestorage.app",
    messagingSenderId: "546875496782",
    appId: "1:546875496782:web:57f34077655e95730f261f",
    measurementId: "G-ZHKNCHC2EF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize authentication

export { db, auth, RecaptchaVerifier }; // Export both db and auth
