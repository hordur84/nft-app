import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useCallback, useEffect, useState } from 'react';
import * as metaplex from '@metaplex/js';
import {Images, NFTInfo} from './Images';
import './Wallet.css';

const EXAMPLES: string [] = [
    "https://koalasd.azureedge.net/koalagen0/1db17523b9767e7a91fc38f1d914f68e6e26e01f13c0643fb78193d3cbc31e4a.png",
    "https://koalasd.azureedge.net/koalagen0/1e0f9b1f32a7720f791e71cba753173413e03373b2d45b572e41b0b3769458b3.png",
    "https://koalasd.azureedge.net/koalagen0/4096a25462b0e19213400f79db8fa3b88f4db559643503acb45af090ef77a4e2.png",
    "https://koalasd.azureedge.net/koalagen0/48cccda8d58509134d75d1a46f798ddfe788fa389da7e27a273025b36e20c8da.png",
    "https://koalasd.azureedge.net/koalagen0/53a39f6c38f933d0375fd7b7112e7550169e0a18fb42c93d4a72dde3da0425bc.png",
    "https://koalasd.azureedge.net/koalagen0/60f8c1fb7c07c00addfc6ccc86876f8410b168fcfa4913cffc5eaad6c6205a4b.png",
    "https://koalasd.azureedge.net/koalagen0/69cb9390eaf6182c1ae2d36dfd5283abeee6cb1c7ffd1c6fcb44e0fc980bded6.png",
    "https://koalasd.azureedge.net/koalagen0/9d2d1d8abf946236640fbfe2dd8565ae8f9bc67ab212ad0ade37d057d462b6fd.png",
    "https://koalasd.azureedge.net/koalagen0/b6f293105d8e855616713bba9f65ab571877f0e85280d9538340af2761756e24.png",
    "https://koalasd.azureedge.net/koalagen0/baff1e4196b3721546a1b1fad81fc8b16e29d6bb729ad5698e36d6955162e31c.png",
    "https://koalasd.azureedge.net/koalagen0/c389ac7ab0c60b8774b00734d587bc8196c9c938d7a06d157ad09f0cc8023edc.png",
    "https://koalasd.azureedge.net/koalagen0/deba3a511e6f23a86c7704db14559bde7180f71e188fd926b3f2c9c6720fcf7d.png",
    "https://koalasd.azureedge.net/koalagen0/ef0a3814fe04fc692ce9294e0e78d2d352c440ee630682c332aada4210a1fc8b.png",
    "https://koalasd.azureedge.net/koalagen0/f5fbc03fccfe385ffbc38a0b6aa5f83b39376b4e6726a8fdf561aa0b1fb935ac.png",
];
var count = 0;

const NFT_INFO: NFTInfo[] = EXAMPLES.map(
    ex => {
        count++;
        var text = count % 2 == 0 ? 'Stake' : 'Unstake';
        function onClick () {
            console.log(text);
        }
        let info: NFTInfo = { uri: ex, onClick: onClick,  buttonText: text}
        return info;
    }
)

export const Wallet: FC = () => {
    
    const { publicKey, sendTransaction } = useWallet();
    const [uris, setUris] = useState<NFTInfo[]>([]);
    const { connection } = useConnection();
    const { Metadata } = metaplex.programs.metadata;
    console.log('here...');
    console.log(publicKey);
    console.log('done...');

    const fetchWalletContent = useCallback(() => {
        if (!publicKey) return;
        setUris(NFT_INFO);
        }, [publicKey]
    )

    /* SLOW TO LOAD USING DEMO DATA NOW
    const fetchWalletContent = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        console.log("Fetching metadata...")
        // Emptying the uris
        setUris([]);
        const metadatas = await Metadata.findByOwnerV2(connection, publicKey);
        console.log(metadatas)

        console.log("Displaying metadata...")

        await Promise.all(
            metadatas.map(async (metadata) => {
                const data = await Metadata.load(connection, metadata.pubkey);
                setUris(uris => [...uris, data.data.data.uri.replace('.json', '.png')]);
            })
        )}, [publicKey])*/

      useEffect(() => {
        fetchWalletContent()
      }, [fetchWalletContent])
      


    return (
        <>
            <div className="wallet-images-wrapper">
                <Images nfts={uris}></Images>
            </div>
        </>
    );
};