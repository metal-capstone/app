import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './WebPlayer.css';

function WebPlayer({ token }) {
    const [isPlaying, setPlaying] = useState(false);
    const [isActive, setActive] = useState(false);
    const [currentTrack, setTrack] = useState('No Song Playing');
    const [currentArtist, setArtist] = useState('No Artist');
    const [currentAlbumArt, setAlbumArt] = useState();

    useEffect(() => {
        const updatePlayback = async () => {
            if (token !== undefined) {
                const config = {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                };
                axios.get('https://api.spotify.com/v1/me/player/currently-playing', config).then(function (response) {
                    if (response.status == 200) {
                        setTrack(response.data.item.name);
                        setArtist(response.data.item.artists[0].name);
                        setAlbumArt(response.data.item.album.images[0].url);
                        setPlaying(response.data.is_playing);
                        setActive(true);
                    } else {
                        setActive(false);
                    }
                }).catch(function (error) {
                    console.log(error);
                    setActive(false);
                });
            } else {
                setActive(false);
            }
        };
        const interval = setInterval(() => { updatePlayback(); }, 1000);
        return () => clearInterval(interval);
    }, [token]);

    return (
        <div className='WebPlayer'>
            <img className='AlbumArt' src={currentAlbumArt || '/blank-album-art.png'}></img>
            <div>
                <div>{currentTrack}</div>
                <div>{currentArtist}</div>
                <div className={`${isActive ? 'ControlButtons' : 'ControlButtonsLight'}`}>
                    <img src='/previous-button.svg'></img>
                    <img src={`${isPlaying ? '/pause-button.svg' : '/play-button.svg'}`}></img>
                    <img src='/next-button.svg'></img>
                </div>
                {!isActive && <div>Playback is not active. Start playing music on Spotify to start.</div>}
            </div>
        </div>
    );
}

export default WebPlayer