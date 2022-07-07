import React, { Fragment } from "react";
import * as idl from '../idl/koala_program.json';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Provider, Program } from "@project-serum/anchor";
import * as anchor from '@project-serum/anchor';
import * as splToken from '@solana/spl-token';
import { initialize, stake, unstake } from "../logic/Staking";
import ListNFTImproved from "./ListNFTImproved";
import { PublicKey } from "@solana/web3.js";
import { useDispatch } from "react-redux";
import { updateNFT, displayMessage, NFTStakeState } from "../store/slice-nft";

/*
{
    "imageUrl": "https://koalasd.azureedge.net/koalagen0/6a8cf6406e3d46fbab6cb478bc88ddf6f7a8d351a8e8ca5a382374af77b698d4.png",
    "traits": "stuff",
    "rarity": 100,
    "stake_time": null,
    "is_staked": false
  }
*/
type Nullable<T> = T | null;

interface TokenInfo {
    imageUrl: string;
    traits: string;
    rarity: number;
    stakeTime: Nullable<number>;
    isStaked: boolean
 }

async function getWalletContent(account: string) {

    await fetch(`https://koalas-d.azurewebsites.net/wallet/${account}`, {
        method: 'GET',
        headers: {'accept': 'application/json'} })
        .then(res => res.json())
        .then((res: TokenInfo[]) => {
            return res
    });
    
}


const AnchorTest = () => {

    const { connection } = useConnection();
    const wallet = useAnchorWallet()!;
    const dispatch = useDispatch();

    /**
     * Relevant program ID's.
     */
    const programID = idl.metadata.address;
    const systemProgramID = anchor.web3.SystemProgram.programId;
    const rentSysvarID = anchor.web3.SYSVAR_RENT_PUBKEY;
    const clockSysvarID = anchor.web3.SYSVAR_CLOCK_PUBKEY;
    const tokenProgramID = splToken.TOKEN_PROGRAM_ID;
    const associatedTokenProgramID = splToken.ASSOCIATED_TOKEN_PROGRAM_ID;

    /**
     * Anchor provider and program defined.
     */
    const provider = new Provider(connection, wallet, {preflightCommitment: 'confirmed'});
    const program = new Program(idl as anchor.Idl, programID, provider);

    /**
     * Wrapper function for initializing a staking account.
     */
    const nft_init = async () => {

        const content = await getWalletContent(provider.wallet.publicKey.toString())
        console.log("HEHREHRHERHERH");
        console.log(content);

        await initialize(
            provider.wallet.publicKey, 
            program, 
            systemProgramID, 
            rentSysvarID
        );
    }

    /**
     * Wrapper function for staking an NFT.
     * @param nftMint PublicKey. Mint address of NFT being staked.
     */
    const nft_stake = async (nftMint: PublicKey) => {

        dispatch(updateNFT({
            publicKey: nftMint.toBase58(),
            stakeState: NFTStakeState.StakingInProgress
        }));

        try {
            await nft_init();
        } catch(err) {
            new Error('Stake account already initialized')
        }

        await stake(
            provider.wallet.publicKey, 
            program, 
            nftMint, 
            tokenProgramID, 
            associatedTokenProgramID, 
            systemProgramID, 
            rentSysvarID, 
            clockSysvarID
        );

        dispatch(updateNFT({
            publicKey: nftMint.toBase58(),
            stakeState: NFTStakeState.Staked
        }));
        dispatch(displayMessage({
            message: "Staking Success",
            isActive: true
        }));
    }

    /**
     * Wrapper function for unstaking an NFT.
     * @param nftMint PublicKey. Mint address of NFT being unstaked.
     */
    const nft_unstake = async (nftMint: PublicKey) => {

        dispatch(updateNFT({
            publicKey: nftMint.toBase58(),
            stakeState: NFTStakeState.UnstakingInProgress
        }));

        await unstake(
            provider.wallet.publicKey, 
            program, 
            nftMint, 
            tokenProgramID, 
            associatedTokenProgramID, 
            clockSysvarID
        );

        dispatch(updateNFT({
            publicKey: nftMint.toBase58(),
            stakeState: NFTStakeState.Unstaked
        }));
        
        dispatch(displayMessage({
            message: "Ustaking Success",
            isActive: true
        }));
    }

    return (
        <Fragment>
            <ListNFTImproved doStake={nft_stake} doUnstake={nft_unstake} />
        </Fragment>
    )
}

export default AnchorTest;