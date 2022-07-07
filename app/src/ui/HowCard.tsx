import React from "react";
import classes from './HowCard.module.css';

interface HowCardProps {
    url: any,
    title: string,
    text: string,
    left: boolean
}

const HowCard = (props: HowCardProps) => {

    const css = `${classes.container} ${props.left ? classes.left : ""}`

    return (
        <div className={css}>
            <div className={classes.content}>
                <img src={props.url} />
                <div className={classes.textContainer}>
                    <p className={classes.title}>{props.title}</p>
                    <p className={classes.text}>{props.text}</p>
                </div>
            </div>
        </div>
        
    )
}

export default HowCard;