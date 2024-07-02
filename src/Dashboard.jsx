import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "./firebaseConfig";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("No permissions");
        setLoading(false);
        return;
      }

      try {
        const userId = user.uid;
        const querySnapshot = await getDocs(
          collection(db, `users/${userId}/selectedOptions`)
        );
        const dataList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(dataList);
      } catch (error) {
        setError("Error fetching data");
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const handleSearch = () => {
    if (!searchId) {
      setSearchError("Please enter a User ID");
      return;
    }

    const result = data.find((item) => item.id === searchId);
    setSearchResult(result || "No data found");
    setSearchError(null); // Clear previous error
  };

  const handleClearSearch = () => {
    setSearchId("");
    setSearchResult(null);
    setSearchError(null); // Clear previous error
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2 className={styles.welcome}>
          Welcome, {getAuth().currentUser?.email || "Employer"}
        </h2>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
      <h1>Your Dashboard</h1>
      <button
        onClick={() => setShowSearch(!showSearch)}
        className={styles.toggleSearchButton}
      >
        {showSearch ? "Hide Search" : "Show Search"}
      </button>
      {showSearch && (
        <div className={styles.searchSection}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Enter User ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button onClick={handleSearch} className={styles.searchButton}>
            Search
          </button>
          <button onClick={handleClearSearch} className={styles.clearButton}>
            Clear Search
          </button>
          {searchError && <p className={styles.error}>{searchError}</p>}
        </div>
      )}
      {searchResult && (
        <div className={styles.searchResult}>
          <h3>Search Result</h3>
          {typeof searchResult === "string" ? (
            <p>{searchResult}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Source</th>
                  <th>Option</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{searchResult.question}</td>
                  <td>{searchResult.source}</td>
                  <td>{searchResult.option}</td>
                  <td>
                    {new Date(
                      searchResult.timestamp.seconds * 1000
                    ).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
