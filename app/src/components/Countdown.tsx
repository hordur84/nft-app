import { time } from "console";
import React from "react";
import { useEffect, useState } from "react";

interface Countdown {
    days: number,
    hours: number,
    minutes: number,
    seconds: number
}

const Countdown = () => {

    const calculateTimeLeft = () => {

        let year = new Date().getFullYear();

        const difference = +new Date(`02/16/${year}`) - +new Date();

        let timeLeft: Countdown = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000*60*60*24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }

        return timeLeft;
    }

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    return (
        <div>
            <p>{timeLeft.days} day(s)</p>
            <p>{timeLeft.hours} hour(s)</p>
            <p>{timeLeft.minutes} minute(s)</p>
            <p>{timeLeft.seconds} second(s)</p>
        </div>
    )
}

export default Countdown;

