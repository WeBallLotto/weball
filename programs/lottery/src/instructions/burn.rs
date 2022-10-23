use anchor_lang::prelude::*;
use anchor_spl::{
    token::{self, Token},
};

use solana_program::account_info::AccountInfo;

#[derive(Accounts)]
pub struct Burn<'info> {
    /// CHECK:
    #[account(mut)]
    pub owner: Signer<'info>,

    // misc
    pub token_program: Program<'info, Token>,
}

impl<'info> Burn<'info> {
    fn burn_ctx(&self, mint: AccountInfo<'info>, from: AccountInfo<'info>) -> CpiContext<'_, '_, '_, 'info, token::Burn<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            token::Burn { mint, from, authority: self.owner.to_account_info() },
        )
    }
    fn close_ctx(&self, account: AccountInfo<'info>) -> CpiContext<'_, '_, '_, 'info, token::CloseAccount<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            token::CloseAccount {
                account,
                destination: self.owner.to_account_info(),
                authority: self.owner.to_account_info(),
            },
        )
    }
}

pub fn handler<'a, 'b, 'c, 'info>(ctx: Context<'a, 'b, 'c, 'info, Burn<'info>>, count: u8) -> Result<()> {
    let remaining_accs = &mut ctx.remaining_accounts.iter();
    // get account from remaining accounts
    for _n in 1..=count {
        let mint = next_account_info(remaining_accs)?;
        let account = next_account_info(remaining_accs)?;
        token::burn(ctx.accounts.burn_ctx(mint.clone(), account.clone()), 1)?;
        token::close_account(ctx.accounts.close_ctx(account.clone()))?;
    }

    Ok(())
}
