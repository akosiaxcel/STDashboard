// index.js
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Dashboard from "./Dashboard";
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (user) {
    return <Dashboard />;
  }

  if (showSignUp) {
    return <SignUp />;
  }

  return <SignIn onSignUpClick={() => setShowSignUp(true)} />;
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
