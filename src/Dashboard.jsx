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
  const [searchError, setSearchError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null); // New state for success messages
  const [inputValue, setInputValue] = useState("");
  const [savedResults, setSavedResults] = useState([]);
  const [saveError, setSaveError] = useState(null);

  // State for input values for notes and edit mode
  const [inputValues, setInputValues] = useState({});
  const [editMode, setEditMode] = useState({});

  useEffect(() => {
    // Load saved results from local storage
    const savedData = JSON.parse(localStorage.getItem("savedResults")) || [];
    setSavedResults(savedData);
  }, []);

  const handleSearch = async () => {
    if (!inputValue) {
      showError("Please enter a User ID");
      return;
    }

    const ids = inputValue.split(",").map((id) => id.trim());
    setLoading(true); // Show loading spinner
    await new Promise((resolve) => setTimeout(resolve, 250)); // Simulate a delay

    for (const id of ids) {
      // Check if the ID is already present in savedResults
      const resultExists = savedResults.some(result => result.id === id);

      if (resultExists) {
        showError(`Result for User ID ${id} is already saved.`);
        continue; // Skip to the next ID
      }

      // Fetch data if the ID is not already saved
      try {
        const querySnapshot = await getDocs(
          collection(db, `users/${id}/selectedOptions`)
        );

        if (querySnapshot.empty) {
          showError(`No data found for User ID ${id}.`);
          continue; // Skip to the next ID
        }

        const dataList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(), // Convert Firestore timestamp to JS Date if it exists
        }));

        const result = { id, data: dataList };
        const resultWithStats = calculateResults([result])[0];

        // Automatically save the result if it is valid
        saveResults(resultWithStats);
      } catch (error) {
        showError(`Error fetching data for User ID ${id}: ${error.message}`);
      }
    }

    setLoading(false); // Hide loading spinner
    setInputValue(""); // Clear search input
  };


  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
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

      const timestamps = result.data
        .map((selectedOption) => new Date(selectedOption.timestamp))
        .sort((a, b) => a - b);

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

      return {
        ...result,
        totalCorrect: correctCount,
        totalIncorrect: incorrectCount,
        medianTimeDiff,
      };
    });
  };

  const saveResults = (result) => {
    const updatedSavedResults = [...savedResults, result];
    setSavedResults(updatedSavedResults);
    localStorage.setItem("savedResults", JSON.stringify(updatedSavedResults));
    setSaveError(null); // Clear any previous save error
    setSaveSuccess(`Saved result for User ID ${result.id}`); // Set success message

    // Clear success message after 6000ms
    setTimeout(() => {
      setSaveSuccess(null);
    }, 6000);
  };

  const deleteSavedResult = (id) => {
    try {
      // Filter out the result with the specified ID
      const updatedSavedResults = savedResults.filter(
        (result) => result.id !== id
      );

      // Update state and local storage
      setSavedResults(updatedSavedResults);
      localStorage.setItem("savedResults", JSON.stringify(updatedSavedResults));

      // Clear any previous save error
      setSaveError(null);
    } catch (error) {
      showError(`Error deleting result: ${error.message}`);
    }
  };

  const saveInputValue = (id) => {
    const currentNote = savedResults.find(result => result.id === id)?.note || "";
    const note = inputValues[id] !== undefined ? inputValues[id] : currentNote;

    const updatedSavedResults = savedResults.map((result) =>
      result.id === id ? { ...result, note } : result
    );

    setSavedResults(updatedSavedResults);
    localStorage.setItem("savedResults", JSON.stringify(updatedSavedResults));
    setInputValues({ ...inputValues, [id]: "" }); // Clear the input field after saving
    setEditMode({ ...editMode, [id]: false }); // Exit edit mode after saving
    setSaveSuccess(`Saved note for User ID ${id}`); // Set success message

    // Clear success message after 6000ms
    setTimeout(() => {
      setSaveSuccess(null);
    }, 6000);
  };

  const cancelEdit = (id) => {
    setInputValues({ ...inputValues, [id]: "" }); // Clear the input field
    setEditMode({ ...editMode, [id]: false }); // Exit edit mode
  };

  const showError = (message) => {
    setSearchError(message);
    setTimeout(() => {
      setSearchError(null);
    }, 6000); // Show for 6 seconds
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
                onKeyDown={handleKeyDown} // Add onKeyDown event handler
              />
            </div>
            <button className={styles.searchButton} onClick={handleSearch}>
              🔎︎ Search
            </button>
            {searchError && (
              <div className={`${styles.error} ${styles["error-pop-in"]}`}>
                {searchError}
              </div>
            )}
            {saveSuccess && (
              <div className={`${styles.success} ${styles["success-pop-in"]}`}>
                {saveSuccess}
              </div>
            )}
          </div>
          {loading && <div className={Spinner.spinner}></div>}{" "}
          {/* Render spinner while loading */}
        </div>

        <div className={styles.savedResults}>
          <h2>Saved Results</h2>
          {saveError && (
            <div className={`${styles.error} ${styles["error-pop-in"]}`}>
              {saveError}
            </div>
          )}
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
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result) => (
                  <tr key={result.id}>
                    <td>{result.id}</td>
                    <td>{result.totalCorrect}</td>
                    <td>{result.totalIncorrect}</td>
                    <td>{result.medianTimeDiff}</td>
                    <td>
                      {editMode[result.id] ? (
                        <>
                          <input
                            type="text"
                            value={inputValues[result.id] !== undefined ? inputValues[result.id] : result.note || ""}
                            onChange={(e) =>
                              setInputValues({
                                ...inputValues,
                                [result.id]: e.target.value,
                              })
                            }
                            placeholder="Enter note"
                          />
                          <button
                            className={styles.saveNoteButton}
                            onClick={() => saveInputValue(result.id)}
                          >
                            Save
                          </button>
                          <button
                            className={styles.cancelButton}
                            onClick={() => cancelEdit(result.id)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {result.note || ""}
                          <button 
                            className={styles.editButton}
                            onClick={() =>
                              setEditMode({ ...editMode, [result.id]: true })
                            }
                          >
                            ✎
                          </button>
                        </>
                      )}
                    </td>
                    <td>
                      <button
                        className={styles.deleteButton}
                        onClick={() => deleteSavedResult(result.id)}
                      >
                        ✖
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
