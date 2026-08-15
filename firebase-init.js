// ==============================================================================
// SHARED FIREBASE INITIALIZATION (compat SDK) — used by index.html / app.js / admin.js
// ==============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyC_hjdAHD11DPLXGC-wC1sltAAlunrG1XE",
  authDomain: "ls-tuition.firebaseapp.com",
  projectId: "ls-tuition",
  storageBucket: "ls-tuition.firebasestorage.app",
  messagingSenderId: "436382812973",
  appId: "1:436382812973:web:1539769f23e03f22cca1a4",
  measurementId: "G-NVXR2KJ5F8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
window.db = db;
