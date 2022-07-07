import { arrayBuffer } from 'node:stream/consumers';
import React, { FC, ReactNode } from 'react';
import {ProductCard} from 'react-ui-cards';
import './Images.css'

export interface NFTInfo {
    uri: string,
    onClick: Function,
    buttonText: string
}


export const Images: FC<{ nfts: NFTInfo[]}> = ({ nfts}) => {

    function createCard(nft: NFTInfo) {
        return (
            <>
            <ProductCard
                photos={[
                    nft['uri']
                ]}
                productName='Koala'
                buttonText={nft['buttonText']}
                onClick={nft['onClick']}
                url='https://github.com/nukeop'
            />
            </>
        )
    };

    return <>
        {
            nfts?.map(nft => {
                return createCard(nft);
            })
        }
    </>
}


