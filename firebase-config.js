// إعدادات مشروع Firebase الخاص بمتجر Nona Store
const firebaseConfig = {
  apiKey: "AIzaSyDE5OVBAzB1TSrOC3P3Sjln0GsDe35DkEY",
  authDomain: "nonastor-60dc7.firebaseapp.com",
  projectId: "nonastor-60dc7",
  storageBucket: "nonastor-60dc7.firebasestorage.app",
  messagingSenderId: "438461824671",
  appId: "1:438461824671:web:dfcd08c1daf0668f226caa",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
