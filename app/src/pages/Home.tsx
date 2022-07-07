import React from 'react';
import classes from './Home.module.css';
import banner from '../../images/banner.png';
import MemberCard from '../ui/MemberCard';
import FaqCard from '../ui/FaqCard';
import HowCard from '../ui/HowCard';
import team_adam from '../../images/team/adam.png';
import discord_logo from '../../images/discord_logo_pixel.png';
import twitter_logo from '../../images/twitter_logo_pixel.png';

import * as faqs from '../data/faq.json';
import * as team from '../data/team.json';
import * as how from '../data/how.json';

function Home() {

  const faqItems = faqs.data.map(item => (
    <FaqCard title={item.title} description={item.description} bullet={item.bullet} />
  ))

  const memberItems = team.data.map(item => (
    <MemberCard url={team_adam} description={item.description} title={item.name} />
  ));

  const howItems = how.data.map(item => (
    <HowCard url={team_adam} title={item.title} text={item.description} left={item.left} />
  ));

  return (
    <div className={classes.container}>
      <div className={classes['container-1']}>
        <div className={classes['container-1-banner-wrapper']}>
          <img className={classes['container-1-banner']} src={banner} />
        </div>
        <div className={classes['container-1-title-wrapper']}>
          <p className={classes['section-title']}>KAMIKAZE KOALAS</p>
        </div>
        <div className={classes['container-1-social-wrapper']}>
          <a href="http://www.twitter.com" target="_blank" rel="noopener noreferrer" ><img src={twitter_logo}/></a>
          <a href="http://www.discord.com" target="_blank" rel="noopener noreferrer" ><img src={discord_logo}/></a>
        </div>
      </div>
      <div className={classes['container-how']}>
        <p className={[classes['section-title'], classes['section-title-margin']].join(' ')}>HOW STUFF</p>
        {howItems}
      </div>
      <div className={classes['container-2']}>
        <p className={[classes['section-title'], classes['section-title-margin']].join(' ')}>FAQ STUFF</p>
        {faqItems}
      </div>
      <div className={classes['container-3']}>
        <p className={[classes['section-title'], classes['section-title-margin']].join(' ')}>TEAM KAMIKAZE</p>
        <div className={classes['container-3-team']}>
          {memberItems}
        </div>
      </div>
    </div>
  )
}

export default Home;
