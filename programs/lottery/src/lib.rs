extern crate solana_program;
extern crate anchor_lang;
extern crate anchor_spl;

use solana_program::pubkey::Pubkey;
use anchor_lang::prelude::*;
use instructions::*;
use vrf::*;

pub mod instructions;
pub mod state;
pub mod common;
pub mod vrf;

declare_id!("WEBL9KJ2NVCTqvxE4Vz6jAuWudi6VaTQsxKCjeHFoAB");

#[program]
pub mod lottery {
    use super::*;

    pub fn init_prize_pool(
        ctx: Context<InitPrizePool>,
        bump_auth: u8,
        ticket_price: u64,
        share_rate: u8,
        ball_max_white: u8,
        ball_max_red: u8,
        min_betting_ts: u64,
        max_betting_ts: u64,
    ) -> Result<()> {
        instructions::init_prize_pool::handler(ctx, bump_auth, ticket_price, share_rate, ball_max_white, ball_max_red, min_betting_ts, max_betting_ts)
    }

    pub fn update_prize_pool(
        ctx: Context<UpdatePrizePool>,
        new_manager: Pubkey,
        new_drawer: Pubkey,
        min_betting_ts: u64,
        max_betting_ts: u64,
        min_betting_multiplier: u8,
    ) -> Result<()> {
        instructions::update_prize_pool::handler(ctx, new_manager, new_drawer, min_betting_ts, max_betting_ts, min_betting_multiplier)
    }

    pub fn deposit_prize_pool(
        ctx: Context<DepositPrizePool>,
        amount: u64,
    ) -> Result<()> {
        instructions::deposit_prize_pool::handler(ctx, amount)
    }

    pub fn transfer_bonus(
        ctx: Context<TransferBonus>,
        amount: u64,
        top_amount: u64,
    ) -> Result<()> {
        instructions::transfer_bonus::handler(ctx, amount, top_amount)
    }

    pub fn recycle_bonus(
        ctx: Context<RecycleBonus>,
    ) -> Result<()> {
        instructions::recycle_bonus::handler(ctx)
    }

    pub fn init_prize_draw(
        ctx: Context<InitPrizeDraw>,
        period: u64,
        close_ts: u64,
        bonus_multiplier: u8,
    ) -> Result<()> {
        instructions::init_prize_draw::handler(ctx, period, close_ts, bonus_multiplier)
    }

    pub fn draw_prize(
        ctx: Context<DrawPrize>,
        permission_bump: u8,
        switchboard_state_bump: u8,
    ) -> Result<()> {
        instructions::draw_prize::handler(ctx, permission_bump, switchboard_state_bump)
    }

    pub fn init_partner(
        ctx: Context<InitPartner>,
        partner_no: u64,
        partner_name: String,
        wallet: Pubkey,
    ) -> Result<()> {
        instructions::init_partner::handler(ctx, partner_no, partner_name, wallet)
    }

    pub fn update_partner(
        ctx: Context<UpdatePartner>,
        partner_name: String,
        wallet: Pubkey,
    ) -> Result<()> {
        instructions::update_partner::handler(ctx, partner_name, wallet)
    }

    pub fn init_dealer(
        ctx: Context<InitDealer>,
        dealer_no: u64,
        dealer_name: String,
        wallet: Pubkey,
        share_rate: u8,
        partner_rate: u8,
    ) -> Result<()> {
        instructions::init_dealer::handler(ctx, dealer_no, dealer_name, wallet, share_rate, partner_rate)
    }

    pub fn update_dealer(
        ctx: Context<UpdateDealer>,
        dealer_name: String,
        wallet: Pubkey,
        share_rate: u8,
        partner_rate: u8,
    ) -> Result<()> {
        instructions::update_dealer::handler(ctx, dealer_name, wallet, share_rate, partner_rate)
    }

    pub fn buy_ticket<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, BuyTicket<'info>>,
        ticket_no: u64,
        balls: [u8; 64],
        num_of_bets: u8,
        multiplier: u8,
    ) -> Result<()> {
        instructions::buy_ticket::handler(ctx, ticket_no, balls, num_of_bets, multiplier)
    }

    pub fn init_bet_plan(
        ctx: Context<InitBetPlan>,
        ticket_no: u64,
        balls: [u8; 64],
        num_of_bets: u8,
        multiplier: u8,
        num_of_draw: u8,
        random: u8,
    ) -> Result<()> {
        instructions::init_bet_plan::handler(ctx, ticket_no, balls, num_of_bets, multiplier, num_of_draw, random)
    }

    pub fn close_bet_plan(
        ctx: Context<CloseBetPlan>,
        _bump_plan_pot: u8,
    ) -> Result<()> {
        instructions::close_bet_plan::handler(ctx)
    }

    pub fn redeem_ticket(
        ctx: Context<RedeemTicket>,
        _bump_ticket: u8,
        _ticket_no: u64
    ) -> Result<()> {
        instructions::redeem_ticket::handler(ctx)
    }

    pub fn withdraw_dealer(
        ctx: Context<WithdrawDealer>,
    ) -> Result<()> {
        instructions::withdraw_dealer::handler(ctx)
    }

    pub fn withdraw_partner(
        ctx: Context<WithdrawPartner>,
    ) -> Result<()> {
        instructions::withdraw_partner::handler(ctx)
    }

    pub fn withdraw_team(
        ctx: Context<WithdrawTeam>,
    ) -> Result<()> {
        instructions::withdraw_team::handler(ctx)
    }

    pub fn burn<'a, 'b, 'c, 'info>(ctx: Context<'a, 'b, 'c, 'info, Burn<'info>>, count: u8) -> Result<()> {
        instructions::burn::handler(ctx, count)
    }

    // request VRF on chain
    pub fn init_state(ctx: Context<InitState>) -> Result<()> {
        vrf::init_state::handler(ctx)
    }

    pub fn update_result(ctx: Context<UpdateResult>) -> Result<()> {
        vrf::update_result::handler(ctx)
    }
}