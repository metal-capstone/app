import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './WebPlayer.css';

function WebPlayer({ token }) {
    const [isPlaying, setPlaying] = useState(false);
    const [isActive, setActive] = useState(false);
    const [currentTrack, setTrack] = useState();
    const [currentArtist, setArtist] = useState();
    const [currentAlbumArt, setAlbumArt] = useState();
    const [currentTrackLength, setTrackLength] = useState(0);
    const [currentTrackProgress, setTrackProgress] = useState(0);

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
                    if (response.status === 200) {
                        setTrack(response.data.item.name);
                        setArtist(response.data.item.artists[0].name);
                        setAlbumArt(response.data.item.album.images[0].url);
                        setPlaying(response.data.is_playing);
                        setTrackProgress(response.data.progress_ms);
                        setTrackLength(response.data.item.duration_ms);
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

    const playPauseSong = async () => {
        const config = {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        };
        if (isPlaying) {
            axios.put('https://api.spotify.com/v1/me/player/pause', {}, config).catch(function (error) {
                console.log('Error pausing song: ' + error);
            });
        } else {
            axios.put('https://api.spotify.com/v1/me/player/play', {}, config).catch(function (error) {
                console.log('Error playing song: ' + error);
            });
        }
    }

    const previousSong = async () => {
        const config = {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        };
        axios.post('https://api.spotify.com/v1/me/player/previous', {}, config).catch(function (error) {
            console.log('Error previous song: ' + error);
        });
    }

    const nextSong = async () => {
        const config = {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        };
        axios.post('https://api.spotify.com/v1/me/player/next', {}, config).catch(function (error) {
            console.log('Error next song: ' + error);
        });
    }

    const msToMinSec = (ms) => {
        const secs = Math.floor((ms / 1000) % 60);
        const mins = Math.floor((ms / 1000 / 60) % 60);
        return (secs === 60) ? (mins + 1) + ":00" : mins + ":" + (secs < 10 ? "0" : "") + secs;
    };

    return (
        <div className='WebPlayer'>
            <img className='AlbumArt' src={currentAlbumArt || '/blank-album-art.png'} alt='Album Art'></img>
            <div>
                <div>{currentTrack || 'No Song Playing'}</div>
                <div>{currentArtist || 'No Artist'}</div>
                <div>{msToMinSec(currentTrackProgress)}/{msToMinSec(currentTrackLength)}</div>
                <div className={`${isActive ? 'ControlButtons' : 'ControlButtonsLight'}`}>
                    <img src='/previous-button.svg' alt='Previous Song' onClick={previousSong}></img>
                    <img src={`${isPlaying ? '/pause-button.svg' : '/play-button.svg'}`} alt='Play or Pause' onClick={playPauseSong}></img>
                    <img src='/next-button.svg' alt='Next Song' onClick={nextSong}></img>
                </div>
                {!isActive && <div>Playback is not active. Start playing music on Spotify to start.</div>}
            </div>
        </div>
    );
}

export default WebPlayer