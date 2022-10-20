use std::convert::TryInto;
use anchor_lang::{prelude::*};
use solana_program::{
    clock::Clock,
    program_memory::sol_memcmp,
    pubkey::{Pubkey, PUBKEY_BYTES},
};

pub fn cmp_pubkey(a: &Pubkey, b: &Pubkey) -> bool {
    sol_memcmp(a.as_ref(), b.as_ref(), PUBKEY_BYTES) == 0
}

pub fn now_ts() -> Result<u64> {
    //i64 -> u64 ok to unwrap
    Ok(Clock::get()?.unix_timestamp.try_into().unwrap())
}