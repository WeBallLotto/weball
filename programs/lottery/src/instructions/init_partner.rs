use anchor_lang::prelude::*;
use crate::state::*;
use solana_program::pubkey::Pubkey;
use std::cmp;

#[derive(Accounts)]
#[instruction(partner_no: u64)]
pub struct InitPartner<'info> {
    #[account(mut)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub manager: Signer<'info>,

    #[account(init,
        seeds = [b"partner".as_ref(), pool.key().as_ref(), partner_no.to_le_bytes().as_ref()],
        bump,
        payer = manager,
        space = 8 + std::mem::size_of::<Partner>())]
    pub partner: Box<Account<'info, Partner>>,

    // misc
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitPartner>,
    partner_no: u64,
    partner_name: String,
    wallet: Pubkey,
) -> Result<()> {
    // check permission
    ctx.accounts.pool.asset_manager(ctx.accounts.manager.key())?;

    let name_bytes = partner_name.into_bytes();
    let mut array_of_name: [u8; MAX_DEALER_NAME_LEN] = [0; MAX_DEALER_NAME_LEN];
    for i in 0..=cmp::min(MAX_DEALER_NAME_LEN - 1, name_bytes.len() - 1) {
        array_of_name[i] = name_bytes[i];
    }

    // init new partner
    let partner = &mut ctx.accounts.partner;
    partner.pool = ctx.accounts.pool.key();
    partner.wallet = wallet;
    partner.name = array_of_name;
    partner.no = partner_no;

    Ok(())
}