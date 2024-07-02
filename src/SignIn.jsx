import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import styles from "./SignIn.module.css";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <img src="https://www.scaleupconsulting.com.au/wp-content/uploads/2022/05/ScaleupConsulting_Logo_Primary-3.png" alt="Company Logo" className={styles.logo} />
      </div>
      <div className={styles.right}>
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
            <p>Don't have an account? <a href="/sign-up">Sign Up</a></p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
