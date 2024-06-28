import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import styles from "./Dashboard.module.css"; // Correctly import the CSS module

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "questions"));
      const dataList = querySnapshot.docs.map((doc) => doc.data());
      setData(dataList);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <h1>Fetching data...</h1>;
  }

  return (
    <div className={styles.dashboard}>
      <h1>IQ Question Bank Dashboard</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Question</th>
            <th>Source</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.question}</td>
              <td>{item.source}</td>
              <td>{item.options.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard; // Ensure this is a default export
