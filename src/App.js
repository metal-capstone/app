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

  // Function that checks if user has a valid session, passed interval of self to clear after session is not found
  const checkSession = useCallback((interval) => {
    if (cookies.state !== undefined) { // Only check session if user has one
      axios.get('http://localhost:8000/' + cookies.state + '/session-valid')
        .then(function () { // If the response is valid, session is valid
          setLoggedIn(true);
        })
        .catch(function (error) { // catch 404 session not found, log out user and reset state and stop checking
          setUsername();
          setProfilePic();
          setSpotifyToken();
          clearInterval(interval);
          setLoggedIn(false);
          console.error(error);
        });
    }
  }, [cookies.state]);

  // Check session every second after start
  useEffect(() => {
    const interval = setInterval(() => { checkSession(interval); }, 1000);
    return () => clearInterval(interval);
  }, [checkSession]);

  // Function that returns a promise string of the websocket url, needed so that websocket doesn't connected until user is loggedIn
  const getSocketUrl = useCallback(() => {
    return new Promise((resolve) => {
      (function waitForLogin() { // check if logged in every second, resolve promise once logged in
        if (loggedIn) {
          resolve(socketUrl + cookies.state + '/ws');
        }
        setTimeout(waitForLogin, 1000);
      })();
    });
  }, [loggedIn, cookies.state]);

  // Connect to websocket, add connection message on open
  const { sendMessage, lastJsonMessage, readyState } = useWebSocket(getSocketUrl, {
    onOpen: () => {
      setMessageHistory((prev) => [...prev, ['App', 'Connected to ' + socketUrl]]);
    },
  });

  // Message Handler for websocket, called anytime last json message changes
  useEffect(() => {
    if (lastJsonMessage !== null) {
      switch (lastJsonMessage.type) {
        case 'message': // Messages are added to message history
          setMessageHistory((prev) => [...prev, ['Server', lastJsonMessage.message]]);
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

  // button function that logs the user in with spotify. stores the state, gets the auth url from backend, and redirects to it
  const spotifyLogin = () => {
    axios.get('http://localhost:8000/spotify-login')
      .then(function (response) {
        setCookies('state', response.data.state);
        window.location.href = response.data.auth_url;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  // button function that logs the user out, clears state cookies and resets state
  const logout = () => {
    axios.post('http://localhost:8000/' + cookies.state + '/session-logout')
      .then(function () {
        setCookies('state', undefined);
        setUsername();
        setProfilePic();
        setSpotifyToken();
        setLoggedIn(false);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  return (
    <Routes>
      <Route path="/" element={<Layout username={username} profilePic={profilePic} spotifyLogin={spotifyLogin} logout={logout} loggedIn={loggedIn} />}>
        <Route index element={<Login spotifyLogin={spotifyLogin} />} />
        <Route path="dashboard" element={<Dashboard sendMessage={sendMessage} readyState={readyState} messageHistory={messageHistory} setMessageHistory={setMessageHistory} spotifyToken={spotifyToken} />} />
      </Route>
    </Routes>
  );
}

export default App;