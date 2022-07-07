import { configureStore } from "@reduxjs/toolkit";

import nftSlice, { INFTState } from './slice-nft';

const store = configureStore({
    reducer: {
        nft: nftSlice
    }
});

export interface RootState {
    nft: INFTState
}

export default store;