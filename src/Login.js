import React from "react";
import axios from 'axios';
import { useCookies } from 'react-cookie';

import Header from "./Header";

import './Login.css';

function Login() {
  const [cookie, setCookies] = useCookies(['user']);

    // button function that gets the auth url from backend and redirect to it
    const spotifyLogin = () => {
      axios.get('http://localhost:8000/spotify-login')
        .then(function (response) {
          setCookies('state', response.data.state);
          window.location.href = response.data.auth_url;
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  
    return (
      <div className="Login">
        <Header />
        <p>A chatbot that can predict what songs the user wants to listen to based on their location as well as both explicit input + analysis of users mood</p>
        <button onClick={spotifyLogin}>Login with Spotify</button>
      </div>
    );
  }
  
  export default Login;