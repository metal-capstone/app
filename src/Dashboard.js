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
      console.log('Connected');
    }
  });

  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage.type == 'message') {
        setMessageHistory((prev) => prev.concat(lastJsonMessage.message)); 
      } else if (lastJsonMessage.type == 'user-info') {
        setUsername(lastJsonMessage.username);
        setProfilePic(lastJsonMessage.profile_pic);
      }
    }
  }, [lastJsonMessage]);

  // dont send empty messages, after sending clear current
  const handleSend = () => {
    if (currentMessage !== '') {
      sendMessage(currentMessage);
      setCurrentMessage('');
    }
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
      <p>Connection Status:{connectionStatus}</p>
      <label>
        Message:
        <input type="text" value={currentMessage} onChange={message => { setCurrentMessage(message.target.value) }} />
      </label>
      <button onClick={handleSend}>Send</button>
      <ul>
        {messageHistory.map((message, idx) => (
          <span key={idx}>{message ? message : null}</span>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;