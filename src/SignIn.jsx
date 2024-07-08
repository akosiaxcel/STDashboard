import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link as MuiLink, Typography } from "@mui/material";
import { styled } from "@mui/system";
import styles from "./SignIn.module.css";

const CustomLink = styled(MuiLink)({
  textDecoration: "none",
  color: "inherit",
});

function SignIn({ onSignUpClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    if (storedEmail && storedPassword) {
      setEmail(storedEmail);
      setPassword(storedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
      }
      // Redirect to dashboard or do something on successful login
    } catch (err) {
      setError(err.message);
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
        <div>
          <CustomLink
            href="https://screening-test.scaleupconsulting.com.au/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Typography variant="h5">Screening Test</Typography>
          </CustomLink>
        </div>
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
            <div className={styles.rememberMe}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label>Remember Me</label>
            </div>
            <button type="submit">Sign In</button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
          <p>
            Don't have an account?{" "}
            <button onClick={onSignUpClick}>Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
