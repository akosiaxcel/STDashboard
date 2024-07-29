import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebaseConfig";
import styles from "./Dashboard.module.css";
import Spinner from "./Spinner.module.css"; // Import spinner styles
import NavBar from "./NavBar";

// Define correct answers
const correctAnswers = {
  "q19large.gif": "q19e.gif",
  "q4large.gif": "q4c.gif",
  "q13large.gif": "q13a.gif",
  "q17large.gif": "q17d.gif",
  "q6large.gif": "q6a.gif",
  "bluediamond2.gif": "q2d.gif",
};

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchIds, setSearchIds] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [savedResults, setSavedResults] = useState([]);
  const [saveError, setSaveError] = useState(null);

  // State for timeouts
  const [searchErrorTimeout, setSearchErrorTimeout] = useState(null);
  const [saveErrorTimeout, setSaveErrorTimeout] = useState(null);

  useEffect(() => {
    // Load saved results from local storage
    const savedData = JSON.parse(localStorage.getItem("savedResults")) || [];
    setSavedResults(savedData);
  }, []);

  const handleSearch = async () => {
    if (!inputValue) {
      setSearchError("Please enter a User ID(s)");
      clearTimeout(searchErrorTimeout);
      setSearchErrorTimeout(setTimeout(() => setSearchError(null), 3000));
      return;
    }

    const ids = inputValue.split(",").map((id) => id.trim());

    // Check if any of the IDs are already searched
    const alreadySearchedIds = ids.filter((id) => searchIds.includes(id));
    if (alreadySearchedIds.length > 0) {
      setSearchError(`User ID(s) ${alreadySearchedIds.join(", ")} already searched.`);
      clearTimeout(searchErrorTimeout);
      setSearchErrorTimeout(setTimeout(() => setSearchError(null), 3000));
      return;
    }

    setSearchIds([...searchIds, ...ids]);

    setLoading(true); // Show loading spinner
    await new Promise((resolve) => setTimeout(resolve, 250)); // Simulate a delay

    for (const id of ids) {
      try {
        const querySnapshot = await getDocs(collection(db, `users/${id}/selectedOptions`));

        if (!querySnapshot.empty) {
          const dataList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(), // Convert Firestore timestamp to JS Date if it exists
          }));

          const result = { id, data: dataList };
          const resultWithStats = calculateResults([result])[0];

          // Automatically save the result if it is valid
          saveResults(resultWithStats);
        }
      } catch (error) {
        // Handle errors if necessary
      }
    }

    setLoading(false); // Hide loading spinner
    setInputValue(""); // Clear search input
  };

  const clearSearchResults = () => {
    setSearchIds([]);
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

  const saveResults = (result) => {
    const isAlreadySaved = savedResults.some((savedResult) => savedResult.id === result.id);

    if (isAlreadySaved) {
      setSaveError(`Result for User ID ${result.id} is already saved.`);
      clearTimeout(saveErrorTimeout);
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

  // Sort results: first by totalCorrect (descending), then by medianTimeDiff (ascending)
  const sortedResults = savedResults
    .slice() // Create a copy to avoid mutating the original array
    .sort((a, b) => {
      if (b.totalCorrect !== a.totalCorrect) {
        return b.totalCorrect - a.totalCorrect; // Sort by totalCorrect descending
      }
      return a.medianTimeDiff - b.medianTimeDiff; // Sort by medianTimeDiff ascending
    });

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
            <button className={styles.searchButton} onClick={handleSearch}>
              Search
            </button>
            <button className={styles.clearButton} onClick={clearSearchResults}>
              Clear
            </button>
            {searchError && <div className={styles.error}>{searchError}</div>}
          </div>

          {loading && <div className={Spinner.spinner}></div>} {/* Render spinner while loading */}
        </div>

        <div className={styles.savedResults}>
          <h2>Saved Results</h2>
          {saveError && <div className={styles.error}>{saveError}</div>}
          {sortedResults.length === 0 ? (
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
                {sortedResults.map((result, index) => (
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
