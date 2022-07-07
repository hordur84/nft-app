import { PublicKey } from "@solana/web3.js";
import React from "react";
import classes from './NFTCard.module.css';
import { NFTStakeState } from '../store/slice-nft'

interface NFTCardProps {
    key: string,
    name: string,
    url: string, 
    mint: string,
    state: NFTStakeState,
    availableMissions: number,
    doAction: (key: PublicKey) => void
    doBattle: (mint: string) => void
}

interface NFTButtonState {
    title: string,
    isActive: boolean
}

const NFTCard = (props: NFTCardProps) => {

    const getBtnState = () : NFTButtonState => {
        console.log('this was run');
        switch(props.state)
        {
            case NFTStakeState.Staked:
                return { title: 'UNSTAKE', isActive: true }

            case NFTStakeState.StakingInProgress:
                return {title: 'STAKING...', isActive: false}

            case NFTStakeState.Unstaked:
                return {title: 'STAKE', isActive: true}

            case NFTStakeState.UnstakingInProgress:
                return {title: 'UNSTAKING...', isActive: false}
        }
    };

    const onFunc = async () => {

        console.log('Send program rpc stake using mint: ', props.mint);
        const mint = new PublicKey(props.mint);
        props.doAction(mint);
    };

    const btnState = getBtnState();
    const onBattle = async () => {
        console.log(props.availableMissions)
        props.doBattle(props.mint);
    }


    return (
        <div className={classes['nftcard-container']}>
            <img className={classes['nftcard-image']} src={props.url}></img>
            <div className={classes['nftcard-content']}>
                <h3 className={classes['nftcard-title']}>{props.name}</h3>
                <div className={classes['nftcard-button-container']}>
                    <button disabled={!btnState?.isActive} onClick={onFunc} className={classes['nftcard-button']}>{btnState?.title}</button>
                    <button disabled={props.availableMissions < 1} onClick={onBattle} className={classes['nftcard-button']}>Enroll</button>
                </div>
            </div>
        </div>
    )
}

export default NFTCard;