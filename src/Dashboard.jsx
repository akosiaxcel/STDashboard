import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "option"));
        const dataList = querySnapshot.docs.map((doc) => doc.data());
        setData(dataList);
        setLoading(false);
      } catch (err) {
        if (err.code === "permission-denied") {
          setError("No permissions");
        } else {
          setError("Failed to fetch data");
        }
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <h1>Fetching data...</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  if (data.length === 0) {
    return <h1>No Data</h1>;
  }

  return (
    <div className={styles.dashboard}>
      <h1>IQ Question Bank Dashboard</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Timestamp</th>
            {/* <th>Question</th>
            <th>Source</th>
            <th>Options</th> */}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.timestamp}</td>
              {/* <td>{item.source}</td>
              <td>{item.options.join(", ")}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
