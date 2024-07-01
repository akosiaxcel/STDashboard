import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlK9OlgWiDksSQXmrMMMRlFXWxivA5ud0",
  authDomain: "screening-test-760d6.firebaseapp.com",
  projectId: "screening-test-760d6",
  storageBucket: "screening-test-760d6.appspot.com",
  messagingSenderId: "851350631716",
  appId: "1:851350631716:web:4d56224f0466b598f1efb1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
