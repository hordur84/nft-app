import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import * as anchor from '@project-serum/anchor';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import * as idl from '../idl/koala_program.json';

export const PROGRAM_ID = idl.metadata.address;

/**
 * 
 * @param owner PublicKey. Owner of the stake account.
 * @param programID PublicKey. Staking program ID.
 */
export const getStakeAccount = async (owner: PublicKey, programID: PublicKey) => {
    const [stakeAccount, stakeAccountBump] = await anchor.web3.PublicKey.findProgramAddress([
        owner.toBuffer()
        ],
        programID)
    return stakeAccount;
};

/**
 * Initialize a stake account.
 * @param owner PublicKey. Owner of the stake account.
 * @param program PublicKey. Staking program ID.
 * @param systemProgram PublicKey. System program ID.
 * @param rent PublicKey. Rent sysvar.
 */
export const initialize = async (
    owner: PublicKey,
    program: Program,
    systemProgram: PublicKey,
    rent: PublicKey) => {

    const [stakeAccount, stakeAccountBump] = 
        await anchor.web3.PublicKey.findProgramAddress([
            owner.toBuffer()
        ],
        program.programId
    );

    await program.rpc.initializeStakeAccount(stakeAccountBump, {
        accounts: {
            owner,
            stakeAccount,
            systemProgram,
            rent
        },
        signers: []
    });
}

/**
 * Stake NFT. Transfer NFT authority from owner to stake account.
 * @param owner PublicKey. Owner of the stake account.
 * @param program PublicKey. Staking program ID.
 * @param nftMint PublicKey. NFT mint address.
 * @param tokenProgram PublicKey. Token program ID.
 * @param associatedTokenProgramID PublicKey. Associated token program ID.
 * @param systemProgram PublicKey. System program ID.
 * @param rent PublicKey. Rent sysvar.
 * @param clock PublicKey. Clock sysvar.
 */
export const stake = async (
    owner: PublicKey,
    program: Program,
    nftMint: PublicKey,
    tokenProgram: PublicKey,
    associatedTokenProgramID: PublicKey,
    systemProgram: PublicKey,
    rent: PublicKey,
    clock: PublicKey) => {

    const [stakeAccount, stakeAccountBump] = 
        await anchor.web3.PublicKey.findProgramAddress([
            owner.toBuffer()
        ],
        program.programId
    );

    const nftTokenAccount = await findAssociatedTokenAddress(owner, nftMint, tokenProgram, associatedTokenProgramID);

    const nftMetadata = await Metadata.getPDA(nftMint);

    await program.rpc.stakeNft({
        accounts: {
            owner: owner,
            stakeAccount,
            nftMint: nftMint,
            nftTokenAccount,
            tokenProgram,
            systemProgram,
            rent,
            clock
        },
        remainingAccounts: [
            {pubkey: nftMetadata, isSigner: false, isWritable: false } // can access this in lib.rs. can do metadata check. TODO
        ],
        signers: []
    })
    console.log('finished staking...');
}

/**
 * Unstake NFT. Transfar NFT authority from stake account to owner.
 * @param owner PublicKey. Owner of the stake account.
 * @param program PublicKey. Staking program ID.
 * @param nftMint PublicKey. NFT mint address.
 * @param tokenProgram PublicKey. Token program ID.
 * @param associatedTokenProgram PublicKey. Associated token program ID.
 * @param clock PublicKey. Clock sysvar.
 */
export const unstake = async (
    owner: PublicKey,
    program: Program,
    nftMint: PublicKey,
    tokenProgram: PublicKey,
    associatedTokenProgram: PublicKey,
    clock: PublicKey) => {

    const [stakeAccount, stakeAccountBump] = 
        await anchor.web3.PublicKey.findProgramAddress([
            owner.toBuffer()
        ],
        program.programId
    );

    const nftTokenAccount = await findAssociatedTokenAddress(owner, nftMint, tokenProgram, associatedTokenProgram);

    await program.rpc.unstakeNft({
        accounts: {
          owner,
          stakeAccount,
          nftMint,
          nftTokenAccount,
          tokenProgram,
          clock
        },
        signers: []
      });
      console.log('finished unstaking...');
}

/**
 * Find the associated token address.
 * @param owner PublicKey. Account address
 * @param tokenMintAddress PublicKey. NFT mint address.
 * @param tokenProgramID PublicKey. Token program ID.
 * @param associatedTokenProgramID PublicKey. Associated token program ID.
 * @returns Associated token account address for a given account and mint address.
 */
const findAssociatedTokenAddress = async (
    owner: PublicKey, 
    tokenMintAddress: PublicKey,
    tokenProgramID: PublicKey,
    associatedTokenProgramID: PublicKey): Promise<PublicKey> => {
    return (
        await PublicKey.findProgramAddress([
            owner.toBuffer(),
            tokenProgramID.toBuffer(),
            tokenMintAddress.toBuffer()
        ],
        associatedTokenProgramID
    ))[0];
}