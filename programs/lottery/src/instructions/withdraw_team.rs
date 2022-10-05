use anchor_lang::prelude::*;
use crate::state::*;
use crate::common::{errors::ErrorCode, *};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token, TokenAccount, Transfer, Mint},
};

#[derive(Accounts)]
pub struct WithdrawTeam<'info> {
    #[account(mut, has_one = pool_authority, has_one = manager, has_one = share_pot, has_one = prize_mint)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub pool_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(mut, signer)]
    pub manager: AccountInfo<'info>,

    #[account(mut)]
    pub share_pot: Box<Account<'info, TokenAccount>>,

    /// CHECK:
    #[account(mut,
        associated_token::mint = prize_mint,
        associated_token::authority = manager)]
    pub receiver: Box<Account<'info, TokenAccount>>,
    pub prize_mint: Box<Account<'info, Mint>>,

    // misc
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> WithdrawTeam<'info> {
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
    ctx: Context<WithdrawTeam>,
) -> Result<()> {
    if ctx.accounts.pool.team_share_amount <= ctx.accounts.pool.team_paid_out_amount {
        return Err(error!(ErrorCode::InsufficientBalance));
    }

    let pool = &mut ctx.accounts.pool;
    let amount = pool.team_share_amount.try_sub(pool.team_paid_out_amount)?;

    // transfer share amount
    token::transfer(ctx.accounts.transfer_ctx().with_signer(&[&ctx.accounts.pool.authority_seeds()]), amount)?;

    // update pool
    let pool = &mut ctx.accounts.pool;
    pool.team_paid_out_amount.try_add_assign(amount)?;

    Ok(())
}