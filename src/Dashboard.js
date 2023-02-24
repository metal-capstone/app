import React, { useEffect, useState, useCallback } from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';

import Header from './Header';
import './Dashboard.css';
const socketUrl = 'ws://localhost:8000/ws';

function Dashboard() {
  const [username, setUsername] = useState();
  const [profilePic, setProfilePic] = useState();
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState([['App', 'Started']]);
  let messagesEnd;

  const { sendMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      setMessageHistory((prev) => [...prev, ['App', 'Connected to ' + socketUrl]]);
      scrollToBottom();
    }
  });

  // called when last json message changes, so anytime the backend sends a message.
  useEffect(() => {
    if (lastJsonMessage !== null) {
      if (lastJsonMessage.type == 'message') { // if message type json, add to message history
        setMessageHistory((prev) => [...prev, ['Server', lastJsonMessage.message]]);
        scrollToBottom();
      } else if (lastJsonMessage.type == 'user-info') { // if user info type, update state user info
        setUsername(lastJsonMessage.username);
        setProfilePic(lastJsonMessage.profile_pic);
      }
    }
  }, [lastJsonMessage]);

  // prevents empty messages from being sent, after sending clear current message
  const handleSend = () => {
    if (currentMessage !== '') {
      sendMessage(currentMessage);
      setMessageHistory((prev) => [...prev, ['User', currentMessage]]);
      scrollToBottom();
      setCurrentMessage('');
    }
  }

  // strings for ready state statuses
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Connected (Open)',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  // function to send message when enter is pressed when focused on the input box
  const enterPress = (event) => {
    if (event.keyCode === 13) {
      handleSend();
    }
  }

  // TODO: doesnt acutally scroll all the way
  const scrollToBottom = () => {
    messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="Dashboard">
      <Header username={username} profilePic={profilePic} />
      <div className="MessageHistory">
        {messageHistory.map((message, idx) => (
          <div className="Message" key={idx}><div className="MessageUser">{message[0]}</div><div className="MessageText">{message[1] ? message[1] : null}</div></div>
        ))}
        <div ref={(el) => { messagesEnd = el; }}></div>
      </div>
      <div className="MessageBox">
        <div className="MessageLabel">Message:</div><input type="text" value={currentMessage} onKeyDown={(e) => enterPress(e)} onChange={message => { setCurrentMessage(message.target.value) }} />
        <button onClick={handleSend}>Send</button>
      </div>
      <div className="StatusBar">Connection Status: {connectionStatus}</div>
    </div>
  );
}

export default Dashboard;