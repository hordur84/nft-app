import * as splToken from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import { programs, actions, NodeWallet } from '@metaplex/js';

export const transferMint = async (
  connection: anchor.web3.Connection,
  fromTokenAccount: splToken.AccountInfo,
  toTokenAccount: splToken.AccountInfo,
  owner: anchor.web3.Keypair
): Promise<[anchor.web3.Transaction, string]> => {

  const transferTx = new anchor.web3.Transaction()
    .add(
      splToken.Token.createTransferInstruction(
        splToken.TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        toTokenAccount.address,
        owner.publicKey,
        [],
        1
      )
    );
  const signTx = await anchor.web3.sendAndConfirmTransaction(
    connection,
    transferTx,
    [owner]
  )
  return [transferTx, signTx];
}

// Create mint and mint token account with meta data.
export const mintNFT = async (
    connection: anchor.web3.Connection,
    owner: anchor.web3.Keypair,
    creator: anchor.web3.Keypair,
  ): Promise<[splToken.Token, anchor.web3.PublicKey]> => {
    console.log("Creating NFT mint");

    const mintKeypair = anchor.web3.Keypair.generate();
    const mintBalance = await splToken.Token.getMinBalanceRentForExemptMint(connection);

    const tx = new anchor.web3.Transaction();

    // Add create account instruction.
    tx.add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: owner.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        lamports: mintBalance,
        space: splToken.MintLayout.span,
        programId: splToken.TOKEN_PROGRAM_ID
      })
    );

    // Add init mint instruction.
    tx.add(
      splToken.Token.createInitMintInstruction(
        splToken.TOKEN_PROGRAM_ID,
        mintKeypair.publicKey,
        0,
        owner.publicKey,
        null
      )
    );

    // Add create token account instruction.
    const nftTokenAccount = await splToken.Token.getAssociatedTokenAddress(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      mintKeypair.publicKey,
      owner.publicKey,
      false
    );

    tx.add(
      splToken.Token.createAssociatedTokenAccountInstruction(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        mintKeypair.publicKey,
        nftTokenAccount,
        owner.publicKey,
        owner.publicKey
      )
    );

    // Add mint to instruction.
    tx.add(
      splToken.Token.createMintToInstruction(
        splToken.TOKEN_PROGRAM_ID,
        mintKeypair.publicKey,
        nftTokenAccount,
        owner.publicKey,
        [],
        1
      )
    );

    const txSig = await connection.sendTransaction(tx, [owner, mintKeypair]);
    await connection.confirmTransaction(txSig, "confirmed");

    // Create meta data.
    const metadataTX = await actions.createMetadata({
      connection: connection,
      wallet: new NodeWallet(owner),
      editionMint: mintKeypair.publicKey,
      updateAuthority: creator.publicKey,
      metadataData: new programs.metadata.MetadataDataData({
        name: "test #420",
        symbol: "",
        uri: "testing", 
        sellerFeeBasisPoints: 0,
        creators: [
          new programs.metadata.Creator({
            address: creator.publicKey.toBase58(),
            verified: false,
            share: 100
          }),
        ],
      }),
    });
    await connection.confirmTransaction(metadataTX, "confirmed");

    const signTx = await actions.signMetadata({
      connection,
      editionMint: mintKeypair.publicKey,
      wallet: new NodeWallet(owner),
      signer: creator
    });
    await connection.confirmTransaction(signTx, "confirmed");

    const nftMint = new splToken.Token(
      connection,
      mintKeypair.publicKey,
      splToken.TOKEN_PROGRAM_ID,
      owner
    );

    // Remove minting authority.
    nftMint.setAuthority(
      mintKeypair.publicKey,
      null,
      "MintTokens",
      owner,
      []
    );

    return [nftMint, nftTokenAccount];
  }