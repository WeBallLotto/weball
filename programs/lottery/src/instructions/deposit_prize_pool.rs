use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};
use crate::state::*;
use crate::common::{*};

#[derive(Accounts)]
pub struct DepositPrizePool<'info> {
    #[account(mut, has_one = prize_pot, has_one = prize_mint)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK:
    #[account(mut,
        associated_token::mint = prize_mint,
        associated_token::authority = payer)]
    pub pay_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub prize_pot: Box<Account<'info, TokenAccount>>,
    pub prize_mint: Box<Account<'info, Mint>>,

    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> DepositPrizePool<'info> {
    fn transfer_prize_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.pay_account.to_account_info(),
                to: self.prize_pot.to_account_info(),
                authority: self.payer.to_account_info(),
            },
        )
    }
}

pub fn handler(
    ctx: Context<DepositPrizePool>,
    amount: u64,
) -> Result<()> {
    // check permission
    ctx.accounts.pool.asset_manager(ctx.accounts.payer.key())?;

    // do the transfer
    token::transfer(ctx.accounts.transfer_prize_ctx(), amount)?;

    let pool = &mut ctx.accounts.pool;
    // update
    pool.prize_amount.try_add_assign(amount)?;

    Ok(())
}
