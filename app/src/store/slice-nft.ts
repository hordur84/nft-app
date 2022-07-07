import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PublicKey } from '@solana/web3.js';



type Nullable<T> = T | null;


interface NFTAttributes {
    trait_type: string,
    value: string
}

export interface NFTData {
    name: string,
    mint: string
    url: string,
    attributes: NFTAttributes[],
    rank: number,
    stakeTime: number,
    availableMissions: number,
    isStaked: boolean,
    stakeState: NFTStakeState
};

interface NFTMessage {
    message: string,
    isActive: boolean
}

interface NFTStateAction {
    publicKey: string,
    stakeState: NFTStakeState
}


export enum NFTStakeState {
    Staked,
    StakingInProgress,
    Unstaked,
    UnstakingInProgress
}

export interface INFTState {
    items: NFTData[],
    selectedItem: NFTData,
    itemsLoaded: boolean,
    itemSelected: boolean,
    displayInformation: NFTMessage
}

const initialState: INFTState = {
    items: [],
    selectedItem: {
        name: '',
        mint: '',
        url: '',
        attributes: [],
        rank: -1,
        stakeTime: 0,
        availableMissions: 0,
        isStaked: false,
        stakeState: NFTStakeState.Staked,
    },
    itemsLoaded: false,
    itemSelected: false,
    displayInformation: { message: "", isActive:false }
}

async function getWalletContent(account: string) {

    const content: NFTData[] = await fetch(`https://koalas-d.azurewebsites.net/wallet/${account}`, {
        method: 'GET',
        headers: {'accept': 'application/json'} })
        .then(res => res.json());
    return content;
    
}

const nftSlice = createSlice({
    name: 'nft',
    initialState: initialState,
    reducers: {
        selectItem(state, action: PayloadAction<NFTData>) {
            const existing = state.items.find(item => item.mint == action.payload.mint);
            if (!existing) return;
            state.selectedItem = existing;
            state.itemSelected = true;
        },
        populateNFTs(state, action: PayloadAction<NFTData>) {
            const existing = state.items.find(item => item.mint == action.payload.mint);
            if (existing) return;
            state.items.push({
                name: action.payload.name,
                url: action.payload.url,
                mint: action.payload.mint,
                attributes: action.payload.attributes,
                rank: action.payload.rank,
                availableMissions: action.payload.availableMissions,
                isStaked: action.payload.isStaked,
                stakeTime: action.payload.stakeTime,
                stakeState: action.payload.isStaked ? NFTStakeState.Staked : NFTStakeState.Unstaked
            });
        },
        updateNFT(state, action: PayloadAction<NFTStateAction>) {
            const item = state.items.find(item => item.mint == action.payload.publicKey)!;
            state.items = state.items.filter(item => item.mint != action.payload.publicKey);

            let isStaked = item.isStaked
            if (action.payload.stakeState == NFTStakeState.Staked) {
                isStaked = true;
            }
            if (action.payload.stakeState == NFTStakeState.Unstaked) {
                isStaked = false;
            }

            state.items.push({
                name: item?.name,
                url: item?.url,
                mint: item?.mint,
                attributes: item?.attributes,
                rank: item?.rank,
                availableMissions: item?.availableMissions,
                isStaked: isStaked,
                stakeTime: item?.stakeTime,
                stakeState: action.payload.stakeState
            });

            state.selectedItem = {
                name: item?.name,
                url: item?.url,
                mint: item?.mint,
                attributes: item?.attributes,
                rank: item?.rank,
                availableMissions: item?.availableMissions,
                isStaked: isStaked,
                stakeTime: item?.stakeTime,
                stakeState: action.payload.stakeState
            };

            /**
             * Items should be sorted in some order.
             */
            state.items.sort((a, b) => {
                return a.mint.localeCompare(b.mint);
            })
        },
        doItemsLoaded(state, action: PayloadAction<boolean>) {
            state.itemsLoaded = action.payload;
        },
        doMessageDisplay(state, action: PayloadAction<NFTMessage>) {
            state.displayInformation.isActive = action.payload.isActive;
            state.displayInformation.message = action.payload.message;
        }
    }
})

// async function getWalletContent(account: string) {

//     const content: NFTData[] = await fetch(`http://localhost:8000/nftwallet/${account}`, {
//         method: 'GET',
//         headers: {'accept': 'application/json'} })
//         .then(res => res.json());
//     return content;
    
// }

export const displayMessage = (info: NFTMessage) => {
    return async (dispatch: any) => {

        dispatch(nftSlice.actions.doMessageDisplay({
            message: info.message,
            isActive: info.isActive,
        }));

        setTimeout(() => {
            dispatch(nftSlice.actions.doMessageDisplay({
                message: "",
                isActive: false
            }));
        }, 2000);
    }
}

export const getNFTData = (publicKey: PublicKey) => {
    return async (dispatch: any) => {
        
        const nfts = await getWalletContent(publicKey.toString());

        dispatch(nftSlice.actions.doItemsLoaded(true));

        nfts.sort((a, b) => {
                return a.mint.localeCompare(b.mint);
            })
            .map(item => {
                dispatch(nftSlice.actions.populateNFTs(item));
        });
    }
}

export const { updateNFT, selectItem } = nftSlice.actions;

export default nftSlice.reducer;