import React, { useEffect, useState } from "react";
import { ReadyState } from 'react-use-websocket';
import { useOutletContext } from "react-router-dom";

import WebPlayer from "./WebPlayer";
import './Dashboard.css';

// Dashboard page that displays chatbot chat and web player.
// Props are provided from app, given readyState and messageHistory to display messages and connection info,
// given sendMessage to send users current message, and given spotify token for the web player.
function Dashboard(props) {
  let messagesEnd; // variable for end of messages displayed in message history
  const loggedIn = useOutletContext(); // Get loggedIn from layout
  const [currentMessage, setCurrentMessage] = useState('');

  // scroll to messages end whenever a new message is added
  useEffect(() => {
    messagesEnd.scrollIntoView({ behavior: "smooth" });
  }, [props.messageHistory, messagesEnd]); // messages end is only added to suppress eslint warning

  // prevents empty messages from being sent, after sending clear current message
  const handleSend = () => {
    if (currentMessage !== '') {
      props.sendMessage(currentMessage);
      props.setMessageHistory((prev) => [...prev, ['User', currentMessage]]);
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
  } [props.readyState];

  // function to send message when enter is pressed when focused on the input box
  const enterPress = (event) => {
    if (event.keyCode === 13) {
      handleSend();
    }
  }

  return (
    <div className="Dashboard">
      {/* Overlay div if user is not logged in */}
      {!loggedIn && <div className="Overlay">Not Logged In</div>}
      <div className="MessageHistory">
        {/* render all messages in message history */}
        {props.messageHistory.map((message, idx) => (
          <div className="Message" key={idx}><div className="MessageUser">{message[0]}</div><div className="MessageText">{message[1] ? message[1] : null}</div></div>
        ))}
        {/* Set div at end of message to messages end */}
        <div ref={(el) => { messagesEnd = el; }}></div>
      </div>
      <div className="MessageBox">
        <div className="MessageLabel">Message:</div>
        {/* message input box, check for keydown enter and set current message on change */}
        <input type="text" value={currentMessage} onKeyDown={(e) => enterPress(e)} onChange={message => { setCurrentMessage(message.target.value) }} />
        <button onClick={handleSend}>Send</button>
      </div>
      <div className="StatusBar">Connection Status: {connectionStatus}</div>
      <WebPlayer token={props.spotifyToken} />
    </div>
  );
}

export default Dashboard;