const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyCbxTJkjBPnDHBWQluIsnuM1dzVo32LCF4",
  authDomain: "nike-store-website.firebaseapp.com",
  projectId: "nike-store-website",
  storageBucket: "nike-store-website.firebasestorage.app",
  messagingSenderId: "286062194545",
  appId: "1:286062194545:web:f1b6a0119224a4c85a90d0",
  measurementId: "G-N1C5KN5PED"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

module.exports = { auth };