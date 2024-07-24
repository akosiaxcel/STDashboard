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
            timestamp: doc.data().timestamp?.toDate(), // Convert Firestore timestamp to JS Date if it exists
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
    const savedData = JSON.parse(localStorage.getItem("savedResults")) || [];
    setSavedResults(savedData);
  }, []);

  const handleSearch = async () => {
    if (!inputValue) {
      setSearchError("Please enter a User ID(s)");
      setSearchErrorTimeout(setTimeout(() => setSearchError(null), 3000));
      return;
    }

    const ids = inputValue.split(",").map((id) => id.trim());

    // Check if any of the IDs are already searched
    const alreadySearchedIds = ids.filter((id) => searchIds.includes(id));
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
            timestamp: doc.data().timestamp?.toDate(), // Convert Firestore timestamp to JS Date if it exists
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

  const calculateMedian = (numbers) => {
    if (numbers.length === 0) return 0;
    const sortedNumbers = numbers.slice().sort((a, b) => a - b);
    const middleIndex = Math.floor(sortedNumbers.length / 2);

    if (sortedNumbers.length % 2 === 0) {
      return (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
    } else {
      return sortedNumbers[middleIndex];
    }
  };

  const calculateResults = (results) => {
    return results.map((result) => {
      let correctCount = 0;
      let incorrectCount = 0;
      const timeDiffs = [];

      const timestamps = result.data.map((selectedOption) => new Date(selectedOption.timestamp)).sort((a, b) => a - b);

      for (let i = 1; i < timestamps.length; i++) {
        const timeDiff = timestamps[i] - timestamps[i - 1];
        if (timeDiff >= 0) {
          timeDiffs.push(timeDiff);
        }
      }

      result.data.forEach((selectedOption) => {
        const correctOption = correctAnswers[selectedOption.question];
        if (selectedOption.option === correctOption) {
          correctCount += 1;
        } else {
          incorrectCount += 1;
        }
      });

      const medianTimeDiff = calculateMedian(timeDiffs);

      return { ...result, totalCorrect: correctCount, totalIncorrect: incorrectCount, medianTimeDiff };
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
    <div>
      <NavBar />
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <div className={styles.welcome}>
            Welcome, {getAuth().currentUser?.email || "User"}
          </div>
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
                    <div className={styles.error}>Error: {result.error}</div>
                  ) : (
                    <>
                      <div>
                        <h4>
                          Correct Answers: {result.totalCorrect} | Incorrect Answers:{" "}
                          {result.totalIncorrect} | Median Time: {result.medianTimeDiff} ms
                        </h4>
                        <button
                          className={styles.saveButton}
                          onClick={() => saveResults(result)}
                        >
                          Save Result
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.savedResults}>
          <h2>Saved Results</h2>
          {saveError && <div className={styles.error}>{saveError}</div>}
          {savedResults.length === 0 ? (
            <div>No saved results</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Number of Correct Answers</th>
                  <th>Number of Incorrect Answers</th>
                  <th>Median Time (ms)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedResults.map((result, index) => (
                  <tr key={index}>
                    <td>{result.id}</td>
                    <td>{result.totalCorrect}</td>
                    <td>{result.totalIncorrect}</td>
                    <td>{result.medianTimeDiff}</td>
                    <td>
                      <button
                        className={styles.deleteButton}
                        onClick={() => deleteSavedResult(index)}
                      >
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
