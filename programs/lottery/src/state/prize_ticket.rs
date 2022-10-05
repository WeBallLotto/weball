use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;

#[proc_macros::assert_size(144)]
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct PrizeTicket {
    // wallet address of owner
    pub owner: Pubkey,
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
    // redeemed bonus
    pub redeemed_bonus: u64,
    // time seconds of purchase
    pub created_at: u64,
    // ticket no
    pub ticket_no: u64,
}