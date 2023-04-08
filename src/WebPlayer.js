import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './WebPlayer.css';

// Component that is displayed on the dashboard, shows the album cover, song name, artist name,
// and song time for current playback. Gives user playback control with buttons that are enabled when active.
// Receives token as a prop for spotify playback requests.
function WebPlayer({ token }) {
    const [isPlaying, setPlaying] = useState(false);
    const [isActive, setActive] = useState(false);
    const [currentTrack, setTrack] = useState();
    const [currentArtist, setArtist] = useState();
    const [currentAlbumArt, setAlbumArt] = useState();
    const [currentTrackLength, setTrackLength] = useState(0);
    const [currentTrackProgress, setTrackProgress] = useState(0);

    // Whenever token is changed, create an interval to update the playback every second
    useEffect(() => {
        const interval = setInterval(() => { updatePlayback(); }, 1000);
        return () => clearInterval(interval);
    }, [token]);

    // Function to generate user header for various spotify requests
    const getUserHeader = () => {
        return {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        };
    }

    // Function that will updated the playback info in the component, requests spotify and sets active status.
    const updatePlayback = () => {
        if (token !== undefined) { // Only request if there is a token
            const config = getUserHeader();
            axios.get('https://api.spotify.com/v1/me/player/currently-playing', config).then(function (response) {
                // If playback request is valid, set state. Otherwise set inactive
                if (response.status === 200) { // Check if playback is active, is 204 if not
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
                setActive(false);
                console.error(error);
            });
        } else {
            setActive(false);
        }
    };

    // button function to play or pause the current song
    const playPauseSong = () => {
        const config = getUserHeader();
        if (isPlaying) { // If playing, pause the song. If paused, play.
            axios.put('https://api.spotify.com/v1/me/player/pause', {}, config).catch(function (error) {
                console.error('Error pausing song: ' + error);
            });
        } else {
            axios.put('https://api.spotify.com/v1/me/player/play', {}, config).catch(function (error) {
                console.error('Error playing song: ' + error);
            });
        }
    }

    // button function to play previous song
    const previousSong = () => {
        const config = getUserHeader();
        axios.post('https://api.spotify.com/v1/me/player/previous', {}, config).catch(function (error) {
            console.error('Error previous song: ' + error);
        });
    }

    // button function to play next song
    const nextSong = () => {
        const config = getUserHeader();
        axios.post('https://api.spotify.com/v1/me/player/next', {}, config).catch(function (error) {
            console.error('Error next song: ' + error);
        });
    }

    // function that takes in a number of milliseconds and returns a equivalent string of the mins and secs
    const msToMinSec = (ms) => {
        const secs = Math.floor((ms / 1000) % 60);
        const mins = Math.floor((ms / 1000 / 60) % 60);
        return (secs === 60) ? (mins + 1) + ":00" : mins + ":" + (secs < 10 ? "0" : "") + secs; // Check so 59 secs is limit
    };

    return (
        <div className='WebPlayer'>
            {/* If state is set display it, if not display default art, track, artist */}
            <img className='AlbumArt' src={currentAlbumArt || '/blank-album-art.png'} alt='Album Art'></img>
            <div>
                <div>{currentTrack || 'No Song Playing'}</div>
                <div>{currentArtist || 'No Artist'}</div>
                <div>{msToMinSec(currentTrackProgress)}/{msToMinSec(currentTrackLength)}</div>
                {/* If not active grey out buttons and let user know, display pause or play when relevant */}
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