use anchor_lang::prelude::*;
use crate::state::*;
use crate::common::{errors::ErrorCode, *};
use solana_program::pubkey::Pubkey;

#[derive(Accounts)]
#[instruction(period: u64)]
pub struct InitPrizeDraw<'info> {
    #[account(mut, has_one = newest_draw)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub manager: Signer<'info>,

    #[account(mut, has_one = pool)]
    pub newest_draw: Box<Account<'info, PrizeDraw>>,

    #[account(init,
        seeds = [b"prize_draw".as_ref(), pool.key().as_ref(), period.to_le_bytes().as_ref()],
        bump,
        payer = manager,
        space = 8 + std::mem::size_of::<PrizeDraw>())]
    pub next_draw: Box<Account<'info, PrizeDraw>>,

    // misc
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitPrizeDraw>,
    period: u64,
    close_ts: u64,
) -> Result<()> {
    let now_ts = now_ts()?;

    // you can not create a new draw before the latest one closed
    if ctx.accounts.newest_draw.close_ts > now_ts {
        return Err(error!(ErrorCode::IllegalState));
    }

    // check close time, between (now_ts + min_betting_ts) and (now_ts + max_betting_ts)
    ctx.accounts.next_draw.asset_close_ts(close_ts, now_ts, ctx.accounts.pool.min_betting_ts, ctx.accounts.pool.max_betting_ts)?;

    let pool = &mut ctx.accounts.pool;
    // check permission
    pool.asset_manager(ctx.accounts.manager.key())?;
    // update prize pool
    pool.newest_draw = ctx.accounts.next_draw.key();

    // init next prize draw
    let draw = &mut ctx.accounts.next_draw;
    draw.pool = ctx.accounts.pool.key();
    draw.period = period;
    draw.close_ts = close_ts;

    Ok(())
}