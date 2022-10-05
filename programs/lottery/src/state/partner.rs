use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;
use crate::state::*;

#[proc_macros::assert_size(184)]
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct Partner {
    // invite a dealer to become a partner
    pub pool: Pubkey,
    // wallet of partner
    pub wallet: Pubkey,
    // accrued share amount
    pub accrued_share_amount: u64,
    // paid out reward
    pub paid_out_amount: u64,
    // partner name
    pub name: [u8; MAX_DEALER_NAME_LEN],
    // partner no
    pub no: u64,

    pub reserved: [u8; 64],
}