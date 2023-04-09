import React, { useState, useEffect, useCallback } from "react";
import { Route, Routes } from "react-router-dom";
import useWebSocket from 'react-use-websocket';
import { useCookies } from 'react-cookie';
import axios from 'axios';

import './App.css';
import Layout from "./Layout"
import Login from "./Login";
import Dashboard from "./Dashboard";

const socketUrl = 'ws://localhost:8000/';

function App() {
  const [cookies, setCookies] = useCookies(['user']);
  const [username, setUsername] = useState();
  const [profilePic, setProfilePic] = useState();
  const [loggedIn, setLoggedIn] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState();
  const [messageHistory, setMessageHistory] = useState([['App', 'Started']]);

  // Function that returns a promise string of the websocket url, needed so that websocket doesn't connected until user is loggedIn
  const getSocketUrl = useCallback(() => {
    return new Promise((resolve) => {
      (function waitForLogin() { // check if logged in every second, resolve promise once logged in
        if (cookies.session_id !== undefined) {
          resolve(socketUrl + cookies.session_id + '/ws');
        }
        setTimeout(waitForLogin, 1000);
      })();
    });
  }, [cookies.session_id]);

  // Connect to websocket, add connection message on open
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(getSocketUrl, {
    onOpen: () => {
      setMessageHistory((prev) => [...prev, ['App', 'Connected to ' + socketUrl]]);
    },
    shouldReconnect: () => {
      return loggedIn
    },
    onReconnectStop: () => {
      setUsername();
      setProfilePic();
      setSpotifyToken();
      setLoggedIn(false);
    }
  });

  // Message Handler for websocket, called anytime last json message changes
  useEffect(() => {
    if (lastJsonMessage !== null) {
      switch (lastJsonMessage.type) {
        case 'message': // Messages are added to message history
          setMessageHistory((prev) => [...prev, ['Server', lastJsonMessage.message]]);
          break;
        case 'log-status':
          if (lastJsonMessage.loggedIn) {
            setLoggedIn(true);
          } else {
            setUsername();
            setProfilePic();
            setSpotifyToken();
            setLoggedIn(false);
          }
          break;
        case 'user-info':
          setUsername(lastJsonMessage.username);
          if ('profile_pic' in lastJsonMessage) setProfilePic(lastJsonMessage.profile_pic); // only set profile pic if it exists
          break;
        case 'spotify-token':
          setSpotifyToken(lastJsonMessage.token);
          break;
        case 'error': // Error from backend
          setMessageHistory((prev) => [...prev, ['Server', lastJsonMessage.error]]);
          console.error(lastJsonMessage.error);
          break;
        default:
          setMessageHistory((prev) => [...prev, ['App', 'Error: Unsupported message type']]);
          console.error('Error: Unsupported message type');
      }
    }
  }, [lastJsonMessage]);

  // button function that logs the user in with spotify. stores the session id, gets the auth url from backend, and redirects to it
  const spotifyLogin = () => {
    axios.get('http://localhost:8000/spotify-login')
      .then(function (response) {
        setCookies('session_id', response.data.session_id);
        window.location.href = response.data.auth_url;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  // button function that logs the user out, clears session id cookie and resets state
  const logout = () => {
    sendJsonMessage({ 'type': 'logout' })
    setCookies('session_id', undefined);
  }

  return (
    <Routes>
      <Route path="/" element={<Layout username={username} profilePic={profilePic} spotifyLogin={spotifyLogin} logout={logout} loggedIn={loggedIn} />}>
        <Route index element={<Login spotifyLogin={spotifyLogin} />} />
        <Route path="dashboard" element={<Dashboard sendJsonMessage={sendJsonMessage} readyState={readyState} messageHistory={messageHistory} setMessageHistory={setMessageHistory} spotifyToken={spotifyToken} />} />
      </Route>
    </Routes>
  );
}

export default App;