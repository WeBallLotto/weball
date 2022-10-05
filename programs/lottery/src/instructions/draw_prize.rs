use crate::*;
use crate::common::{errors::ErrorCode, *};
pub use switchboard_v2::{VrfAccountData, VrfRequestRandomness, OracleQueueAccountData, PermissionAccountData, SbState};
use anchor_spl::token::{Token, TokenAccount};
pub use switchboard_v2::SWITCHBOARD_PROGRAM_ID;
use crate::state::*;
use arrayref::array_ref;

#[derive(Accounts)]
pub struct DrawPrize<'info> {
    #[account(mut, has_one = drawer)]
    pub pool: Box<Account<'info, PrizePool>>,

    /// CHECK:
    #[account(mut, signer)]
    pub drawer: AccountInfo<'info>,

    #[account(mut, has_one = pool)]
    pub draw: Box<Account<'info, PrizeDraw>>,

    #[account(mut, has_one = pool, has_one = vrf, has_one = authority)]
    pub state: Box<Account<'info, VrfClient>>,
    /// CHECK:
    #[account(signer)] // client authority needs to sign
    pub authority: AccountInfo<'info>,
    /// CHECK:
    #[account(constraint = switchboard_program.executable == true)]
    pub switchboard_program: AccountInfo<'info>,
    /// CHECK: Will be checked in the CPI instruction
    #[account(mut, constraint = vrf.owner.as_ref() == switchboard_program.key().as_ref())]
    pub vrf: AccountInfo<'info>,
    /// CHECK: Will be checked in the CPI instruction
    #[account(mut, constraint = oracle_queue.owner.as_ref() == switchboard_program.key().as_ref())]
    pub oracle_queue: AccountInfo<'info>,
    /// CHECK: Will be checked in the CPI instruction
    pub queue_authority: UncheckedAccount<'info>,
    /// CHECK: Will be checked in the CPI instruction
    #[account(constraint = data_buffer.owner.as_ref() == switchboard_program.key().as_ref())]
    pub data_buffer: AccountInfo<'info>,
    /// CHECK: Will be checked in the CPI instruction
    #[account(mut, constraint = permission.owner.as_ref() == switchboard_program.key().as_ref())]
    pub permission: AccountInfo<'info>,
    #[account(mut, constraint = escrow.owner == program_state.key())]
    pub escrow: Account<'info, TokenAccount>,
    #[account(mut, constraint = payer_wallet.owner == payer_authority.key())]
    pub payer_wallet: Account<'info, TokenAccount>,
    /// CHECK:
    #[account(signer)]
    pub payer_authority: AccountInfo<'info>,
    /// CHECK:
    #[account(address = solana_program::sysvar::recent_blockhashes::ID)]
    pub recent_blockhashes: AccountInfo<'info>,
    /// CHECK: Will be checked in the CPI instruction
    #[account(constraint = program_state.owner.as_ref() == switchboard_program.key().as_ref())]
    pub program_state: AccountInfo<'info>,
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<DrawPrize>,
    permission_bump: u8,
    switchboard_state_bump: u8,
) -> Result<()> {
    let now_ts = now_ts()?;
    // the prize can only be drawn five minutes after closed
    if ctx.accounts.draw.close_ts + 300 > now_ts || ctx.accounts.draw.drawn_ts > 0 {
        return Err(error!(ErrorCode::IllegalState));
    }

    // for security, request a new VRF result to draw prize
    if ctx.accounts.state.consume_ts == 0 && now_ts.try_sub(ctx.accounts.state.update_ts)? < 180 {
        let state = &mut ctx.accounts.state;
        let vrf_results: [u64; 4] = [
            u64::from_le_bytes(*array_ref![state.result_buffer, 0, 8]),
            u64::from_le_bytes(*array_ref![state.result_buffer, 8, 8]),
            u64::from_le_bytes(*array_ref![state.result_buffer, 16, 8]),
            u64::from_le_bytes(*array_ref![state.result_buffer, 24, 8]),
        ];

        // update consume time of vrf state
        state.consume_ts = now_ts;

        // generate balls
        let ball_len = ctx.accounts.draw.balls.len();
        let draw = &mut ctx.accounts.draw;
        for vrf_result in vrf_results {
            // random number must be greater than zero
            if vrf_result == 0 {
                continue;
            }
            let index = draw.balls.iter().position(|&x| x == 0).unwrap_or(ball_len);
            if index < ball_len - 1 {
                let ball_max = ctx.accounts.pool.ball_max_white;
                let ball = (vrf_result % ball_max as u64) as u8 + 1;
                // no duplicate balls allowed
                if draw.balls.iter().position(|&x| x == ball).unwrap_or(ball_len) == ball_len {
                    draw.balls[index] = ball;
                    msg!("update white ball at: {}, current balls: {:?}", index + 1, draw.balls);
                } else {
                    msg!("duplicate ball at: {}, ball: {}, current balls: {:?}", index, ball, draw.balls);
                    continue;
                }
            } else if index == ball_len - 1 {
                draw.balls[index] = (vrf_result % ctx.accounts.pool.ball_max_red as u64) as u8 + 1;
                draw.drawn_ts = now_ts;
                msg!("update red ball, current balls: {:?}", draw.balls);
                break;
            } else {
                draw.drawn_ts = now_ts;
                break;
            }
        }

        // prize draw completed
        if draw.drawn_ts > 0 {
            return Ok(());
        }
    }

    msg!("request vrf value");
    let vrf_request_randomness = VrfRequestRandomness {
        authority: ctx.accounts.state.to_account_info(),
        vrf: ctx.accounts.vrf.to_account_info(),
        oracle_queue: ctx.accounts.oracle_queue.to_account_info(),
        queue_authority: ctx.accounts.queue_authority.to_account_info(),
        data_buffer: ctx.accounts.data_buffer.to_account_info(),
        permission: ctx.accounts.permission.to_account_info(),
        escrow: ctx.accounts.escrow.clone(),
        payer_wallet: ctx.accounts.payer_wallet.clone(),
        payer_authority: ctx.accounts.payer_authority.to_account_info(),
        recent_blockhashes: ctx.accounts.recent_blockhashes.to_account_info(),
        program_state: ctx.accounts.program_state.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
    };
    let bump = ctx.accounts.state.bump.clone();
    let pool_key = ctx.accounts.pool.key().clone();
    let vrf_key = ctx.accounts.vrf.key.clone();
    let authority_key = ctx.accounts.authority.key.clone();
    let sb_program = ctx.accounts.switchboard_program.to_account_info();
    let state_seeds: &[&[&[u8]]] = &[&[&STATE_SEED, pool_key.as_ref(), vrf_key.as_ref(), authority_key.as_ref(), &[bump]]];
    vrf_request_randomness.invoke_signed(sb_program, switchboard_state_bump, permission_bump, state_seeds)?;

    Ok(())
}