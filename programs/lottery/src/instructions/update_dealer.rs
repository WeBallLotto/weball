use anchor_lang::prelude::*;
use crate::state::*;
use solana_program::pubkey::Pubkey;
use std::cmp;

#[derive(Accounts)]
pub struct UpdateDealer<'info> {
    #[account(mut)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub manager: Signer<'info>,

    #[account(mut, has_one = pool)]
    pub dealer: Box<Account<'info, Dealer>>,

    #[account(mut, has_one = pool)]
    pub partner: Box<Account<'info, Partner>>,

    // misc
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<UpdateDealer>,
    dealer_name: String,
    wallet: Pubkey,
    share_rate: u8,
    partner_rate: u8,
) -> Result<()> {
    let dealer = &mut ctx.accounts.dealer;
    // validate params
    dealer.validate_rate(share_rate, partner_rate)?;
    // check permission
    ctx.accounts.pool.asset_manager(ctx.accounts.manager.key())?;

    let name_bytes = dealer_name.into_bytes();
    let mut array_of_name: [u8; MAX_DEALER_NAME_LEN] = [0; MAX_DEALER_NAME_LEN];
    for i in 0..=cmp::min(MAX_DEALER_NAME_LEN - 1, name_bytes.len() - 1) {
        array_of_name[i] = name_bytes[i];
    }

    // update dealer
    dealer.partner = ctx.accounts.partner.key();
    dealer.wallet = wallet;
    dealer.share_rate = share_rate;
    dealer.partner_rate = partner_rate;
    dealer.name = array_of_name;

    Ok(())
}