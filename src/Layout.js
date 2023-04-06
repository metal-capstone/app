import React from "react";
import { Outlet } from "react-router-dom";

import Header from './Header';

function Layout(props) {
    return (
        <div>
            <Header username={props.username} profilePic={props.profilePic} spotifyLogin={props.spotifyLogin} logout={props.logout} loggedIn={props.loggedIn}/>
            <Outlet context={props.loggedIn} />
        </div>
    );
}

export default Layout;