import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "./firebaseConfig";
import styles from "./Dashboard.module.css"; // Correctly import the CSS module

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <div className={styles.dashboard}>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>
      <h1>Prospective Employer Dashboard</h1>
      {data.length === 0 ? (
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
                <td>{new Date(item.timestamp.seconds * 1000).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
