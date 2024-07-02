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
    <div className={styles.container}>
      <div className={styles.left}>
        <img src="https://www.scaleupconsulting.com.au/wp-content/uploads/2022/05/ScaleupConsulting_Logo_Primary-3.png" alt="Company Logo" className={styles.logo} />
      </div>
      <div className={styles.right}>
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
            <p>Already have an account? <a href="/sign-in">Sign In</a></p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
