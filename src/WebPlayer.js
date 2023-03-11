import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './WebPlayer.css';

function WebPlayer({ token }) {
    const [isPaused, setPaused] = useState(false);
    const [isActive, setActive] = useState(false);
    const [currentTrack, setTrack] = useState('No Song Playing');
    const [currentArtist, setArtist] = useState('No Artist');
    const [currentAlbumArt, setAlbumArt] = useState();

    useEffect(() => {
        if (token !== undefined) {
            const config = {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            };
            axios.get('https://api.spotify.com/v1/me/player', config).then(function (response) {
                console.log(response.data);
                setTrack(response.data.item.name);
                setArtist(response.data.item.artists[0].name);
                setAlbumArt(response.data.item.album.images[0].url);
                setActive(true);
            }).catch(function (error) {
                console.log(error);
            });
        } else {
            setActive(false);
        }
    }, [token]);

    return (
        <div className='WebPlayer'>
            <img className='AlbumArt' src={currentAlbumArt || '/blank-album-art.png'}></img>
            <div>
                <div>{currentTrack}</div>
                <div>{currentArtist}</div>
                <div className={`${isActive ? 'ControlButtons' : 'ControlButtonsLight'}`}><div>Back</div><div>Play</div><div>Forward</div></div>
                {!isActive && <div>Playback is not active. Start playing music on Spotify to start.</div>}
            </div>
        </div>
    );
}

export default WebPlayer