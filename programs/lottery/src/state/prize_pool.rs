use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;
use crate::common::{errors::ErrorCode, *};
use std::str::FromStr;

// pool manager
pub const MANAGER: &str = "BZ91mR995LnqBTiHXq7de5YzgjvchhckGMPe72RHF34g";
// how many balls in one bet
pub const BALL_NUM_PER_BET: usize = 5;
// max length of dealer name
pub const MAX_DEALER_NAME_LEN: usize = 32;

#[proc_macros::assert_size(536)]
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct PrizePool {
    // account of manager
    pub manager: Pubkey,
    // prize drawer
    pub drawer: Pubkey,
    // authority of prize pool, signs off on any operations related to the prize pool(eg: withdrawal bonus)
    pub pool_authority: Pubkey,
    pub pool_authority_seed: Pubkey,
    pub pool_authority_bump: [u8; 1],
    // token mint of prize pool
    pub prize_mint: Pubkey,
    // price of single ticket
    pub ticket_price: u64,

    // total number of tickets during whole life (never decrease)
    pub num_of_bets: u64,
    // total amount of SOL during whole life (never decrease)
    pub amount_of_bets: u64,
    // number of dealers
    pub num_of_dealers: u32,

    // pot to store the betting SOL
    pub prize_pot: Pubkey,
    // current amount of jackpot, will transfer some to bonus pot after the draw
    pub prize_amount: u64,

    // pot to store & withdraw share reward
    pub share_pot: Pubkey,
    // percentage of share reward
    pub share_rate: u8,

    // amount of share reward
    pub team_share_amount: u64,
    // paid out amount of team share reward
    pub team_paid_out_amount: u64,

    // amount of share reward
    pub dealer_share_amount: u64,
    // paid out amount of dealer share reward
    pub dealer_paid_out_amount: u64,

    // amount of share reward
    pub partner_share_amount: u64,
    // paid out amount of partner share reward
    pub partner_paid_out_amount: u64,

    // pot to store & withdraw the bonus
    pub bonus_pot: Pubkey,
    // amount of the bonus
    pub bonus_amount: u64,
    // paid out amount of bonus
    pub bonus_paid_out_amount: u64,

    // the newest play round
    pub newest_draw: Pubkey,
    // max number of white ball
    pub ball_max_white: u8,
    // max number of red ball
    pub ball_max_red: u8,

    // minimum betting duration(seconds)
    pub min_betting_ts: u64,

    // maximum betting duration(seconds)
    pub max_betting_ts: u64,

    pub reserved1: [u8; 8],
    pub reserved2: [u8; 32],
    pub reserved3: [u8; 64],
}

impl PrizePool {
    pub fn authority_seeds(&self) -> [&[u8]; 2] {
        [self.pool_authority_seed.as_ref(), &self.pool_authority_bump]
    }

    // check permission
    pub fn asset_manager(&self, manager: Pubkey) -> Result<()> {
        if !cmp_pubkey(&Pubkey::from_str(MANAGER).unwrap(), &manager)
            && !cmp_pubkey(&self.manager.key(), &manager) {
            return Err(error!(ErrorCode::PermissionDenied));
        }
        Ok(())
    }

    // update pool after buy ticket
    pub fn buy_ticket(
        &mut self,
        ticket_price: u64,
        count_bets: u8,
        dealer_share_rate: u8,
        partner_share_rate: u8
    ) -> Result<(u64, u64, u64, u64, u64)> {
        let total_share_amount = ticket_price.try_mul(self.share_rate.into())?.try_div(100)?;
        let dealer_share_amount = total_share_amount.try_mul(dealer_share_rate.into())?.try_div(100)?;
        let partner_share_amount = total_share_amount.try_mul(partner_share_rate.into())?.try_div(100)?;
        let team_share_amount = total_share_amount.try_sub(dealer_share_amount)?.try_sub(partner_share_amount)?;
        let prize_amount = ticket_price.try_sub(total_share_amount)?;
        self.num_of_bets.try_add_assign(count_bets.into())?;
        self.amount_of_bets.try_add_assign(ticket_price)?;
        self.prize_amount.try_add_assign(prize_amount)?;
        self.team_share_amount.try_add_assign(team_share_amount)?;
        self.dealer_share_amount.try_add_assign(dealer_share_amount)?;
        self.partner_share_amount.try_add_assign(partner_share_amount)?;
        Ok((prize_amount, total_share_amount, dealer_share_amount, partner_share_amount, team_share_amount))
    }
}