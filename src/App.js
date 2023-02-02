
import React, { useState, useEffect } from "react";

import './App.css';

function App() {
  const [data, setData] = useState({message: "no data"});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/hello-world");
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>Spotify Chatbot</h1>
    </div>
  );
}

export default App;