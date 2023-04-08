import React from 'react';
import { Link } from "react-router-dom";

import './Header.css';

// Header component for all pages in app, takes in props from layout (log in and out functions, user info) and displays them.
function Header(props) {
    // TODO: Fix prof pic css to look good for width>height images
    return (
        <div className="Header">
            <Link to="/"><h1>Spotify Chatbot</h1></Link>
            <div className='UserCard'>
                {/* Show log in or out when needed, displays username and profile pic if available, defaults if not */}
                {props.loggedIn ? <button onClick={props.logout}>Log Out</button> : <button onClick={props.spotifyLogin}>Log In</button>}
                <p>{props.username || 'No User'}</p>
                {/* Cropper div to make pic a circle and centered */}
                <div className="ProfilePicCropper">
                    <img className="ProfilePic" src={props.profilePic || '/blank-profile-picture.png'}></img>
                </div>
            </div>
        </div>
    )
}

export default Header