use anchor_lang::prelude::*;

#[error_code]
#[derive(Eq, PartialEq)]
pub enum ErrorCode {
    #[msg("Not a valid Switchboard account")]
    InvalidSwitchboardAccount,

    #[msg("The max result must not exceed u64")]
    MaxResultExceedsMaximum,

    #[msg("Current round result is empty")]
    EmptyCurrentRoundResult,

    #[msg("Invalid authority account provided.")]
    InvalidAuthorityError,

    #[msg("Invalid VRF account provided.")]
    InvalidVrfAccount,

    #[msg("failed to perform some math operation safely")]
    ArithmeticError,

    #[msg("unknown instruction called")]
    UnknownInstruction,

    #[msg("invalid parameter passed")]
    InvalidParameter,

    #[msg("anchor serialization issue")]
    AnchorSerializationIssue,

    #[msg("permission denied")]
    PermissionDenied,

    #[msg("illegal state")]
    IllegalState,

    #[msg("incorrect balls")]
    IncorrectBalls,

    #[msg("stop betting now")]
    BettingClosed,

    #[msg("insufficient balance")]
    InsufficientBalance,

    #[msg("sorry, you are not a winner")]
    NotWinner,

    #[msg("sorry, ticket has expired")]
    TicketExpired,
}
