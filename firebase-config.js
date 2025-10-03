// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, push, set, get, remove, onValue } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIKD4lWXuvRPKfolDak8rgglhDeFxa5Z0",
  authDomain: "ff-tournamen.firebaseapp.com",
  databaseURL: "https://ff-tournamen-default-rtdb.firebaseio.com",
  projectId: "ff-tournamen",
  storageBucket: "ff-tournamen.firebasestorage.app",
  messagingSenderId: "756361610819",
  appId: "1:756361610819:web:05848eb4f01d24bc0276f6",
  measurementId: "G-8H6GCDFJ41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Export Firebase services for use in other modules
export { 
    database, 
    auth, 
    analytics, 
    ref, 
    push, 
    set, 
    get, 
    remove, 
    onValue, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail
};