import React from "react";
import classes from './NFTDisplay.module.css';

interface NFTDisplayProps {
    url: string,
    func: (mint: string) => void,
    mint: string
}

const NFTDisplay = (props: NFTDisplayProps) => {

    const clickHandler = () => {

        console.log(props.mint);
        props.func(props.mint);
    }

    return (
        <div onClick={clickHandler} className={classes['nftcard-container']}>
            <img className={classes['nftcard-image']} src={props.url}></img>
        </div>
    )
}

export default NFTDisplay;