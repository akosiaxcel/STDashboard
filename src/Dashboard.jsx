import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "./firebaseConfig";
import styles from "./Dashboard.module.css";
import NavBar from "./NavBar";


const correctAnswers = {
  "q19large.gif": "q19e.gif",
  "q4large.gif": "q4c.gif",
  "q13large.gif": "q13a.gif",
  "q17large.gif": "q17d.gif",
  "q6large.gif": "q6a.gif",
  "bluediamond2.gif": "q2d.gif",
};

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchIds, setSearchIds] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [searchResult, setSearchResult] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [userId, setUserId] = useState(null);
  const [savedResults, setSavedResults] = useState([]);
  const [saveError, setSaveError] = useState(null);

  // State for timeouts
  const [searchErrorTimeout, setSearchErrorTimeout] = useState(null);
  const [saveErrorTimeout, setSaveErrorTimeout] = useState(null);

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
      setUserId(userId);

      try {
        const querySnapshot = await getDocs(collection(db, `users/${userId}/selectedOptions`));
        if (querySnapshot.empty) {
          setData([]);
        } else {
          const dataList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setData(dataList);
        }
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Load saved results from local storage
    const savedData = JSON.parse(localStorage.getItem('savedResults')) || [];
    setSavedResults(savedData);
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
      setSearchErrorTimeout(setTimeout(() => setSearchError(null), 3000));
      return;
    }

    const ids = inputValue.split(",").map((id) => id.trim());

    // Check if any of the IDs are already searched
    const alreadySearchedIds = ids.filter(id => searchIds.includes(id));
    if (alreadySearchedIds.length > 0) {
      setSearchError(`User ID(s) ${alreadySearchedIds.join(", ")} already searched.`);
      setSearchErrorTimeout(setTimeout(() => setSearchError(null), 3000));
      return;
    }

    setSearchIds([...searchIds, ...ids]);

    const newResults = [];

    for (const id of ids) {
      try {
        const querySnapshot = await getDocs(collection(db, `users/${id}/selectedOptions`));

        if (querySnapshot.empty) {
          newResults.push({ id, data: [] });
        } else {
          const dataList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          newResults.push({ id, data: dataList });
        }
      } catch (error) {
        newResults.push({ id, error: error.message });
      }
    }

    setSearchResult(newResults.concat(searchResult));
  };

  const clearSearchResults = () => {
    setSearchIds([]);
    setSearchResult([]);
  };

  const calculateResults = (results) => {
    return results.map((result) => {
      let correctCount = 0;
      const timeDiffs = [];
      const correctItems = [];

      result.data.forEach((selectedOption, index) => {
        const correctOption = correctAnswers[selectedOption.question];
        if (selectedOption.option === correctOption) {
          correctCount += 1;
          correctItems.push(index + 1); // Item number (1-based index)
        }
        if (index > 0) {
          const prevTimestamp = result.data[index - 1].timestamp.toDate();
          const currTimestamp = selectedOption.timestamp.toDate();
          timeDiffs.push(currTimestamp - prevTimestamp);
        }
      });

      const totalCorrect = correctCount;
      const medianTime = timeDiffs.length
        ? timeDiffs.sort((a, b) => a - b)[Math.floor(timeDiffs.length / 2)]
        : 0;

      return { ...result, totalCorrect, medianTime, correctItems };
    });
  };

  const searchResultWithStats = calculateResults(searchResult);

  const saveResults = (result) => {
    const isAlreadySaved = savedResults.some((savedResult) => savedResult.id === result.id);

    if (isAlreadySaved) {
      setSaveError(`Result for User ID ${result.id} is already saved.`);
      setSaveErrorTimeout(setTimeout(() => setSaveError(null), 3000));
      return;
    }

    const updatedSavedResults = [...savedResults, result];
    setSavedResults(updatedSavedResults);
    localStorage.setItem("savedResults", JSON.stringify(updatedSavedResults));
    setSaveError(null); // Clear any previous save error
  };

  const deleteSavedResult = (index) => {
    const updatedSavedResults = savedResults.filter((_, i) => i !== index);
    setSavedResults(updatedSavedResults);
    localStorage.setItem("savedResults", JSON.stringify(updatedSavedResults));
  };

  return (
    <div><NavBar/>
    <div className={styles.dashboard}>
      <div className={styles.header}>
        
        <div className={styles.welcome}>
          Welcome, {getAuth().currentUser?.email || "User"}
        </div>
        {/* <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button> */}
      </div>

      <h1>Dashboard</h1>
      <div className={styles.mainSection}>
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
            Search multiple IDs by separating them with a comma
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
        {searchResultWithStats.length > 0 && (
          <div className={styles.searchResult}>
            {searchResultWithStats.map((result) => (
              <div key={result.id}>
                <div className={styles.resultHeader}>
                  <h3>User ID: {result.id}</h3>
                  <button
                    className={styles.deleteButton}
                    onClick={() =>
                      setSearchResult(searchResult.filter((r) => r.id !== result.id))
                    }
                  >
                    ×
                  </button>
                </div>
                {result.error ? (
                  <div className={styles.error}>{result.error}</div>
                ) : (
                  <div>
                    <div>Number of correct answers: {result.totalCorrect}</div>
                    <div>Correct item number: {result.correctItems.join(", ")}</div>
                    <div>Median time of answering: {result.medianTime} ms</div>
                    <button className={styles.saveButton} onClick={() => saveResults(result)}>
                      Save
                    </button>
                    {/* <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Source</th>
                          <th>Option</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.map((item, index) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.source}</td>
                            <td>{item.option}</td>
                            <td>{new Date(item.timestamp.seconds * 1000).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table> */}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h2>Saved Results</h2>
        {saveError && <div className={styles.error}>{saveError}</div>}
        {savedResults.length === 0 ? (
          <div>No saved results</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Correct Answers</th>
                <th>Correct Items</th>
                <th>Median Time (ms)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.id}</td>
                  <td>{result.totalCorrect}</td>
                  <td>{result.correctItems.join(", ")}</td>
                  <td>{result.medianTime}</td>
                  <td>
                    <button className={styles.deleteButton} onClick={() => deleteSavedResult(index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </div>
  );
}

export default Dashboard;
