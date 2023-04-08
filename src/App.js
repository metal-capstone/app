import React, { useState, useEffect, useCallback } from "react";
import { Route, Routes } from "react-router-dom";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import axios from 'axios';
import { useCookies } from 'react-cookie';

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

  useEffect(() => {
    const checkSession = async (interval) => {
      if (cookies.state !== undefined) {
        axios.get('http://localhost:8000/' + cookies.state + '/session-valid')
          .then(function (response) {
            if (response.status === 200) {
              setLoggedIn(true);
            } else {
              console.log(response);
            }
          })
          .catch(function (error) {
            if (error.response.status === 404) {
              setUsername();
              setProfilePic();
              setSpotifyToken();
              clearInterval(interval);
            }
            setLoggedIn(false);
            console.log(error);
          });
      }
    }
    const interval = setInterval(() => { checkSession(interval); }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSocketUrl = useCallback(() => {
    return new Promise((resolve) => {
      (function waitForLogin() {
        if (loggedIn) {
          resolve(socketUrl + cookies.state + '/ws');
        }
        setTimeout(waitForLogin, 30);
      })();
    });
  }, [loggedIn]);

  const { sendMessage, lastJsonMessage, readyState } = useWebSocket(getSocketUrl, {
    onOpen: () => {
      setMessageHistory((prev) => [...prev, ['App', 'Connected to ' + socketUrl]]);
    },
  });

  // called when last json message changes, so anytime the backend sends a message.
  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage.type === 'message') { // if message type json, add to message history
        setMessageHistory((prev) => [...prev, ['Server', lastJsonMessage.message]]);
      } else if (lastJsonMessage.type === 'user-info') {
        setUsername(lastJsonMessage.username);
        if ('profile_pic' in lastJsonMessage) setProfilePic(lastJsonMessage.profile_pic);
      } else if (lastJsonMessage.type === 'spotify-token') {
        setSpotifyToken(lastJsonMessage.token);
      } else if (lastJsonMessage.type === 'error') {
        console.log(lastJsonMessage.error)
      }
    }
  }, [lastJsonMessage]);

  // button function that gets the auth url from backend and redirects to it
  const spotifyLogin = () => {
    axios.get('http://localhost:8000/spotify-login')
      .then(function (response) {
        setCookies('state', response.data.state);
        window.location.href = response.data.auth_url;
      })
      .catch(function (error) {
        console.log(error);
      });
  }

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
        console.log(error);
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