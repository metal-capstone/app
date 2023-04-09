import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import useWebSocket from 'react-use-websocket';

import './App.css';
import Layout from "./Layout"
import Login from "./Login";
import Dashboard from "./Dashboard";

const socketUrl = 'ws://localhost:8000/ws';
const loginUrl = 'http://localhost:8000/spotify-login';

// Main app component, handles websocket, log in, routes, and data management
function App() {
  const [username, setUsername] = useState();
  const [profilePic, setProfilePic] = useState();
  const [loggedIn, setLoggedIn] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState();
  const [messageHistory, setMessageHistory] = useState([['App', 'Started']]);

  // Connect to websocket, add connection message on open
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      setMessageHistory((prev) => [...prev, ['App', 'Connected to ' + socketUrl]]);
    },
    shouldReconnect: () => {
      return loggedIn // only reconnected if you were logged in last, server disconnection
    },
    onReconnectStop: () => {
      // forced log out, cant reach server, set default states
      logoutState();
    }
  });

  // Message Handler for incoming websocket messages, called anytime last json message changes
  useEffect(() => {
    if (lastJsonMessage !== null) {
      switch (lastJsonMessage.type) {
        // Messages are added to message history
        case 'message':
          setMessageHistory((prev) => [...prev, ['Server', lastJsonMessage.message]]);
          break;

        // store log status for graceful open and close
        case 'log-status':
          if (lastJsonMessage.loggedIn) {
            // websocket connection success
            setLoggedIn(true);
          } else {
            // requested log out, set default states
            logoutState();
          }
          break;

        case 'user-info':
          setUsername(lastJsonMessage.username);
          if ('profile_pic' in lastJsonMessage) setProfilePic(lastJsonMessage.profile_pic); // only set profile pic if it exists
          break;

        case 'spotify-token':
          setSpotifyToken(lastJsonMessage.token);
          break;

        // Error on backend side
        case 'error':
          setMessageHistory((prev) => [...prev, ['Server', lastJsonMessage.error]]);
          console.error(lastJsonMessage.error);
          break;

        // Error on frontend side
        default:
          setMessageHistory((prev) => [...prev, ['App', 'Error: Unsupported message type (' + lastJsonMessage.type + ')']]);
          console.error('Error: Unsupported message type (' + lastJsonMessage.type + ')');
      }
    }
  }, [lastJsonMessage]);

  // button function that logs the user in with spotify, redirects to backend and then to spotify
  const spotifyLogin = () => {
    window.location.href = loginUrl;
  }

  // button function that sends a log out request to backend
  const logoutRequest = () => {
    sendJsonMessage({ 'type': 'logout' });
  }

  const logoutState = () => {
    setUsername();
    setProfilePic();
    setSpotifyToken();
    setLoggedIn(false);
  }

  return (
    <Routes>
      <Route path="/" element={<Layout username={username} profilePic={profilePic} spotifyLogin={spotifyLogin} logout={logoutRequest} loggedIn={loggedIn} />}>
        <Route index element={<Login spotifyLogin={spotifyLogin} />} />
        <Route path="dashboard" element={<Dashboard sendJsonMessage={sendJsonMessage} readyState={readyState} messageHistory={messageHistory} setMessageHistory={setMessageHistory} spotifyToken={spotifyToken} />} />
      </Route>
    </Routes>
  );
}

export default App;