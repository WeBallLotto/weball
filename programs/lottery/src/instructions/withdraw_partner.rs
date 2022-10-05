use anchor_lang::prelude::*;
use crate::state::*;
use crate::common::{errors::ErrorCode, *};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token, TokenAccount, Transfer, Mint},
};

#[derive(Accounts)]
pub struct WithdrawPartner<'info> {
    #[account(mut, has_one = pool_authority, has_one = share_pot, has_one = prize_mint)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub pool_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(mut, signer)]
    pub wallet: AccountInfo<'info>,

    #[account(mut, has_one = pool, has_one = wallet)]
    pub partner: Box<Account<'info, Partner>>,

    #[account(mut)]
    pub share_pot: Box<Account<'info, TokenAccount>>,

    /// CHECK:
    #[account(mut,
        associated_token::mint = prize_mint,
        associated_token::authority = wallet)]
    pub receiver: Box<Account<'info, TokenAccount>>,
    pub prize_mint: Box<Account<'info, Mint>>,

    // misc
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> WithdrawPartner<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.share_pot.to_account_info(),
                to: self.receiver.to_account_info(),
                authority: self.pool_authority.to_account_info(),
            },
        )
    }
}

pub fn handler(
    ctx: Context<WithdrawPartner>,
) -> Result<()> {
    if ctx.accounts.partner.accrued_share_amount <= ctx.accounts.partner.paid_out_amount {
        return Err(error!(ErrorCode::InsufficientBalance));
    }

    // transfer share amount
    let amount = ctx.accounts.partner.accrued_share_amount.try_sub(ctx.accounts.partner.paid_out_amount)?;
    token::transfer(ctx.accounts.transfer_ctx().with_signer(&[&ctx.accounts.pool.authority_seeds()]), amount)?;

    // update pool
    let pool = &mut ctx.accounts.pool;
    pool.partner_paid_out_amount.try_add_assign(amount)?;
    // update partner
    let partner = &mut ctx.accounts.partner;
    partner.paid_out_amount.try_add_assign(amount)?;

    Ok(())
}