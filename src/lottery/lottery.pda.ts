import { PublicKey } from '@solana/web3.js';
import { LOTTERY_PROG_ID } from '../index';
import { BN } from '@project-serum/anchor';

export const findPrizeTicketPDA = async (pool: PublicKey, draw: PublicKey, owner: PublicKey, ticketNo: BN) => {
  return PublicKey.findProgramAddress([Buffer.from('prize_ticket'), pool.toBytes(), draw.toBytes(), owner.toBytes(), ticketNo.toArray('le', 8)], LOTTERY_PROG_ID);
};

export const findBetPlanPDA = async (pool: PublicKey, owner: PublicKey, ticketNo: BN) => {
  return PublicKey.findProgramAddress([Buffer.from('bet_plan'), pool.toBytes(), owner.toBytes(), ticketNo.toArray('le', 8)], LOTTERY_PROG_ID);
};

export const findPrizeDrawPDA = async (pool: PublicKey, period: BN) => {
  return PublicKey.findProgramAddress([Buffer.from("prize_draw"), pool.toBytes(), period.toArray('le', 8)], LOTTERY_PROG_ID);
};

export const findDealerPDA = async (pool: PublicKey, dealerNo: BN) => {
  return PublicKey.findProgramAddress([Buffer.from("dealer"), pool.toBytes(), dealerNo.toArray('le', 8)], LOTTERY_PROG_ID);
};

export const findPartnerPDA = async (pool: PublicKey, no: BN) => {
  return PublicKey.findProgramAddress([Buffer.from("partner"), pool.toBytes(), no.toArray('le', 8)], LOTTERY_PROG_ID);
};

export const findPoolAuthorityPDA = async (pool: PublicKey) => {
  return PublicKey.findProgramAddress([pool.toBytes()], LOTTERY_PROG_ID);
};

export const findBonusPotPDA = async (pool: PublicKey) => {
  return PublicKey.findProgramAddress([Buffer.from("bonus_pot"), pool.toBytes()], LOTTERY_PROG_ID);
};

export const findSharePotPDA = async (pool: PublicKey) => {
  return PublicKey.findProgramAddress([Buffer.from("share_pot"), pool.toBytes()], LOTTERY_PROG_ID);
};

export const findPrizePotPDA = async (pool: PublicKey) => {
  return PublicKey.findProgramAddress([Buffer.from("prize_pot"), pool.toBytes()], LOTTERY_PROG_ID);
};

export const findPlanPotPDA = async (pool: PublicKey) => {
  return PublicKey.findProgramAddress([Buffer.from("plan_pot"), pool.toBytes()], LOTTERY_PROG_ID);
};