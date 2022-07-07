import React from "react";
import classes from './MemberCard.module.css';

interface MemberCardProps {
    url: any,
    description: string,
    title: string
}

const MemberCard = (props: MemberCardProps) => {

    return (
        <div className={classes.container}>
            <img className={classes.icon} src={props.url} />
            <p className={classes.title}>{props.title}</p>
            <p className={classes.description}>{props.description}</p>
        </div>
    )
}

export default MemberCard;