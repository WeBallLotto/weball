use anchor_lang::prelude::*;
use crate::state::*;
use solana_program::pubkey::Pubkey;
use crate::common::{errors::ErrorCode};

#[derive(Accounts)]
pub struct UpdatePrizePool<'info> {
    #[account(mut)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<UpdatePrizePool>,
    new_manager: Pubkey,
    new_drawer: Pubkey,
    min_betting_ts: u64,
    max_betting_ts: u64,
    ball_max_white: u8,
    ball_max_red: u8,
    price: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    // check permission
    pool.asset_manager(ctx.accounts.signer.key())?;

    if price == 0 {
        return Err(error!(ErrorCode::InvalidParameter));
    }

    // update pool settings
    pool.manager = new_manager;
    pool.drawer = new_drawer;
    pool.min_betting_ts = min_betting_ts;
    pool.max_betting_ts = max_betting_ts;
//    pool.ball_max_white = ball_max_white;
//    pool.ball_max_red = ball_max_red;
//    pool.ticket_price = price;
    pool.min_betting_multiplier = 1;

    Ok(())
}
