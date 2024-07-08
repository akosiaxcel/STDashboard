import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Link as MuiLink, Typography } from "@mui/material";
import styles from "./SignUp.module.css";
import { styled } from "@mui/system";

function SignUp({ onSignInClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const CustomLink = styled(MuiLink)({
    textDecoration: "none",
    color: "inherit",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirect to sign in or directly to dashboard
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use. Please sign in.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <img
          src="https://www.scaleupconsulting.com.au/wp-content/uploads/2022/05/ScaleupConsulting_Logo_Primary-3.png"
          alt="Company Logo"
          className={styles.logo}
        />
        <CustomLink
          href="https://screening-test.scaleupconsulting.com.au/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Typography variant="h5">Screening Test</Typography>
        </CustomLink>
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
          </form>
          <p>
            Already have an account?{" "}
            <button onClick={onSignInClick} className={styles.linkButton}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
