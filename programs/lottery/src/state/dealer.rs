use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;
use crate::state::*;
use crate::common::{errors::ErrorCode};

#[proc_macros::assert_size(240)]
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct Dealer {
    pub pool: Pubkey,
    // account of dealer
    pub wallet: Pubkey,
    // account of partner(invitor)
    pub partner: Pubkey,
    // percentage of dealer share
    pub share_rate: u8,
    // percentage of partner share
    pub partner_rate: u8,
    // paid out reward
    pub paid_out_amount: u64,
    // accrued share amount
    pub accrued_share_amount: u64,
    // total number of tickets sold by this dealer
    pub num_of_bets: u64,
    // total amount sold by the this dealer
    pub amount_of_bets: u64,
    // dealer name
    pub name: [u8; MAX_DEALER_NAME_LEN],
    // dealer no
    pub no: u64,

    pub reserved: [u8; 64],
}

impl Dealer {
    pub fn validate_rate(&self, share_rate: u8, partner_rate: u8) -> Result<()> {
        if !(0..100).contains(&share_rate) || !(0..100).contains(&partner_rate) || share_rate + partner_rate >= 100 {
            return Err(error!(ErrorCode::InvalidParameter));
        }
        Ok(())
    }
}