import React from "react";
import { NavLink } from "react-router-dom";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import classes from './Header.module.css';
import koala_logo from '../../images/koala_logo_pixel.png';

const Header = () => {

    return (

        <div className={classes['container']}>
            <div className={classes['wrapper']}>
                <div className={classes['header-left']}>
                    <NavLink className={classes['header-link']} to='/'>
                        <img src={koala_logo} />
                    </NavLink>
                </div>
                <div className={classes['header-right']}>
                    <NavLink className={[classes['text'], classes['text-link']].join(' ')} to='/stake'>STAKE</NavLink>
                    <WalletMultiButton className={[classes['text'], classes['text-link']].join(' ')} />
                </div>
            </div>
        </div>
    )
}

export default Header;