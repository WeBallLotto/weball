use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

use crate::state::*;
use crate::common::{errors::ErrorCode, *};

#[derive(Accounts)]
#[instruction(ticket_no: u64)]
pub struct BuyTicket<'info> {
    #[account(mut, has_one = prize_pot, has_one = share_pot, has_one = prize_mint)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut, signer)]
    pub payer: AccountInfo<'info>,

    /// CHECK:
    pub owner: AccountInfo<'info>,

    #[account(mut, has_one = pool, has_one = partner)]
    pub dealer: Box<Account<'info, Dealer>>,

    #[account(mut, has_one = pool)]
    pub partner: Box<Account<'info, Partner>>,

    #[account(mut, has_one = pool)]
    pub draw: Box<Account<'info, PrizeDraw>>,

    #[account(init,
        seeds = [b"prize_ticket".as_ref(), pool.key().as_ref(), draw.key().as_ref(), owner.key().as_ref(), ticket_no.to_le_bytes().as_ref()],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<PrizeTicket>())]
    pub ticket: Box<Account<'info, PrizeTicket>>,

    #[account(mut)]
    pub prize_pot: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub share_pot: Box<Account<'info, TokenAccount>>,
    pub prize_mint: Box<Account<'info, Mint>>,

    /// CHECK:
    #[account(mut,
        associated_token::mint = prize_mint,
        associated_token::authority = payer)]
    pub pay_account: Box<Account<'info, TokenAccount>>,

    // misc
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> BuyTicket<'info> {
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

    fn transfer_share_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.pay_account.to_account_info(),
                to: self.share_pot.to_account_info(),
                authority: self.payer.to_account_info(),
            },
        )
    }
}

pub fn verify_balls(
    balls: [u8; 64],
    num_of_balls: usize,
    ball_max_white: u8,
    ball_max_red: u8,
) -> usize {
    let mut num_of_bets: usize = 0;
    for i in 0..balls.len() {
        if balls[i] == 0 { break; }

        let ball_idx = i % num_of_balls;
        if ball_idx == num_of_balls - 1 {
            // verify red ball
            if (1..=ball_max_red).contains(&balls[i]) {
                num_of_bets += 1;
                continue;
            }
        } else if (1..=ball_max_white).contains(&balls[i]) {
            // verify white ball, and balls must be sorted
            if ball_idx == 0 || balls[i] > balls[i - 1] {
                continue;
            }
        }

        break;
    }

    num_of_bets
}

pub fn handler(
    ctx: Context<BuyTicket>,
    ticket_no: u64,
    balls: [u8; 64],
    num_of_bets: u8,
    multiplier: u8,
) -> Result<()> {
    let now_ts = now_ts()?;

    // betting closed
    if ctx.accounts.draw.close_ts < now_ts || ctx.accounts.draw.drawn_ts > 0 {
        return Err(error!(ErrorCode::BettingClosed));
    }
    // invalid params
    if !(1..=12).contains(&num_of_bets) || !(1..=10).contains(&multiplier)
        || multiplier < ctx.accounts.pool.min_betting_multiplier {
        return Err(error!(ErrorCode::InvalidParameter));
    }

    // verify balls
    let valid_num_of_bets = verify_balls(balls, BALL_NUM_PER_BET, ctx.accounts.pool.ball_max_white, ctx.accounts.pool.ball_max_red);
    if usize::from(num_of_bets) != valid_num_of_bets {
        return Err(error!(ErrorCode::IncorrectBalls));
    }

    // copy valid balls
    let mut valid_balls: [u8; 64] = [0; 64];
    for i in 0..(valid_num_of_bets * BALL_NUM_PER_BET) {
        valid_balls[i] = balls[i].into();
    }

    // calculate ticket price
    let single_ticket_price = ctx.accounts.pool.ticket_price;
    let ticket_price = single_ticket_price.try_mul(num_of_bets.into())?.try_mul(multiplier.into())?;

    // update prize pool
    let count_bets = num_of_bets.try_mul(multiplier)?;
    let dealer_share_rate = ctx.accounts.dealer.share_rate;
    let partner_share_rate = ctx.accounts.dealer.partner_rate;
    let pool = &mut ctx.accounts.pool;
    let (prize_amount, total_share_amount, dealer_share_amount, partner_share_amount, team_share_amount) = pool.buy_ticket(ticket_price, count_bets, dealer_share_rate, partner_share_rate)?;

    // transfer betting token
    token::transfer(ctx.accounts.transfer_prize_ctx(), prize_amount)?;
    token::transfer(ctx.accounts.transfer_share_ctx(), total_share_amount)?;

    // write prize ticket on-chain
    let ticket = &mut ctx.accounts.ticket;
    ticket.owner = ctx.accounts.owner.key();
    ticket.dealer = ctx.accounts.dealer.no;
    ticket.draw = ctx.accounts.draw.period;
    ticket.num_of_bets = num_of_bets.into();
    ticket.multiplier = multiplier;
    ticket.created_at = now_ts;
    ticket.ticket_no = ticket_no;
    ticket.balls = valid_balls;

    // update prize draw
    let draw = &mut ctx.accounts.draw;
    draw.amount.try_add_assign(ticket_price)?;
    draw.num_of_bets.try_add_assign(count_bets.into())?;
    draw.team_share_amount.try_add_assign(team_share_amount)?;
    draw.dealer_share_amount.try_add_assign(dealer_share_amount)?;
    draw.partner_share_amount.try_add_assign(partner_share_amount)?;

    // update dealer
    let dealer_num_of_bets = ctx.accounts.dealer.num_of_bets;
    let dealer = &mut ctx.accounts.dealer;
    // fix amount of tickets
    if dealer_num_of_bets > 0 && dealer.amount_of_bets == 0 {
        dealer.amount_of_bets.try_add_assign(dealer_num_of_bets.try_mul(single_ticket_price)?)?;
    }
    dealer.amount_of_bets.try_add_assign(ticket_price)?;
    dealer.num_of_bets.try_add_assign(count_bets.into())?;
    dealer.accrued_share_amount.try_add_assign(dealer_share_amount)?;

    // update partner
    let partner = &mut ctx.accounts.partner;
    partner.accrued_share_amount.try_add_assign(partner_share_amount)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::instructions::*;

    #[test]
    fn test_balls() {
        let num_of_balls = 5;
        let ball_max_white: u8 = 40;
        let ball_max_red: u8 = 7;
        let mut balls:[u8; 64]  = [0; 64];

        balls[..10].clone_from_slice(&[2, 7, 9, 33, 6, 2, 7, 9, 33, 6]);
        assert_eq!(verify_balls(balls, num_of_balls, ball_max_white, ball_max_red), 2);

        balls[..10].clone_from_slice(&[2, 7, 9, 30, 6, 2, 7, 9, 33, 9]);
        assert_eq!(verify_balls(balls, num_of_balls, ball_max_white, ball_max_red), 1);

        balls[..10].clone_from_slice(&[2, 7, 9, 42, 6, 2, 7, 9, 33, 6]);
        assert_eq!(verify_balls(balls, num_of_balls, ball_max_white, ball_max_red), 0);

        balls[..10].clone_from_slice(&[2, 7, 33, 30, 6, 2, 7, 9, 33, 9]);
        assert_eq!(verify_balls(balls, num_of_balls, ball_max_white, ball_max_red), 0);
    }
}