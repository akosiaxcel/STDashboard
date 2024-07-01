// SignIn.js
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import styles from "./SignIn.module.css";

function SignIn({ onSignUpClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to dashboard or do something on successful login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.signIn}>
      <form onSubmit={handleSubmit}>
        <h1>Sign In</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign In</button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
      <p>
        Don't have an account? <button onClick={onSignUpClick}>Sign Up</button>
      </p>
    </div>
  );
}

export default SignIn;
