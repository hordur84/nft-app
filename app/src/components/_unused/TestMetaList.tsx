import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useCallback, useState } from 'react';
import * as metaplex from '@metaplex/js';
import {Images} from './Images';

export const Wallet: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [uris, setUris] = useState([]);
    const { Metadata } = metaplex.programs.metadata;

    async function fetchContent() {
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
        )
    }

    // Fetch content if needed
    useCallback(fetchContent, [publicKey, sendTransaction, connection]);

    return (
        <>
            <div className="wallet-images-wrapper">
                <Images uris={uris}></Images>
            </div>
        </>
    );
};