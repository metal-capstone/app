import React, { useEffect, useState } from "react";
import useWebSocket from 'react-use-websocket';
import axios from 'axios';

import './Dashboard.css';

function Dashboard() {
    const [username, setUsername] = useState("No username");
    const [profilePic, setProfilePic] = useState("no url");

    useWebSocket('ws://localhost:8000/ws', {
      onOpen: () => {
        console.log('WebSocket connection established.');
      }
    });

    // Get user info when rendered
    useEffect(() => {
        axios.get('http://localhost:8000/user-info')
        .then(function (response) {
          setUsername(response.data.username);
          setProfilePic(response.data.profile_pic);
        })
        .catch(function (error) {
          console.log(error);
        });
    }, []);

    // this is just an example function with a button to show how to query the backend
    const logTopSongs = () => {
        axios.get('http://localhost:8000/user-top-songs')
          .then(function (response) {
            console.log(response.data.songs)
          })
          .catch(function (error) {
            console.log(error);
          });
      }
  
    return (
      <div className="Dashboard">
        <h1>{username}</h1>
        <img src={profilePic} alt="profile" />
        <button onClick={logTopSongs}>Log top songs</button>
      </div>
    );
  }
  
  export default Dashboard;