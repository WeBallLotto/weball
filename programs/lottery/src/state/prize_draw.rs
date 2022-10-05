use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;
use crate::state::*;
use crate::common::{errors::ErrorCode, *};

#[proc_macros::assert_size(128)]
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct PrizeDraw {
    // account of prize pool
    pub pool: Pubkey,
    // number of this period
    pub period: u64,
    // time seconds of prize drawn
    pub drawn_ts: u64,
    // betting amount of this period
    pub amount: u64,
    // number of bets
    pub num_of_bets: u64,
    // amount of top prize
    pub top_amount: u64,
    // amount of the bonus
    pub bonus_amount: u64,
    // paid out amount of the bonus
    pub paid_out_amount: u64,
    // lucky balls
    pub balls: [u8; BALL_NUM_PER_BET],
    // time seconds of stop betting
    pub close_ts: u64,
    // team share amount of this period
    pub team_share_amount: u64,
    // dealer share amount of this period
    pub dealer_share_amount: u64,
    // partner share amount of this period
    pub partner_share_amount: u64,
}

impl PrizeDraw {
    // check end time of redeemable ticket
    pub fn is_expired(&self, now_ts: u64) -> Result<bool> {
        let exp_ts = self.drawn_ts.try_add(90 * 24 * 3600)?;
        Ok(now_ts > exp_ts)
    }

    // check close time
    pub fn asset_close_ts(&self, close_ts: u64, now_ts: u64, min_betting_ts: u64, max_betting_ts: u64) -> Result<()> {
        // check close time, betting duration: between min_betting_ts and max_betting_ts
        if !((now_ts + min_betting_ts)..(now_ts + max_betting_ts)).contains(&close_ts)  {
            return Err(error!(ErrorCode::InvalidParameter));
        }

        Ok(())
    }
}