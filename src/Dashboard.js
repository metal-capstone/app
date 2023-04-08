import React, { useEffect, useState } from "react";
import { ReadyState } from 'react-use-websocket';
import { useOutletContext } from "react-router-dom";

import WebPlayer from "./WebPlayer";
import './Dashboard.css';

function Dashboard(props) {
  let messagesEnd;
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
      {!loggedIn && <div className="Overlay">Not Logged In</div>}
      <div className="MessageHistory">
        {props.messageHistory.map((message, idx) => (
          <div className="Message" key={idx}><div className="MessageUser">{message[0]}</div><div className="MessageText">{message[1] ? message[1] : null}</div></div>
        ))}
        <div ref={(el) => { messagesEnd = el; }}></div>
      </div>
      <div className="MessageBox">
        <div className="MessageLabel">Message:</div><input type="text" value={currentMessage} onKeyDown={(e) => enterPress(e)} onChange={message => { setCurrentMessage(message.target.value) }} />
        <button onClick={handleSend}>Send</button>
      </div>
      <div className="StatusBar">Connection Status: {connectionStatus}</div>
      <WebPlayer token={props.spotifyToken} />
    </div>
  );
}

export default Dashboard;