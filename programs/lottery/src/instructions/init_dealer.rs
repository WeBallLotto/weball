use anchor_lang::prelude::*;
use crate::state::*;
use crate::common::{*};
use solana_program::pubkey::Pubkey;
use std::cmp;

#[derive(Accounts)]
#[instruction(dealer_no: u64)]
pub struct InitDealer<'info> {
    #[account(mut)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub manager: Signer<'info>,

    #[account(init,
        seeds = [b"dealer".as_ref(), pool.key().as_ref(), dealer_no.to_le_bytes().as_ref()],
        bump,
        payer = manager,
        space = 8 + std::mem::size_of::<Dealer>())]
    pub dealer: Box<Account<'info, Dealer>>,

    #[account(has_one = pool)]
    pub partner: Box<Account<'info, Partner>>,

    // misc
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitDealer>,
    dealer_no: u64,
    dealer_name: String,
    wallet: Pubkey,
    share_rate: u8,
    partner_rate: u8,
) -> Result<()> {
    let dealer = &mut ctx.accounts.dealer;
    let pool = &mut ctx.accounts.pool;
    // validate params
    dealer.validate_rate(share_rate, partner_rate)?;
    // check permission
    pool.asset_manager(ctx.accounts.manager.key())?;
    // update prize pool
    pool.num_of_dealers.try_add_assign(1)?;

    let name_bytes = dealer_name.into_bytes();
    let mut array_of_name: [u8; MAX_DEALER_NAME_LEN] = [0; MAX_DEALER_NAME_LEN];
    for i in 0..=cmp::min(MAX_DEALER_NAME_LEN - 1, name_bytes.len() - 1) {
        array_of_name[i] = name_bytes[i];
    }

    // init new dealer

    dealer.pool = ctx.accounts.pool.key();
    dealer.partner = ctx.accounts.partner.key();
    dealer.wallet = wallet;
    dealer.share_rate = share_rate;
    dealer.partner_rate = partner_rate;
    dealer.name = array_of_name;
    dealer.no = dealer_no;

    Ok(())
}