use crate::*;
pub use switchboard_v2::VrfAccountData;
pub use switchboard_v2::SWITCHBOARD_PROGRAM_ID;
use crate::common::{errors::ErrorCode};
use crate::state::*;

#[derive(Accounts)]
pub struct InitState<'info> {
    #[account()]
    pub pool: Box<Account<'info, PrizePool>>,

    #[account(init,
        seeds = [STATE_SEED, pool.key().as_ref(), vrf.key().as_ref(), authority.key().as_ref()],
        payer = payer, bump, space = 8 + std::mem::size_of::<VrfClient>())]
    pub state: Box<Account<'info, VrfClient>>,
    /// CHECK:
    pub authority: AccountInfo<'info>,
    /// CHECK:
    #[account(mut, signer)]
    pub payer: AccountInfo<'info>,
    /// CHECK:
    pub vrf: AccountInfo<'info>,
    #[account(address = solana_program::system_program::ID)]
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitState>
) -> Result<()> {
    // check permission
    ctx.accounts.pool.asset_manager(ctx.accounts.payer.key())?;

    msg!("Checking VRF Account");
    let vrf_account_info = &ctx.accounts.vrf;
    let vrf = VrfAccountData::new(vrf_account_info)
        .map_err(|_| ErrorCode::InvalidSwitchboardAccount)?;
    // client state needs to be authority in order to sign request randomness instruction
    if vrf.authority != ctx.accounts.state.key() {
        return Err(error!(ErrorCode::InvalidSwitchboardAccount));
    }

    msg!("Setting VrfClient state");
    let state = &mut ctx.accounts.state;
    state.bump = ctx.bumps.get("state").unwrap().clone();
    state.authority =  ctx.accounts.authority.key.clone();
    state.pool = ctx.accounts.pool.key().clone();
    state.vrf = ctx.accounts.vrf.key.clone();

    Ok(())
}
