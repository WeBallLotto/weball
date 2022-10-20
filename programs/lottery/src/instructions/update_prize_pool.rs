use anchor_lang::prelude::*;
use crate::state::*;
use solana_program::pubkey::Pubkey;

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
    min_betting_multiplier: u8,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    // check permission
    pool.asset_manager(ctx.accounts.signer.key())?;

    // update pool settings
    pool.manager = new_manager;
    pool.drawer = new_drawer;
    pool.min_betting_ts = min_betting_ts;
    pool.max_betting_ts = max_betting_ts;
    pool.min_betting_multiplier = min_betting_multiplier;

    Ok(())
}
