use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;

#[proc_macros::assert_size(128)]
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct BetPlan {
    // wallet address of owner
    pub owner: Pubkey,
    // ticket no
    pub ticket_no: u64,
    // dealer no
    pub dealer: u64,
    // play round (draw) no
    pub draw: u64,
    // prize balls, maximum of eight bets
    pub balls: [u8; 64],
    // multiply the prize
    pub multiplier: u8,
    // number of bets
    pub num_of_bets: u8,
    // is quick pick enabled
    pub random: u8,
    // remaining number of draw
    pub num_of_draw: u8,
    // total number of draw
    pub total_of_draw: u8,
}