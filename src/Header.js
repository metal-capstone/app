import React from 'react';
import { Link } from "react-router-dom";

import './Header.css';

function Header(props) {

    // TODO: Fix prof pic css to look good for width>height images
    return (
        <div className="Header">
            <Link to="/"><h1>Spotify Chatbot</h1></Link>
            <div className='UserCard'>
                {props.loggedIn ? <button onClick={props.logout}>Log Out</button> : <button onClick={props.spotifyLogin}>Log In</button>}
                <p>{props.username || 'No User'}</p>
                <div className="ProfilePicCropper">
                    <img className="ProfilePic" src={props.profilePic || '/blank-profile-picture.png'}></img>
                </div>
            </div>
        </div>
    )
}

export default Header