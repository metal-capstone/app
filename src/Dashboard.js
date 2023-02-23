import React, { useEffect, useState } from "react";
import useWebSocket from 'react-use-websocket';
import axios from 'axios';

import Header from './Header';

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
  
    return (
      <div className="Dashboard">
        <Header username={username} profilePic={profilePic} />
      </div>
    );
  }
  
  export default Dashboard;