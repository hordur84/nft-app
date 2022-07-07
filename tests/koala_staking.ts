import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { KoalaProgram } from '../target/types/koala_program';
import * as splToken from '@solana/spl-token';
import { mintNFT, transferMint } from './mintNFT';
import { Metadata, UpdatePrimarySaleHappenedViaToken } from '@metaplex-foundation/mpl-token-metadata';

describe('koala_staking', () => {

  anchor.setProvider(anchor.Provider.env());
  const provider = anchor.getProvider();

  const program = anchor.workspace.KoalaProgram as Program<KoalaProgram>;
  const systemProgram = anchor.web3.SystemProgram.programId;
  const rentSysvar = anchor.web3.SYSVAR_RENT_PUBKEY;
  const clockSysvar = anchor.web3.SYSVAR_CLOCK_PUBKEY;

  describe('end to end test', async () => {

    const owner = anchor.web3.Keypair.generate();
    const creator = anchor.web3.Keypair.generate();

    let nftMint: splToken.Token = null;
    let nftTokenAccount: anchor.web3.PublicKey = null;

    const [stakeAccount, stakeAccountBump] = 
      await anchor.web3.PublicKey.findProgramAddress([
        owner.publicKey.toBuffer()
      ],
      program.programId
      );
    
    before(async () => {
      console.log("airdropping to owner");
      //airdrop tokens
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(owner.publicKey, 1000000000),
        "confirmed"
      );

      console.log("minting NFT");
      [nftMint, nftTokenAccount] = await mintNFT(
        provider.connection,
        owner,
        creator
      );
    });

    it('init', async () => {

      console.log('owner: ', owner.publicKey.toBase58());
      console.log('creator: ', creator.publicKey.toBase58());

      console.log('nftMint: ', nftMint.publicKey.toBase58());

      console.log('nftTokenAccount: ', nftTokenAccount.toBase58());
      const myWallet = new anchor.web3.PublicKey("Gxjgn18ZE77aaJKGtmhgAnEf35dTCV5BZrpJ8zuJ7wEG");
      const fromTokenAccount = await nftMint.getOrCreateAssociatedAccountInfo(owner.publicKey);
      console.log('fromTokenAccount: ', fromTokenAccount.address.toBase58());
      const toTokenAccount = await nftMint.getOrCreateAssociatedAccountInfo(myWallet);
      console.log('toTokenAccount: ', toTokenAccount.address.toBase58());

      //---------------------------------------------------------------------

      console.log("Initialize stake account...");

      console.log('stakeAccountBunp: ', stakeAccountBump);
      console.log('stakeAccount: ', stakeAccount.toBase58());

      await program.rpc.initializeStakeAccount(stakeAccountBump, {
        accounts: {
          owner: owner.publicKey,
          stakeAccount: stakeAccount,
          systemProgram: systemProgram,
          rent: rentSysvar,
        },
        signers: [owner]
      });

      let test = await program.account.nftStakeAccount.fetch(stakeAccount);
      console.log('bump: ', test.bump);
      console.log('Staked: ', test.numStaked);
      console.log('owner: ', test.owner.toBase58());

      //------------------------------------------------------------------------

      console.log('Stake NFT...');

      const nftMetadata = await Metadata.getPDA(nftMint.publicKey);

      console.log('nftMetadata key: ', nftMetadata.toBase58());

      await program.rpc.stakeNft({
        accounts: {
          owner: owner.publicKey,
          stakeAccount,
          nftMint: nftMint.publicKey,
          nftTokenAccount,
          tokenProgram: splToken.TOKEN_PROGRAM_ID,
          systemProgram,
          rent: rentSysvar,
          clock: clockSysvar
        },
        remainingAccounts: [
          {pubkey: nftMetadata, isSigner: false, isWritable: false } // can access this in lib.rs. can do metadata check.
        ],
        signers: [owner]
      })

      let nftAccount = await nftMint.getAccountInfo(nftTokenAccount);

      console.log('nftAccountOwner: ', nftAccount.owner.toBase58());
      console.log('stakeAccount: ', stakeAccount.toBase58());

      test = await program.account.nftStakeAccount.fetch(stakeAccount);
      console.log('Staked: ', test.numStaked);

      // --------------------------------------------------------------------------

      console.log('Unstake NFT...');

      await sleep(provider.connection, 1);

      await program.rpc.unstakeNft({
        accounts: {
          owner: owner.publicKey,
          stakeAccount,
          nftMint: nftMint.publicKey,
          nftTokenAccount,
          tokenProgram: splToken.TOKEN_PROGRAM_ID,
          clock: clockSysvar
        },
        signers: [owner]
      });

      nftAccount = await nftMint.getAccountInfo(nftTokenAccount);
      console.log('nftAccountOwner: ', nftAccount.owner.toBase58());
      console.log('owner: ', owner.publicKey.toBase58());

      test = await program.account.nftStakeAccount.fetch(stakeAccount);
      console.log('Staked: ', test.numStaked);

      //----------------------------------------------------------------------------

      // console.log('Transfer mint to another account.');

      // console.log('fromTokenAccountOwner: ', fromTokenAccount.owner.toBase58());
      // console.log('toTokenAccountOwner: ', toTokenAccount.owner.toBase58());
      // console.log('owner: ', owner.publicKey.toBase58());
      // console.log('creator: ', creator.publicKey.toBase58());

      // const [tx, signtx] = await transferMint(provider.connection, fromTokenAccount, toTokenAccount, owner);
      // console.log('tx: ', tx);
      // console.log('signtx: ', signtx);

      //--------------------------------------------------------------------------
    });
  });
});

// Polls the network and returns once the block time has increased by seconds.
const sleep = async (
  connection: anchor.web3.Connection,
  seconds: number,
  startTime: number | null = null
) => {
  let time = startTime;
  if (time == null) {
    let slot = await connection.getSlot();
    time = await connection.getBlockTime(slot);
  }
  let elapsed = 0;
  while (elapsed < seconds) {
    let slot = await connection.getSlot();
    let newTime = await connection.getBlockTime(slot);
    elapsed += newTime - time;
    time = newTime;
  }
};