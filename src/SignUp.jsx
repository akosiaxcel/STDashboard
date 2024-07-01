// SignUp.js
import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import styles from "./SignUp.module.css";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirect to sign in or directly to dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.signUp}>
      <form onSubmit={handleSubmit}>
        <h1>Sign Up</h1>
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
        <button type="submit">Sign Up</button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

export default SignUp;
