import React from 'react'
import './Header.css';

function Header(props) {

    // TODO: Fix prof pic css to look good for width>height images
    return (
        <div className="Header">
            <a href="/"><h1>Spotify Chatbot</h1></a>
            <div className='UserCard'>
                <p>{props.username || 'No User'}</p>
                <div className="ProfilePicCropper">
                    <img className="ProfilePic" src={props.profilePic || '/blank-profile-picture.png'}></img>
                </div>
            </div>
        </div>
    )
}

export default Header