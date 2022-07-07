import React from 'react';
import './Intro.css';

export function Intro() {
    return (<>
      <div className='about-wrapper'>
        <div className="about-image">
          <img src={require('url:../assets/animated.gif')} />
        </div>
        <div className="about-text">
          <p>
            6666 Kamakazi Koalas are sick of the uneven gains of their fellow citizens and have decided to take matter into their own hands.
            With bravery, wisdom and loads of testosterone they are going to do everything in their power to gain superiority again.
            Will your Koala become a hero or just another cog in the machine?
          </p>
        </div>
      </div>
    </>);
}
