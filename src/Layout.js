import React from "react";
import { Outlet } from "react-router-dom";

import Header from './Header';

// Simple layout component for all pages, puts header at top and rest of page below.
// Gets props from app, passes if logged in to all outlets.
function Layout(props) {
    return (
        <div>
            <Header username={props.username} profilePic={props.profilePic} spotifyLogin={props.spotifyLogin} logout={props.logout} loggedIn={props.loggedIn}/>
            <Outlet context={props.loggedIn} />
        </div>
    );
}

export default Layout;