import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "./firebaseConfig";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("No permissions");
        setLoading(false);
        return;
      }

      setUserEmail(user.email);

      try {
        const userId = user.uid;
        const querySnapshot = await getDocs(
          collection(db, `users/${userId}/selectedOptions`),
        );
        const dataList = querySnapshot.docs.map((doc) => doc.data());
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

  const handleSearch = async () => {
    if (!searchId) return;

    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("No permissions");
        setLoading(false);
        return;
      }

      const userId = user.uid;
      const searchQuery = query(
        collection(db, `users/${userId}/selectedOptions`),
        where("id", "==", searchId),
      );
      const querySnapshot = await getDocs(searchQuery);
      const searchResults = querySnapshot.docs.map((doc) => doc.data());

      if (searchResults.length > 0) {
        setSearchResult(searchResults[0]);
      } else {
        setSearchResult(null);
        setError("No data found for the provided ID");
      }
    } catch (error) {
      setError("Error fetching data");
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Welcome, {userEmail}</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>
      <h2>Employer Dashboard</h2>

      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Search by ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={styles.searchButton}>
          Search
        </button>
      </div>

      {searchResult ? (
        <div className={styles.searchResult}>
          <h3>Search Result</h3>
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
                    searchResult.timestamp.seconds * 1000,
                  ).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : data.length === 0 ? (
        <h2>No Data</h2>
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
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.question}</td>
                <td>{item.source}</td>
                <td>{item.option}</td>
                <td>
                  {new Date(item.timestamp.seconds * 1000).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
