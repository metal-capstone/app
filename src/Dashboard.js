import React, { useEffect, useState, useCallback } from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import axios from 'axios';

import Header from './Header';
import './Dashboard.css';
const socketUrl = 'ws://localhost:8000/ws';

function Dashboard() {
  const [username, setUsername] = useState();
  const [profilePic, setProfilePic] = useState();
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);

  const { sendMessage, lastMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      axios.get('http://localhost:8000/user-info')
      .then(function (response) {
        setUsername(response.data.username);
        setProfilePic(response.data.profile_pic);
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  });

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);


  const handleSend = () => {
    sendMessage(currentMessage);
    setCurrentMessage('');
  }

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div className="Dashboard">
      <Header username={username} profilePic={profilePic} />
      <p>{connectionStatus}</p>
      <label>
        Message:
        <input type="text" value={currentMessage} onChange={message => { setCurrentMessage(message.target.value) }} />
      </label>
      <button onClick={handleSend}>Send</button>
      <ul>
        {messageHistory.map((message, idx) => (
          <span key={idx}>{message ? message.data : null}</span>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;