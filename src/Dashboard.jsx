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

      const userId = user.uid;
      console.log("Authenticated User ID:", userId); // Log user ID

      try {
        const querySnapshot = await getDocs(collection(db, `users/${userId}/selectedOptions`));

        if (querySnapshot.empty) {
          console.log("No documents found in the collection.");
          setData([]); // Ensure data is set to an empty array if no documents are found
        } else {
          console.log("Documents found in the collection.");
          const dataList = querySnapshot.docs.map((doc) => {
            console.log("Document Data:", doc.data()); // Log document data
            return {
              id: doc.id,
              ...doc.data(),
            };
          });
          console.log("Fetched Data List:", dataList); // Log fetched data list
          setData(dataList);
        }
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
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

    console.log("Searching for ID:", searchId);
    console.log("Current Data:", data);

    const result = data.find((item) => item.id === searchId);
    console.log("Search Result:", result);

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
                      searchResult.timestamp.seconds * 1000,
                    ).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
      <div className={styles.dataSection}>
        <h3>All Data</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Question</th>
              <th>Source</th>
              <th>Option</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
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
      </div>
    </div>
  );
}

export default Dashboard;
