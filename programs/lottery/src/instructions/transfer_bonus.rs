use anchor_lang::prelude::*;
use crate::state::*;
use crate::common::{errors::ErrorCode, *};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Token, TokenAccount, Transfer},
};

#[derive(Accounts)]
pub struct TransferBonus<'info> {
    #[account(mut, has_one = pool_authority, has_one = bonus_pot, has_one = prize_pot)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub pool_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(mut, signer)]
    pub manager: AccountInfo<'info>,

    #[account(mut, has_one = pool)]
    pub draw: Box<Account<'info, PrizeDraw>>,
    #[account(mut)]
    pub bonus_pot: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub prize_pot: Box<Account<'info, TokenAccount>>,

    // misc
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> TransferBonus<'info> {
    fn transfer_bonus_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.prize_pot.to_account_info(),
                to: self.bonus_pot.to_account_info(),
                authority: self.pool_authority.to_account_info(),
            },
        )
    }
}

pub fn handler(
    ctx: Context<TransferBonus>,
    amount: u64,
    top_amount: u64,
) -> Result<()> {
    if ctx.accounts.draw.bonus_amount > 0 {
        return Err(error!(ErrorCode::IllegalState));
    }

    // check permission
    ctx.accounts.pool.asset_manager(ctx.accounts.manager.key())?;

    // do the transfer
    token::transfer(ctx.accounts.transfer_bonus_ctx().with_signer(&[&ctx.accounts.pool.authority_seeds()]), amount)?;

    // update pool
    let pool = &mut ctx.accounts.pool;
    pool.bonus_amount.try_add_assign(amount)?;
    pool.prize_amount.try_sub_assign(amount)?;

    // update draw
    let draw = &mut ctx.accounts.draw;
    draw.bonus_amount.try_add_assign(amount)?;
    draw.top_amount.try_add_assign(top_amount)?;

    Ok(())
}