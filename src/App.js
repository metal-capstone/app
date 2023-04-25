import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { useGeolocated } from "react-geolocated";

import './App.css';
import Layout from './Layout';
import Login from './Login';
import Dashboard from './Dashboard';
import types from './types';

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

  // Geo location setup
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: 5000,
    });

  useEffect(() => {
    if (isGeolocationAvailable && isGeolocationEnabled && coords) {
      sendJsonMessage({ 'type': types.DATA, 'detail': { 'lat': coords.latitude, 'long': coords.longitude } });
    }
  }, [isGeolocationAvailable, isGeolocationEnabled, coords]);

  // Message Handler for incoming websocket messages, called anytime last json message changes
  useEffect(() => {
    if (lastJsonMessage !== null) {
      switch (lastJsonMessage.type) {
        // Messages are added to message history
        case types.MESSAGE:
          setMessageHistory((prev) => [...prev, ['Server', lastJsonMessage.detail]]);
          break;

        // store log status for graceful open and close
        case types.DATA:
          const data = lastJsonMessage.detail
          if ('logStatus' in data) {
            if (data.logStatus) {
              // websocket connection success
              setLoggedIn(true);
            } else {
              // requested log out, set default states
              logoutState();
            }
          }
          if ('token' in data) setSpotifyToken(data.token);
          if ('username' in data) setUsername(data.username);
          if ('profilePic' in data) setProfilePic(data.profilePic);
          break;

        case types.INFO:
          setMessageHistory((prev) => [...prev, ['Server', 'Info: ' + lastJsonMessage.detail]]);
          console.log(lastJsonMessage.detail);
          break;

        // Error on backend side
        case types.ERROR:
          setMessageHistory((prev) => [...prev, ['Server', 'Error: ' + lastJsonMessage.detail]]);
          console.error(lastJsonMessage.detail);
          break;

        // Error on frontend side
        default:
          setMessageHistory((prev) => [...prev, ['App', 'Error: Unsupported message type (' + lastJsonMessage.type + ')']]);
          console.error('Unsupported message type (' + lastJsonMessage.type + ')');
      }
    }
  }, [lastJsonMessage]);

  // button function that logs the user in with spotify, redirects to backend and then to spotify
  const spotifyLogin = () => {
    window.location.href = loginUrl;
  }

  // button function that sends a log out request to backend
  const logoutRequest = () => {
    sendJsonMessage({ 'type': types.COMMAND, 'detail': { 'command': 'logout' } });
  }

  const logoutState = () => {
    setUsername();
    setProfilePic();
    setSpotifyToken();
    setLoggedIn(false);
  }

  return (
    <Routes>
      <Route path='/' element={<Layout username={username} profilePic={profilePic} spotifyLogin={spotifyLogin} logout={logoutRequest} loggedIn={loggedIn} />}>
        <Route index element={<Login spotifyLogin={spotifyLogin} />} />
        <Route path='dashboard' element={<Dashboard sendJsonMessage={sendJsonMessage} readyState={readyState} messageHistory={messageHistory} setMessageHistory={setMessageHistory} spotifyToken={spotifyToken} />} />
      </Route>
    </Routes>
  );
}

export default App;