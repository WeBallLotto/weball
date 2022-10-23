use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

use arrayref::array_ref;
use crate::state::*;
use crate::common::{errors::ErrorCode, *};

#[derive(Accounts)]
#[instruction(bump_ticket: u8, ticket_no: u64)]
pub struct RedeemTicket<'info> {
    #[account(mut, has_one = prize_mint, has_one = bonus_pot, has_one = pool_authority)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut, signer)]
    pub owner: AccountInfo<'info>,

    #[account(mut, has_one = pool)]
    pub draw: Box<Account<'info, PrizeDraw>>,

    #[account(mut,
        seeds = [b"prize_ticket".as_ref(), pool.key().as_ref(), draw.key().as_ref(), owner.key().as_ref(), ticket_no.to_le_bytes().as_ref()],
        bump = bump_ticket)]
    pub ticket: Box<Account<'info, PrizeTicket>>,

    #[account(mut)]
    pub bonus_pot: Box<Account<'info, TokenAccount>>,

    /// CHECK:
    #[account(mut)]
    pub pool_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(mut,
        associated_token::mint = prize_mint,
        associated_token::authority = owner)]
    pub receiver: Box<Account<'info, TokenAccount>>,
    pub prize_mint: Box<Account<'info, Mint>>,

    // misc
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> RedeemTicket<'info> {
    fn transfer_bonus_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.bonus_pot.to_account_info(),
                to: self.receiver.to_account_info(),
                authority: self.pool_authority.to_account_info(),
            },
        )
    }
}

// test balls, return winning level
pub fn test_prize(draw_balls:&[u8], test_balls:&[u8]) -> Result<(u8, u8)> {
    let ball_len = draw_balls.len();
    if ball_len != test_balls.len() {
        return Err(error!(ErrorCode::IncorrectBalls));
    }

    let mut front: u8 = 0;
    for i in 0..(ball_len - 1) {
        for j in 0..(ball_len - 1) {
            if draw_balls[i] == test_balls[j] {
                front += 1;
                break;
            }
        }
    }
    let tail: u8 = if draw_balls[ball_len - 1] == test_balls[ball_len - 1] { 1 } else { 0 };
    Ok((front, tail))
}

// calculate winning amount
pub fn calc_bonus(front: u8, tail: u8, top: u64, multiplier: u64) -> u64 {
    let mul = if multiplier > 0 { multiplier } else { 1 };
    match (front, tail) {
        (0, 1) => 20_000_000 * mul, // Level8
        (1, 1) => 20_000_000 * mul, // level7
        (2, 0) => 20_000_000 * mul, // level6
        (2, 1) => 100_000_000 * mul, // level5
        (3, 0) => 250_000_000 * mul, // level4
        (3, 1) => 2_500_000_000 * mul, // level3
        (4, 0) => 30_000_000_000 * mul, // Level2
        (4, 1) => top, // top prize
        _ => 0
    }
}

pub fn handler(
    ctx: Context<RedeemTicket>,
) -> Result<()> {
    if ctx.accounts.draw.period != ctx.accounts.ticket.draw {
        return Err(error!(ErrorCode::InvalidParameter));
    }
    // you can't redeem ticket before drawn
    // also you can't redeem a ticket more than once
    if ctx.accounts.draw.drawn_ts == 0
        || ctx.accounts.draw.bonus_amount == 0
        || ctx.accounts.ticket.redeemed_bonus > 0
        || ctx.accounts.ticket.created_at > ctx.accounts.draw.close_ts {
        return Err(error!(ErrorCode::IllegalState));
    }

    // ticket expires after 90 days
    let now_ts = now_ts()?;
    if ctx.accounts.draw.is_expired(now_ts)? {
        return Err(error!(ErrorCode::TicketExpired));
    }

    // verify prize ticket
    let mut bonus: u64 = 0;
    let num_of_bets: usize = ctx.accounts.ticket.num_of_bets.into();
    let balls = ctx.accounts.ticket.balls;
    for i in 0..num_of_bets {
        let (front, tail) = test_prize(&ctx.accounts.draw.balls, array_ref![balls, i * BALL_NUM_PER_BET, BALL_NUM_PER_BET])?;
        bonus = bonus.try_add(calc_bonus(front, tail, ctx.accounts.draw.top_amount, ctx.accounts.draw.bonus_multiplier.into()))?;
    }
    bonus = bonus.try_mul(ctx.accounts.ticket.multiplier.into())?;

    // this ticket did not win a prize
    if bonus == 0 {
        return Err(error!(ErrorCode::NotWinner));
    }

    // insufficient bonus
    if ctx.accounts.draw.paid_out_amount.try_add(bonus)? > ctx.accounts.draw.bonus_amount {
        return Err(error!(ErrorCode::InsufficientBalance));
    }

    // withdraw bonus
    token::transfer(ctx.accounts.transfer_bonus_ctx().with_signer(&[&ctx.accounts.pool.authority_seeds()]), bonus)?;

    // update bonus status
    let draw = &mut ctx.accounts.draw;
    draw.paid_out_amount.try_add_assign(bonus)?;
    let ticket = &mut ctx.accounts.ticket;
    ticket.redeemed_bonus.try_add_assign(bonus)?;
    let pool = &mut ctx.accounts.pool;
    pool.bonus_paid_out_amount.try_add_assign(bonus)?;

    msg!("redeemed bonus: {} lamports", bonus);

    Ok(())
}

#[cfg(test)]
mod tests {
    use arrayref::array_ref;
    use crate::state::*;
    use crate::instructions::*;

    fn get_bonus(draw_balls: &[u8], num_of_bets: usize) -> u64 {
        let mut bonus: u64 = 0;
        let balls:[u8; 64] = [2, 7, 9, 33, 6, 2, 7, 9, 33, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for i in 0..num_of_bets {
            let (front, tail) = test_prize(&draw_balls, array_ref![balls, i * BALL_NUM_PER_BET, BALL_NUM_PER_BET]).unwrap();
            println!("front: {}, tail: {}", front, tail);
            bonus = bonus + calc_bonus(front, tail, 10, 2);
        }
        bonus
    }

    #[test]
    fn test_bonus() {
        let mul = 2;
        let draw_balls1: [u8; 5] = [2, 7, 9, 33, 6];
        assert_eq!(get_bonus(&draw_balls1, 1), 10);
        assert_eq!(get_bonus(&draw_balls1, 2), 20);

        let draw_balls2: [u8; 5] = [2, 7, 9, 33, 1];
        assert_eq!(get_bonus(&draw_balls2, 1), 30_000_000_000 * mul);
        assert_eq!(get_bonus(&draw_balls2, 2), 30_000_000_000 * 2 * mul);

        let draw_balls3: [u8; 5] = [2, 7, 17, 33, 6];
        assert_eq!(get_bonus(&draw_balls3, 1), 2_500_000_000 * mul);
        assert_eq!(get_bonus(&draw_balls3, 2), 2_500_000_000 * 2 * mul);

        let draw_balls4: [u8; 5] = [2, 7, 17, 33, 1];
        assert_eq!(get_bonus(&draw_balls4, 1), 250_000_000 * mul);
        assert_eq!(get_bonus(&draw_balls4, 2), 250_000_000 * 2 * mul);

        let draw_balls5: [u8; 5] = [2, 5, 17, 33, 6];
        assert_eq!(get_bonus(&draw_balls5, 1), 100_000_000 * mul);
        assert_eq!(get_bonus(&draw_balls5, 2), 100_000_000 * 2 * mul);

        let draw_balls6: [u8; 5] = [2, 5, 17, 33, 1];
        assert_eq!(get_bonus(&draw_balls6, 1), 20_000_000 * mul);
        assert_eq!(get_bonus(&draw_balls6, 2), 20_000_000 * 2 * mul);

        let draw_balls7: [u8; 5] = [1, 5, 17, 33, 6];
        assert_eq!(get_bonus(&draw_balls7, 1), 20_000_000 * mul);
        assert_eq!(get_bonus(&draw_balls7, 2), 20_000_000 * 2 * mul);

        let draw_balls8: [u8; 5] = [1, 5, 17, 38, 6];
        assert_eq!(get_bonus(&draw_balls8, 1), 20_000_000 * mul);
        assert_eq!(get_bonus(&draw_balls8, 2), 20_000_000 * 2 * mul);
        assert_eq!(get_bonus(&draw_balls8, 2), 20_000_000 * 2 * mul);

        let draw_balls8: [u8; 5] = [1, 5, 17, 38, 9];
        assert_eq!(get_bonus(&draw_balls8, 1), 0);
    }
}