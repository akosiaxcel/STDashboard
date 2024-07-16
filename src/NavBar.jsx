import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { Link as MuiLink, Typography } from "@mui/material";
import { styled } from "@mui/system";
import styles from "./NavBar.module.css";

const CustomLink = styled(MuiLink)({
  textDecoration: "none",
  color: "inherit",
});

function NavBar({ logoUrl, onLogout }) {
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      onLogout(); // Trigger logout action from parent component
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.left}>
        <img
          src="https://www.scaleupconsulting.com.au/wp-content/uploads/2022/05/ScaleupConsulting_Logo_Primary-3.png"
          alt="Company Logo"
          className={styles.logo}
        />
      </div>
      {/* <div className={styles.profile}>
        <img
          src={logoUrl}
          alt="Profile"
          className={styles.profilePic}
        />
      </div> */}
      <div className={styles.logoutButtonContainer}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default NavBar;
