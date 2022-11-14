use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer, CloseAccount},
};

use crate::state::*;
use crate::common::{errors::ErrorCode, *};

#[derive(Accounts)]
#[instruction(bump_plan_pot: u8)]
pub struct CloseBetPlan<'info> {
    #[account(mut, has_one = pool_authority)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub pool_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(mut, signer)]
    pub identity: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub owner: AccountInfo<'info>,

    #[account(mut, has_one = owner, close = owner)]
    pub plan: Box<Account<'info, BetPlan>>,

    #[account(mut, seeds = [b"plan_pot".as_ref(), pool.key().as_ref()],
        bump = bump_plan_pot,
        token::mint = prize_mint,
        token::authority = pool_authority)]
    pub plan_pot: Box<Account<'info, TokenAccount>>,
    pub prize_mint: Box<Account<'info, Mint>>,

    /// CHECK:
    #[account(init_if_needed,
        associated_token::mint = prize_mint,
        associated_token::authority = identity,
        payer = identity)]
    pub pay_account: Box<Account<'info, TokenAccount>>,

    // misc
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> CloseBetPlan<'info> {
    fn transfer_fee_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.plan_pot.to_account_info(),
                to: self.pay_account.to_account_info(),
                authority: self.pool_authority.to_account_info(),
            },
        )
    }

    fn close_sol_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.pay_account.to_account_info(),
                destination: self.identity.to_account_info(),
                authority: self.identity.to_account_info(),
            },
        )
    }
}

pub fn handler(
    ctx: Context<CloseBetPlan>
) -> Result<()> {
    // only the owner can stop betting plan, if the plan is running
    if ctx.accounts.plan.num_of_draw > 0 && ctx.accounts.identity.key() != ctx.accounts.owner.key() {
        return Err(error!(ErrorCode::PermissionDenied));
    }

    // calculate ticket price
    let single_ticket_price = ctx.accounts.pool.ticket_price;
    let ticket_price = single_ticket_price
        .try_mul(ctx.accounts.plan.num_of_bets.into())?
        .try_mul(ctx.accounts.plan.multiplier.into())?
        .try_add(TICKET_RENT_FEE)?
        .try_mul(ctx.accounts.plan.num_of_draw.into())?;

    // transfer betting token
    if ticket_price > 0 {
        token::transfer(ctx.accounts.transfer_fee_ctx().with_signer(&[&ctx.accounts.pool.authority_seeds()]), ticket_price)?;
    }
    token::close_account(ctx.accounts.close_sol_ctx())?;

    Ok(())
}