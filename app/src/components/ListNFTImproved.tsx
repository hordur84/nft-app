import React, { useEffect } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { getNFTData, selectItem } from "../store/slice-nft";
import NFTCard from "../ui/NFTCard";
import NFTDisplay from "../ui/NFTDisplay";
import classes from './ListNFTImproved.module.css';
import { PublicKey } from "@solana/web3.js";
import koala_logo from '../../images/koala_logo.png';
import base58 from "bs58";
import { sign } from 'tweetnacl';

interface ListNFTImprovedProps {
    doStake: (key: PublicKey) => void,
    doUnstake: (key: PublicKey) => void
}

interface Response {
    result: boolean;
    details: string;
 }

async function StartMission(publicKey: PublicKey, signMessage: any, mint: string) {
    if(await MaybeAuthenticate(publicKey, signMessage)){
        const mission = await fetch('https://koalas-d.azurewebsites.net/mission/start', {
            method: 'POST',
            headers: {'accept': 'application/json', 'content-type': 'application/json'},
            body: JSON.stringify({walletAddress: publicKey.toString(), tokenAddress: mint})
        },)
        .then(res => res.json())
        .then((res: string) => {
            return res
        });
        console.log(mission);
        return true;
    }
    console.log('Not authenticated..');
    return false;
}

async function MaybeAuthenticate(publicKey: PublicKey, signMessage: any) {
    // Ask API for credentials
    const check = await fetch(`https://koalas-d.azurewebsites.net/wallet/isAuthenticated/${publicKey.toString()}`, {
        method: 'GET',
        headers: {'accept': 'application/json'} })
        .then(res => res.json())
        .then((res: Response) => {
            return res.result
    });

    if(check){
        console.log('Wallet already authenticated')
        return true;
    }

    if(!check){
        // We need to authenticate, create message to sign
        const signature = await SignMsg(publicKey, signMessage, 'Koalas bleed testosterone')

        const authenticate = await fetch('https://koalas-d.azurewebsites.net/wallet/authenticate', {
            method: 'POST',
            headers: {'accept': 'application/json', 'content-type': 'application/json'},
            body: JSON.stringify({walletAddress: publicKey.toString(), signature: signature})
        },)
        .then(res => res.json())
        .then((res: Response) => {
            return res
        });

        if(!authenticate.result) {
            console.error(authenticate.details)
            return false
        }

        console.log('Wallet authenticated')
        return true;
    }

}

async function SignMsg (publicKey: PublicKey, signMessage: any, msg: string) {
    try {
      // `publicKey` will be null if the wallet isn't connected
      if (!publicKey) {
        console.error("Wallet not connected!")
        return false
      }
      // `signMessage` will be undefined if the wallet doesn't support it
      if (!signMessage) {
        console.error("Wallet does not support message signing!")
        return false
      }
  
      // Encode anything as bytes
      const message = new TextEncoder().encode(msg)
      // Sign the bytes using the wallet
      const signature = await signMessage(message)
      // Verify that the bytes were signed using the private key that matches the known public key
      if (!sign.detached.verify(message, signature, publicKey.toBytes())) {
        console.error("Invalid signature!")
        return false
      }
      console.log(`Message signature: ${base58.encode(signature)}`)
      return base58.encode(signature)
    } catch (error: any) {
      console.log(`Signing failed: ${error?.message}`)
      return false
    }
  }

const ListNFTImproved = (props: ListNFTImprovedProps) => {

    const { publicKey, signMessage } = useWallet();
    const { connection } = useConnection();
    const dispatch = useDispatch();

    const items = useSelector((state: RootState) => state.nft.items);
    const itemsLoaded = useSelector((state: RootState) => state.nft.itemsLoaded);
    const displayMessage = useSelector((state: RootState) => state.nft.displayInformation);
    const selectedItem = useSelector((state: RootState) => state.nft.selectedItem);
    const itemSelected = useSelector((state: RootState) => state.nft.itemSelected);

    useEffect(() => {

        if (!publicKey) return;

        dispatch(getNFTData(publicKey));

    }, [publicKey, connection, dispatch])

    const displayNFT = (mint: string) => {

        const filtered = items.find(item => item.mint == mint);
        
        if (!filtered) return;
        dispatch(selectItem(filtered));
    }

    const displayCards = items.map(item => (
        <NFTDisplay 
            key={item.mint}
            url={item.url} 
            func={displayNFT}
            mint={item.mint} />
    ))
    
    const startMission = async (mint: string) => {
        if (!publicKey) return;
        await StartMission(publicKey, signMessage, mint);
    }

    const selectedCard = (
        <NFTCard
            key={selectedItem.mint}
            name={selectedItem.name}
            url={selectedItem.url}
            availableMissions={selectedItem.availableMissions}
            mint={selectedItem.mint}
            state={selectedItem.stakeState}
            doAction={selectedItem.isStaked ? props.doUnstake : props.doStake} 
            doBattle={startMission}/>
    );

    return (
        <div className={classes.main}>
            <div className={classes.container}>
                {displayMessage.isActive && <div className={classes['confirmation-container']}>
                    <p className={classes['confirmation-message']}>{displayMessage.message}</p>
                </div>}
                {publicKey && !itemsLoaded && <div className={classes['loader-container']}>
                    <p className={classes['loader-text']}>Calling Solana... </p>
                    <img className={classes['loader-img']} src={koala_logo} />
                </div>}
                <div className={classes.content}>
                    <div className={classes.nftlist}>
                        {displayCards}
                    </div>
                    <div className={classes.nftselection}>
                        {itemSelected && selectedCard}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListNFTImproved;