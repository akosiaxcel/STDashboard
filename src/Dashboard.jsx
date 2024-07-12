import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "./firebaseConfig";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchIds, setSearchIds] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [searchResult, setSearchResult] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [userId, setUserId] = useState(null); // State to store authenticated user's ID

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
      setUserId(userId); // Store user ID in state
      console.log("Authenticated User ID:", userId);

      try {
        const querySnapshot = await getDocs(
          collection(db, `users/${userId}/selectedOptions`),
        );
        console.log("Query Snapshot:", querySnapshot);

        if (querySnapshot.empty) {
          console.log("No documents found in the collection.");
          setData([]);
        } else {
          console.log("Documents found in the collection.");
          const dataList = querySnapshot.docs.map((doc) => {
            console.log("Document Data:", doc.data());
            return {
              id: doc.id,
              ...doc.data(),
            };
          });
          console.log("Fetched Data List:", dataList);
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

  const handleSearch = async () => {
    if (!inputValue) {
      setSearchError("Please enter a User ID(s)");
      return;
    }

    const ids = inputValue.split(",").map((id) => id.trim());
    setSearchIds(ids);
    console.log("Searching for IDs:", ids);

    const newResults = [];

    for (const id of ids) {
      try {
        const querySnapshot = await getDocs(
          collection(db, `users/${id}/selectedOptions`),
        );

        if (querySnapshot.empty) {
          console.log(`No documents found for User ID: ${id}`);
          newResults.push({ id, data: [] });
        } else {
          const dataList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          newResults.push({ id, data: dataList });
        }
      } catch (error) {
        console.error(`Error fetching data for User ID ${id}: `, error);
        newResults.push({ id, error: error.message });
      }
    }

    setSearchResult(newResults.concat(searchResult));
  };

  const clearSearchResults = () => {
    setSearchIds([]);
    setSearchResult([]);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.welcome}>
          Welcome, {getAuth().currentUser?.email || "User"}
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <h1>Dashboard</h1>
      <div className={styles.searchSection}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter User ID"
            className={styles.searchInput}
          />
        </div>
        <h6 className={styles.multipleId}>
          search multiple IDs by separating with a comma
        </h6>
        <button className={styles.searchButton} onClick={handleSearch}>
          Search
        </button>

        <button className={styles.clearButton} onClick={clearSearchResults}>
          Clear
        </button>
        {searchError && <div className={styles.error}>{searchError}</div>}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div></div>
      )}
      {searchResult.length > 0 && (
        <div className={styles.searchResult}>
          {searchResult.map((result) => (
            <div key={result.id}>
              <div className={styles.resultHeader}>
                <h3>User ID: {result.id}</h3>
                <button
                  className={styles.deleteButton}
                  onClick={() =>
                    setSearchResult(
                      searchResult.filter((r) => r.id !== result.id),
                    )
                  }
                >
                  ×
                </button>
              </div>
              {result.error ? (
                <div className={styles.error}>{result.error}</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Source</th>
                      <th>Option</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
     
                        <td>{item.source}</td>
                        <td>{item.option}</td>
                        <td>
                          {new Date(
                            item.timestamp.seconds * 1000,
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
