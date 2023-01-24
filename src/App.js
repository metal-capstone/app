
import React, { useState, useEffect } from "react";

import logo from './logo.svg';
import './App.css';

function App() {
  const [data, setData] = useState({message: "no data"});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://0.0.0.0:8000/hello-world");
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
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="http://0.0.0.0:8000/hello-world"
          target="_blank"
          rel="noopener noreferrer"
        >
          Received {data.message} from our REST API.
        </a>
      </header>
    </div>
  );
}

export default App;