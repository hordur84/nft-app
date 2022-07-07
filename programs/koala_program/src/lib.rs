use anchor_lang::prelude::*;
use anchor_spl::associated_token::get_associated_token_address;
use anchor_spl::token::{self, Mint, Token, TokenAccount, SetAuthority};

use spl_token::instruction::AuthorityType;
use std::mem::size_of;

declare_id!("8QUWf8UVcyfQMj8iFaXHSpkWKjcnZuSpTMkphV72Zv3Y");

#[program]
pub mod koala_program {

    use super::*;
    pub fn initialize_stake_account(ctx: Context<InitializeStakeAccount>, bump: u8) -> ProgramResult {
        let stake_account = &mut ctx.accounts.stake_account;
        stake_account.owner = ctx.accounts.owner.key();
        stake_account.num_staked = 0;
        stake_account.bump = bump;
        stake_account.last_claimed = 0;

        Ok(())
    }

    pub fn stake_nft(ctx: Context<StakeNft>) -> ProgramResult {
        let owner = &ctx.accounts.owner;
        let stake_account = &mut ctx.accounts.stake_account;
        let nft_mint = &ctx.accounts.nft_mint;
        let nft_token_account = &ctx.accounts.nft_token_account;

        let token_program = &ctx.accounts.token_program;
        let clock = &ctx.accounts.clock;

        stake_account.last_claimed = clock.unix_timestamp;
        stake_account.num_staked += 1;

        // transfer nft ownership.
        let authority_accounts = SetAuthority {
            current_authority: owner.to_account_info(),
            account_or_mint: nft_token_account.to_account_info()
        };

        let authority_ctx = CpiContext::new(token_program.to_account_info(), authority_accounts);
        token::set_authority(
            authority_ctx,
            AuthorityType::AccountOwner,
            Some(stake_account.key())
        )?;

        Ok(())
    }

    pub fn unstake_nft(ctx: Context<UnstakeNft>) -> ProgramResult {
        let owner = &ctx.accounts.owner;
        let stake_account = &mut ctx.accounts.stake_account;
        let nft_token_account = &mut ctx.accounts.nft_token_account;

        let token_program = &ctx.accounts.token_program;
        let clock = &ctx.accounts.clock;

        stake_account.last_claimed = clock.unix_timestamp;

        // decrease number of nft's staked by 1
        stake_account.num_staked = stake_account.num_staked.checked_sub(1).unwrap_or(0);

        let stake_account_seeds: &[&[u8]; 2] = &[
            &owner.key().to_bytes(),
            &[stake_account.bump],
        ];

        let stake_account_signer = &[&stake_account_seeds[..]];

        // transfer nft to vault? this should be owner maybe...
        let authority_accounts = SetAuthority {
            current_authority: stake_account.to_account_info(),
            account_or_mint: nft_token_account.to_account_info()
        };

        let authority_ctx = CpiContext::new_with_signer(
            token_program.to_account_info(), 
            authority_accounts, 
            stake_account_signer
        );  
        
        token::set_authority(
            authority_ctx,
            AuthorityType::AccountOwner,
            Some(owner.key())
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitializeStakeAccount<'info> {
    // owner of stake account.
    #[account(mut, signer)]
    pub owner: AccountInfo<'info>,

    // new stake account to initialize.
    #[account(init, payer = owner, space = NftStakeAccount::LEN, seeds = [&owner.key().to_bytes()], bump = bump,)]
    pub stake_account: Account<'info, NftStakeAccount>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
pub struct StakeNft<'info> {
    /// The owner of the stake account
    #[account(mut, signer)]
    pub owner: AccountInfo<'info>,

    /// The stake account for the owner
    #[account(mut, has_one = owner @ StakingError::InvalidOwnerForStakeAccount, seeds = [&owner.key().to_bytes()], bump = stake_account.bump,
    )]
    pub stake_account: Account<'info, NftStakeAccount>,

    /// The Mint of the NFT
    #[account(
        constraint = nft_mint.supply == 1 @ StakingError::InvalidNFTMintSupply,
    )]
    pub nft_mint: Box<Account<'info, Mint>>,

    /// The token account from the owner
    #[account(
        mut,
        has_one = owner @ StakingError::InvalidNFTOwner,
        constraint = nft_token_account.mint == nft_mint.key() @ StakingError::InvalidNFTAccountMint,
        constraint = nft_token_account.amount == 1 @ StakingError::NFTAccountEmpty,
    )]
    pub nft_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct UnstakeNft<'info> {
    /// The owner of the stake account
    #[account(mut, signer)]
    pub owner: AccountInfo<'info>,

    /// The stake account for the owner
    #[account(
        mut,
        has_one = owner @ StakingError::InvalidOwnerForStakeAccount,
        seeds = [&owner.key().to_bytes()],
        bump = stake_account.bump,
    )]
    pub stake_account: Account<'info, NftStakeAccount>,

    /// The Mint of the NFT
    #[account(
        constraint = nft_mint.supply == 1 @ StakingError::InvalidNFTMintSupply,
    )]
    pub nft_mint: Box<Account<'info, Mint>>,

    /// The token account from the owner
    #[account(
        mut,
        constraint = nft_token_account.owner == stake_account.key() @ StakingError::InvalidStakedNFTOwner,
        constraint = nft_token_account.mint == nft_mint.key() @ StakingError::InvalidNFTAccountMint,
        address = get_associated_token_address(&owner.key(), &nft_mint.key()),
    )]
    pub nft_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub clock: Sysvar<'info, Clock>,
}

pub trait Len {
    const LEN: usize;
}

impl<T> Len for T where T: AnchorDeserialize + AnchorSerialize {
    const LEN: usize = 8 + size_of::<T>();
}

#[account]
pub struct NftStakeAccount {
    pub owner: Pubkey,
    pub num_staked: u16,
    pub bump: u8,
    pub last_claimed: i64
}

#[error]
pub enum StakingError {
    InvalidStakedNFTOwner,
    InvalidNFTAccountMint,
    InvalidNFTMintSupply,
    InvalidOwnerForStakeAccount,
    InvalidNFTOwner,
    NFTAccountEmpty
}

