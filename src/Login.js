import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import './Login.css';

// Login page that has info on the project and a link to dashboard or to login.
function Login(props) {
  const loggedIn = useOutletContext(); // Get loggedIn from layout
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  // Checks and sets if there is an error in the params
  useEffect(() => {
    let errorCode = searchParams.get('error');
    if (errorCode !== null) {
      setError('Error: (' + errorCode + ') Please try to login again.');
    }
  }, [searchParams]);

  return (
    <div className="Login">
      <p>A chatbot that can predict what songs the user wants to listen to based on their location as well as both explicit input + analysis of users mood</p>
      <p className="ErrorText">{error}</p>
      {/* Display dashboard link or log in button depending on logged in state */}
      { loggedIn ? <Link to="/dashboard"><button>Go to Dashboard</button></Link> : <button onClick={props.spotifyLogin}>Login with Spotify</button>}
    </div>
  );
}

export default Login;