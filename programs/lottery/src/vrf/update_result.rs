use crate::*;
pub use switchboard_v2::VrfAccountData;
pub use switchboard_v2::SWITCHBOARD_PROGRAM_ID;
use crate::common::{errors::ErrorCode, *};
use crate::state::*;

#[derive(Accounts)]
pub struct UpdateResult<'info> {
    /// CHECK:
    pub pool: AccountInfo<'info>,
    #[account(mut, has_one = pool, has_one = vrf)]
    pub state: Box<Account<'info, VrfClient>>,
    #[account(constraint = *vrf.to_account_info().owner == SWITCHBOARD_PROGRAM_ID @ ErrorCode::InvalidSwitchboardAccount)]
    pub vrf: AccountLoader<'info, VrfAccountData>,
}

pub fn handler(
    ctx: Context<UpdateResult>
) -> Result<()> {
    let vrf = ctx.accounts.vrf.load()?;
    let result_buffer = vrf.get_result()?;
    if result_buffer == [0u8; 32] {
        msg!("vrf buffer empty");
        return Ok(());
    }

    let state = &mut ctx.accounts.state;
    if result_buffer == state.result_buffer {
        msg!("existing result_buffer");
        return Ok(());
    }

    state.result_buffer = result_buffer;
    state.consume_ts = 0;
    state.update_ts = now_ts()?;

    Ok(())
}
