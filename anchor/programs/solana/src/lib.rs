#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("DLw5fJNrrBCWoy75aukoDApBZm4MEvaWCvPJoqtLSg1p");

#[program]
pub mod solana {
    use super::*;

  pub fn close(_ctx: Context<CloseSolana>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.solana.count = ctx.accounts.solana.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.solana.count = ctx.accounts.solana.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeSolana>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.solana.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeSolana<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Solana::INIT_SPACE,
  payer = payer
  )]
  pub solana: Account<'info, Solana>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseSolana<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub solana: Account<'info, Solana>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub solana: Account<'info, Solana>,
}

#[account]
#[derive(InitSpace)]
pub struct Solana {
  count: u8,
}
