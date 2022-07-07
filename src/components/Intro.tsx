import React from 'react';
import './Intro.css';


export function Intro() {
  return (<>
  <div className="intro-animation-wrapper">
    <div className="img">
        <img src={require('url:../assets/animated.gif')} />
    </div>
  </div>
  </>);
}

