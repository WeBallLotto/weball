use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer, SyncNative, CloseAccount},
};

use crate::state::*;
use crate::common::{errors::ErrorCode, *};
use crate::instructions::verify_balls;
use anchor_lang::system_program;

#[derive(Accounts)]
#[instruction(ticket_no: u64)]
pub struct InitBetPlan<'info> {
    #[account(mut, has_one = prize_mint, has_one = pool_authority)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut)]
    pub pool_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(mut, signer)]
    pub payer: AccountInfo<'info>,

    #[account(mut, has_one = pool)]
    pub dealer: Box<Account<'info, Dealer>>,

    #[account(mut, has_one = pool)]
    pub draw: Box<Account<'info, PrizeDraw>>,

    #[account(init,
        seeds = [b"bet_plan".as_ref(), pool.key().as_ref(), payer.key().as_ref(), ticket_no.to_le_bytes().as_ref()],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<BetPlan>())]
    pub plan: Box<Account<'info, BetPlan>>,

    #[account(init_if_needed, seeds = [b"plan_pot".as_ref(), pool.key().as_ref()],
        bump,
        token::mint = prize_mint,
        token::authority = pool_authority,
        payer = payer)]
    pub plan_pot: Box<Account<'info, TokenAccount>>,
    pub prize_mint: Box<Account<'info, Mint>>,

    /// CHECK:
    #[account(init_if_needed,
        associated_token::mint = prize_mint,
        associated_token::authority = payer,
        payer = payer)]
    pub pay_account: Box<Account<'info, TokenAccount>>,

    // misc
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> InitBetPlan<'info> {
    fn transfer_sol_ctx(&self) -> CpiContext<'_, '_, '_, 'info, system_program::Transfer<'info>> {
        CpiContext::new(
            self.system_program.to_account_info(),
            system_program::Transfer {
                from: self.payer.to_account_info(),
                to: self.pay_account.to_account_info(),
            },
        )
    }

    fn sync_native_ctx(&self) -> CpiContext<'_, '_, '_, 'info, SyncNative<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            SyncNative {
                account: self.pay_account.to_account_info(),
            },
        )
    }

    fn close_sol_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.pay_account.to_account_info(),
                destination: self.payer.to_account_info(),
                authority: self.payer.to_account_info(),
            },
        )
    }

    fn transfer_fee_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.pay_account.to_account_info(),
                to: self.plan_pot.to_account_info(),
                authority: self.payer.to_account_info(),
            },
        )
    }
}

pub fn handler(
    ctx: Context<InitBetPlan>,
    ticket_no: u64,
    balls: [u8; 64],
    num_of_bets: u8,
    multiplier: u8,
    num_of_draw: u8,
    random: u8,
) -> Result<()> {
    // invalid params
    if !(1..=MAX_BETS_SINGLE_TICKET).contains(&num_of_bets)
        || !(1..=MAX_BET_MULTIPLIER).contains(&multiplier)
        || ctx.accounts.draw.key() != ctx.accounts.pool.newest_draw {
        return Err(error!(ErrorCode::InvalidParameter));
    }

    // calculate ticket price
    let single_ticket_price = ctx.accounts.pool.ticket_price;
    let ticket_price = single_ticket_price
        .try_mul(num_of_bets.into())?
        .try_mul(multiplier.into())?
        .try_add(TICKET_RENT_FEE)?
        .try_mul(num_of_draw.into())?;

    // convert wrapped sol
    system_program::transfer(ctx.accounts.transfer_sol_ctx(), ticket_price)?;
    token::sync_native(ctx.accounts.sync_native_ctx())?;

    // transfer betting token
    token::transfer(ctx.accounts.transfer_fee_ctx(), ticket_price)?;
    token::close_account(ctx.accounts.close_sol_ctx())?;

    // write prize ticket on-chain
    let plan = &mut ctx.accounts.plan;
    plan.owner = ctx.accounts.payer.key();
    plan.dealer = ctx.accounts.dealer.no;
    plan.draw = ctx.accounts.draw.period;
    plan.num_of_bets = num_of_bets.into();
    plan.multiplier = multiplier;
    plan.ticket_no = ticket_no;
    plan.num_of_draw = num_of_draw.into();
    plan.total_of_draw = num_of_draw.into();
    plan.random = random;
    // use quick pick or not
    if random == 0 {
        // verify balls
        let valid_num_of_bets = verify_balls(balls, ctx.accounts.pool.ball_max_white, ctx.accounts.pool.ball_max_red);
        if usize::from(num_of_bets) != valid_num_of_bets {
            return Err(error!(ErrorCode::IncorrectBalls));
        }

        // copy valid balls
        let mut valid_balls: [u8; 64] = [0; 64];
        for i in 0..(valid_num_of_bets * BALL_NUM_PER_BET) {
            valid_balls[i] = balls[i].into();
        }
        plan.balls = valid_balls;
    }

    Ok(())
}