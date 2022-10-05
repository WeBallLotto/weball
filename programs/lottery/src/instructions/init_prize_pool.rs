use anchor_lang::prelude::*;
use std::str::FromStr;
use anchor_spl::{
    token::{ Mint, Token, TokenAccount },
};
use crate::state::*;
use crate::common::{errors::ErrorCode, *};
use solana_program::pubkey::Pubkey;

const INIT_PERIOD: u64 = 0;

#[derive(Accounts)]
#[instruction(bump_auth: u8)]
pub struct InitPrizePool<'info> {
    #[account(init, payer = manager, space = 8 + std::mem::size_of::<PrizePool>())]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub manager: Signer<'info>,

    /// CHECK:
    #[account(mut, seeds = [pool.key().as_ref()], bump = bump_auth)]
    pub pool_authority: AccountInfo<'info>,

    #[account(init, seeds = [b"bonus_pot".as_ref(), pool.key().as_ref()],
        bump,
        token::mint = prize_mint,
        token::authority = pool_authority,
        payer = manager)]
    pub bonus_pot: Box<Account<'info, TokenAccount>>,

    #[account(init, seeds = [b"share_pot".as_ref(), pool.key().as_ref()],
        bump,
        token::mint = prize_mint,
        token::authority = pool_authority,
        payer = manager)]
    pub share_pot: Box<Account<'info, TokenAccount>>,

    #[account(init, seeds = [b"prize_pot".as_ref(), pool.key().as_ref()],
        bump,
        token::mint = prize_mint,
        token::authority = pool_authority,
        payer = manager)]
    pub prize_pot: Box<Account<'info, TokenAccount>>,
    pub prize_mint: Box<Account<'info, Mint>>,

    #[account(init, seeds = [b"prize_draw".as_ref(), pool.key().as_ref(), INIT_PERIOD.to_le_bytes().as_ref()],
        bump,
        payer = manager,
        space = 8 + std::mem::size_of::<PrizeDraw>())]
    pub draw: Box<Account<'info, PrizeDraw>>,

    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitPrizePool>,
    bump_auth: u8,
    ticket_price: u64,
    share_rate: u8,
    ball_max_white: u8,
    ball_max_red: u8,
    min_betting_ts: u64,
    max_betting_ts: u64,
) -> Result<()> {
    if !cmp_pubkey(&Pubkey::from_str(MANAGER).unwrap(), &ctx.accounts.manager.key()) {
        return Err(error!(ErrorCode::PermissionDenied));
    }

    // write the new pool
    let pool = &mut ctx.accounts.pool;
    pool.manager = ctx.accounts.manager.key();
    pool.pool_authority = ctx.accounts.pool_authority.key();
    pool.pool_authority_seed = pool.key();
    pool.pool_authority_bump = [bump_auth];
    pool.bonus_pot = ctx.accounts.bonus_pot.key();
    pool.share_pot = ctx.accounts.share_pot.key();
    pool.prize_pot = ctx.accounts.prize_pot.key();
    pool.prize_mint = ctx.accounts.prize_mint.key();
    pool.newest_draw = ctx.accounts.draw.key();
    pool.ticket_price = ticket_price;
    pool.share_rate = share_rate;
    pool.ball_max_white = ball_max_white;
    pool.ball_max_red = ball_max_red;
    pool.min_betting_ts = min_betting_ts;
    pool.max_betting_ts = max_betting_ts;

    let draw = &mut ctx.accounts.draw;
    draw.pool = pool.key();
    draw.period = INIT_PERIOD;
    draw.close_ts = 0;

    Ok(())
}
