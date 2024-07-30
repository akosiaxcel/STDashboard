import React, { useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import styles from "./NavBar.module.css";

function NavBar({ onLogout }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      onLogout(); // Trigger logout action from parent component
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className={styles.navbar}>
        <div className={styles.right}>
          <img
            src="https://www.scaleupconsulting.com.au/wp-content/uploads/2022/05/ScaleupConsulting_Logo_Primary-3.png"
            alt="Company Logo"
            className={styles.logo}
          />
        </div>
        <div className={styles.menuIcon} onClick={toggleSidebar}>
          &#9776;
        </div>
        <div className={styles.logoutButtonContainer}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div
        className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}
        id="sidebar"
      >
        <a href="#" className={styles.closebtn} onClick={toggleSidebar}>
          &times;
        </a>
        {/* <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Services</a>
        <a href="#">Contact</a> */}
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  );
}

export default NavBar;
