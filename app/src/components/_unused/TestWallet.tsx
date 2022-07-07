import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useCallback, useEffect } from 'react';

function TestWallet() {
    const { publicKey, signMessage } = useWallet();

    return (
        <>
            <h1>{publicKey ? publicKey?.toString() : 'damn'}</h1>
        </>
    )
}

export default TestWallet;