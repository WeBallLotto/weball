pub use anchor_lang::prelude::*;

pub const STATE_SEED: &[u8] = b"STATE";

#[proc_macros::assert_size(152)]
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct VrfClient {
    pub pool: Pubkey,
    pub vrf: Pubkey,
    pub authority: Pubkey,
    pub bump: u8,
    pub result_buffer: [u8; 32],
    pub update_ts: u64,
    pub consume_ts: u64,
}