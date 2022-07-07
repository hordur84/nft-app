import React from "react";
import classes from './FaqCard.module.css';

interface FaqCardProps {
    title: string,
    description: string,
    bullet: string[]
}

const FaqCard = (props: FaqCardProps) => {

    const bulletPoints = props.bullet.map(item => (
        <p className={`${classes.item} ${classes.margin}`}>- {item}</p>
    ));

    return (
        <div className={`${classes.container} ${classes.margin}`}>
            <p className={`${classes.title} ${classes.margin}`}>{props.title}</p>
            <p className={`${classes.description} ${classes.margin}`}>{props.description}</p>
            {bulletPoints}
        </div>
    )
}

export default FaqCard;