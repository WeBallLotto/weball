import * as anchor from '@project-serum/anchor';
import {BN, Idl, Program, AnchorProvider} from '@project-serum/anchor';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
  ComputeBudgetProgram
} from '@solana/web3.js';
import {Lottery} from '../types/lottery';
import {AccountUtils, BetTicket, stringifyPKsAndBNs, sleep, isKp} from '../common';
import {ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, NATIVE_MINT} from '@solana/spl-token';
import {findBonusPotPDA, findDealerPDA, findPartnerPDA, findPoolAuthorityPDA, findPrizeDrawPDA, findPrizePotPDA, findPrizeTicketPDA, findSharePotPDA} from './lottery.pda';
const {createAssociatedTokenAccountInstruction, createCloseAccountInstruction, createSyncNativeInstruction, createBurnCheckedInstruction} = require("@solana/spl-token");

export class LotteryClient extends AccountUtils {
  // @ts-ignore
  wallet: any;
  provider!: anchor.Provider;
  program!: anchor.Program<Lottery>;

  constructor(
    conn: Connection,
    wallet:any,
    idl?: Idl,
    programId?: PublicKey
  ) {
    super(conn);
    this.wallet = wallet;
    this.setProvider();
    this.setProgram(idl, programId);
  }

  setProvider() {
    this.provider = new AnchorProvider(this.conn, this.wallet, AnchorProvider.defaultOptions());
    anchor.setProvider(this.provider);
  }

  setProgram(idl?: Idl, programId?: PublicKey) {
    //instantiating program depends on the environment
    if (idl && programId) {
      //means running in prod
      this.program = new anchor.Program<Lottery>(idl as any, programId, this.provider);
    } else {
      //means running inside test suite
      // @ts-ignore
      this.program = anchor.workspace.Lottery as Program<Lottery>;
    }
  }

  // --------------------------------------- fetch deserialized accounts

  async fetchPrizePool(pool: PublicKey) {
    return this.program.account.prizePool.fetch(pool);
  }

  async fetchDealer(dealer: PublicKey) {
    return this.program.account.dealer.fetch(dealer);
  }

  async fetchPrizeDraw(draw: PublicKey) {
    return this.program.account.prizeDraw.fetch(draw);
  }

  async fetchPrizeTicket(ticket: PublicKey) {
    return this.program.account.prizeTicket.fetch(ticket);
  }

  // --------------------------------------- get all PDAs
  async fetchAllPrizePool(manager?: PublicKey) {
    // offset: need to prepend 8 bytes for anchor's disc
    const filter = manager ? [{ memcmp: { offset: 8,  bytes: manager.toBase58() } }] : [];
    const pdas = await this.program.account.prizePool.all(filter);
    console.log(`found ${pdas.length} pools`);
    return pdas;
  }

  async fetchAllPrizeDraw(pool?: PublicKey) {
    const filter = pool ? [{ memcmp: { offset: 8,  bytes: pool.toBase58() } }] : [];
    const pdas = await this.program.account.prizeDraw.all(filter);
    console.log(`found ${pdas.length} draws`);
    return pdas;
  }

  async fetchAllPartner(pool?: PublicKey, wallet?: PublicKey) {
    const filter = [];
    if (pool) filter.push({ memcmp: { offset: 8,  bytes: pool.toBase58() } });
    if (wallet) filter.push({ memcmp: { offset: 40,  bytes: wallet.toBase58() } });

    const pdas = await this.program.account.partner.all(filter);
    console.log(`found ${pdas.length} partners`);
    return pdas;
  }

  async fetchAllDealer(pool?: PublicKey, wallet?: PublicKey) {
    const filter = [];
    if (pool) filter.push({ memcmp: { offset: 8,  bytes: pool.toBase58() } });
    if (wallet) filter.push({ memcmp: { offset: 40,  bytes: wallet.toBase58() } });
    const pdas = await this.program.account.dealer.all(filter);
    console.log(`found ${pdas.length} dealers`);
    return pdas;
  }

  async fetchAllPrizeTickets(owner?: PublicKey, period?: BN) {
    const filter = [];
    if (owner) filter.push({ memcmp: { offset: 8,  bytes: owner.toBase58() } });
    if (period) filter.push({ memcmp: { offset: 48,  bytes: period.toArray('le', 8) } });
    const pdas = await this.program.account.prizeTicket.all(filter);
    console.log(`found ${pdas.length} tickets`);
    return pdas;
  }

  // --------------------------------------- execute ixs

  async initPrizePool(
      manager: PublicKey,
      prizeMint: PublicKey,
      ticketPrice: BN,
      houseFeeRate: number,
      ball_max_white: number,
      ball_max_red: number,
      min_betting_ts: number,
      max_betting_ts: number,
  ) {
    const ixs = [];
    const pool = Keypair.generate();
    const [poolAuthority, poolAuthBump] = await findPoolAuthorityPDA(pool.publicKey);
    const [bonusPot, bpBump] = await findBonusPotPDA(pool.publicKey);
    const [sharePot, tpBump] = await findSharePotPDA(pool.publicKey);
    const [prizePot, pBump] = await findPrizePotPDA(pool.publicKey);
    const [draw, dBump] = await findPrizeDrawPDA(pool.publicKey, new BN(0));

    ixs.push(await this.program.instruction.initPrizePool(poolAuthBump, ticketPrice, houseFeeRate, ball_max_white, ball_max_red, new BN(min_betting_ts), new BN(max_betting_ts),
        {
          accounts: {
            pool: pool.publicKey,
            manager,
            poolAuthority,
            bonusPot,
            sharePot,
            prizePot,
            prizeMint,
            draw,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }
    ));

    return this.sendTransaction(ixs, [pool]);
  }

  async updatePrizePool(
      pool: PublicKey,
      manager: PublicKey,
      new_manager: PublicKey,
      new_drawer: PublicKey,
      min_betting_ts: number,
      max_betting_ts: number,
      minBettingMultiplier: number,
  ) {
    const ixs = [];
    ixs.push(await this.program.instruction.updatePrizePool(new_manager, new_drawer, new BN(min_betting_ts), new BN(max_betting_ts), minBettingMultiplier,
        {
          accounts: {
            pool: pool,
            signer: manager,
            systemProgram: SystemProgram.programId,
          },
        }
    ));

    return this.sendTransaction(ixs, []);
  }

  async depositPrizePool(
      pool: PublicKey,
      payer: PublicKey,
      prizePot: PublicKey,
      prizeMint: PublicKey,
      amount: BN,
  ) {
    const payAccount = await this.findATA(prizeMint, payer);
    let ixs = [];
    // only for WRAPPED SOL
    if (prizeMint.toBase58() === NATIVE_MINT.toBase58())
      ixs = await this.buildWrappedSolIxs(payer, amount);
    ixs.push(await this.program.instruction.depositPrizePool(amount,
        {
          accounts: {
            pool,
            payer,
            payAccount,
            prizePot,
            prizeMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }
    ));
    return this.sendTransaction(ixs, []);
  }

  async initPartner(
      pool: PublicKey,
      manager: PublicKey,
      wallet: PublicKey,
      no: BN,
      name: string,
  ) {
    const ixs = [];
    const [partner, pBump] = await findPartnerPDA(pool, no);
    ixs.push(await this.program.instruction.initPartner(no, name, wallet,
        {
          accounts: {
            pool,
            manager,
            partner,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        },
    ));

    return this.sendTransaction(ixs, []);
  }

  async updatePartner(
      pool: PublicKey,
      manager: PublicKey,
      partner: PublicKey,
      wallet: PublicKey,
      name: string,
  ) {
    const ixs = [];
    ixs.push(await this.program.instruction.updatePartner(name, wallet,
        {
          accounts: {
            pool,
            manager,
            partner,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        },
    ));

    return this.sendTransaction(ixs, []);
  }

  async initDealer(
      pool: PublicKey,
      manager: PublicKey,
      partner: PublicKey,
      wallet: PublicKey,
      dealerNo: BN,
      dealerName: string,
      shareRate: number,
      partnerRate: number,
  ) {
    const ixs = [];
    const [dealer, dealerBump] = await findDealerPDA(pool, dealerNo);
    ixs.push(await this.program.instruction.initDealer(dealerNo, dealerName, wallet, shareRate, partnerRate,
        {
          accounts: {
            pool,
            manager,
            dealer,
            partner,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        },
    ));

    return this.sendTransaction(ixs, []);
  }

  async updateDealer(
      pool: PublicKey,
      manager: PublicKey,
      dealer: PublicKey,
      partner: PublicKey,
      wallet: PublicKey,
      dealerName: string,
      shareRate: number,
      partnerRate: number,
  ) {
    const ixs = [];
    ixs.push(await this.program.instruction.updateDealer(dealerName, wallet, shareRate, partnerRate,
        {
          accounts: {
            pool,
            manager,
            dealer,
            partner,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        },
    ));

    return this.sendTransaction(ixs, []);
  }

  async initPrizeDraw(
      pool: PublicKey,
      manager: PublicKey,
      newestDraw: PublicKey,
      period: BN,
      closeTs: BN,
      bonusMultiplier: number,
  ) {
    const ixs = [];
    const [nextDraw, drawBump] = await findPrizeDrawPDA(pool, period);
    ixs.push(await this.program.instruction.initPrizeDraw(period, closeTs, bonusMultiplier,
        {
          accounts: {
            pool,
            manager,
            newestDraw,
            nextDraw,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          }
        },
    ));

    return this.sendTransaction(ixs, []);
  }

  async drawPrize(
      pool: PublicKey,
      drawer: PublicKey,
      draw: PublicKey,
      vrf: PublicKey,
      vrfClient: PublicKey,
      escrow: PublicKey,
      queueAuthority: PublicKey,
      dataBuffer: PublicKey,
      programState: PublicKey,
      permission: PublicKey,
      switchboardProgram: PublicKey,
      oracleQueue: PublicKey,
      permissionBump: number,
      switchboardStateBump: number,
  ) {
    let ixs = [];
    const payerWallet = await this.findATA(NATIVE_MINT, drawer);
    // check payer balance, deposit if insufficient
    const wSolAcc = await this.conn.getParsedAccountInfo(payerWallet);
    if (!wSolAcc || !wSolAcc.value || (wSolAcc.value.data as any).parsed.info.tokenAmount.uiAmount < 0.01)
      ixs = await this.buildWrappedSolIxs(drawer, 1e7);

    ixs.push(await this.program.instruction.drawPrize(permissionBump, switchboardStateBump,
        {
          accounts: {
            pool,
            drawer,
            draw,
            state: vrfClient,
            authority: drawer,
            switchboardProgram,
            vrf,
            oracleQueue,
            queueAuthority,
            dataBuffer,
            permission,
            escrow,
            payerWallet,
            payerAuthority: drawer,
            recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
            programState,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          },
        },
    ));

    return this.sendTransaction(ixs, []);
  }

  async buyTicket(
      pool: PublicKey,
      payer: PublicKey|Keypair,
      owner: PublicKey,
      dealer: PublicKey,
      tickets: BetTicket[],
      wallet: any,
      burnTokens: PublicKey[] = [],
  ) {
    if(tickets.length <= 0) return {};

    const signers = [];
    if (isKp(payer)) signers.push(<Keypair>payer);
    const payerPK = isKp(payer) ? (<Keypair>payer).publicKey : <PublicKey>payer;
    const poolAccount = await this.fetchPrizePool(pool);
    const dealerAccount = await this.fetchDealer(dealer);
    const prizeMint = poolAccount.prizeMint;
    const isWsol = prizeMint.toBase58() === NATIVE_MINT.toBase58();
    const payAccount = await this.findATA(prizeMint, payerPK);
    const draw = poolAccount.newestDraw;

    const ixs = [];
    let remainingAccounts = [];
    let index = burnTokens.length;
    for (const mint of burnTokens) {
      index -= 1;
      const ata = await this.findATA(mint, payerPK);
      remainingAccounts.push({ pubkey: mint, isWritable: true, isSigner: false });
      remainingAccounts.push({ pubkey: ata, isWritable: true, isSigner: false });
      if (remainingAccounts.length === 28 || index == 0) {
        ixs.push([await this.program.instruction.burn(
            remainingAccounts.length / 2,
            { accounts: {owner, tokenProgram: TOKEN_PROGRAM_ID}, remainingAccounts }
        )]);
        remainingAccounts = [];
      }
    }

    let buyIxs = [];
    let totalPrice = 0;
    for (const bt of tickets) {
      const multiplier = bt.multiplier > poolAccount.minBettingMultiplier ? bt.multiplier : poolAccount.minBettingMultiplier;
      const [ticket, ticketBump] = await findPrizeTicketPDA(pool, draw, owner, bt.ticketNo);
      totalPrice += poolAccount.ticketPrice.toNumber() * bt.numOfBets * multiplier;
      buyIxs.push(await this.program.instruction.buyTicket(bt.ticketNo, bt.balls, bt.numOfBets, multiplier,
          {
            accounts: {
              pool,
              payer: payerPK,
              owner,
              dealer,
              partner: dealerAccount.partner,
              draw,
              ticket,
              prizePot: poolAccount.prizePot,
              sharePot: poolAccount.sharePot,
              prizeMint,
              payAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
          }
      ));
    }


    ixs.push([]);
    // convert wrapped sol
    if (isWsol) ixs[ixs.length - 1].push(...(await this.buildWrappedSolIxs(payerPK, totalPrice)));
    ixs[ixs.length - 1].push(...buyIxs);

    // why waitCompleted set to 1? if instructions is too large, we need convert wSOL first,
    // otherwise the transactions will fail due to insufficient balance
    return this.sendTransactions(ixs, signers, wallet, 0);
  }

  async buyTicketAdvance(
      pool: PublicKey,
      poolAccount: any,
      payer: PublicKey|Keypair,
      owner: PublicKey,
      dealer: PublicKey,
      partner: PublicKey,
      tickets: BetTicket[],
  ) {
    if(tickets.length <= 0) return {};

    const signers = [];
    if (isKp(payer)) signers.push(<Keypair>payer);
    const payerPK = isKp(payer) ? (<Keypair>payer).publicKey : <PublicKey>payer;
    const prizeMint = poolAccount.prizeMint;
    const payAccount = await this.findATA(prizeMint, payerPK);
    const draw = poolAccount.newestDraw;

    let ixs = [];
    let buyIxs = [];
    let totalPrice = 0;
    for (const bt of tickets) {
      const [ticket, ticketBump] = await findPrizeTicketPDA(pool, draw, owner, bt.ticketNo);
      totalPrice += poolAccount.ticketPrice.toNumber() * bt.numOfBets * bt.multiplier;
      buyIxs.push(await this.program.instruction.buyTicket(bt.ticketNo, bt.balls, bt.numOfBets, bt.multiplier,
          {
            accounts: {
              pool,
              payer: payerPK,
              owner,
              dealer,
              partner,
              draw,
              ticket,
              prizePot: poolAccount.prizePot,
              sharePot: poolAccount.sharePot,
              prizeMint,
              payAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
          }
      ));
    }
    // convert wrapped sol
    ixs.push(buyIxs);

    // why waitCompleted set to 1? if instructions is too large, we need convert wSOL first,
    // otherwise the transactions will fail due to insufficient balance
    return this.sendTransactions(ixs, signers, this.wallet, 0);
  }

  async transferBonus(
      pool: PublicKey,
      manager: PublicKey,
      draw: PublicKey,
      amount: BN,
      topAmount: BN,
  ) {
    const [poolAuthority, poolAuthBump] = await findPoolAuthorityPDA(pool);
    const [bonusPot, bpBump] = await findBonusPotPDA(pool);
    const [prizePot, pBump] = await findPrizePotPDA(pool);
    let ixs = [];
    ixs.push(await this.program.instruction.transferBonus(amount, topAmount,
        {
          accounts: {
            pool,
            poolAuthority,
            manager,
            draw,
            bonusPot,
            prizePot,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }
    ));
    return this.sendTransaction(ixs, []);
  }

  async recycleBonus(
      pool: PublicKey,
      manager: PublicKey,
      draw: PublicKey,
  ) {
    const [poolAuthority, poolAuthBump] = await findPoolAuthorityPDA(pool);
    const [bonusPot, bpBump] = await findBonusPotPDA(pool);
    const [prizePot, pBump] = await findPrizePotPDA(pool);
    let ixs = [];
    ixs.push(await this.program.instruction.recycleBonus(
        {
          accounts: {
            pool,
            poolAuthority,
            manager,
            draw,
            bonusPot,
            prizePot,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }
    ));
    return this.sendTransaction(ixs, []);
  }

  async redeemTicket(
      pool: PublicKey,
      owner: PublicKey,
      period: BN,
      tickets: any[],
      prizeMint: PublicKey,
      wallet: any,
  ) {
    if(tickets.length <= 0) return {};

    const receiver = await this.findATA(prizeMint, owner);
    const [poolAuthority, poolAuthBump] = await findPoolAuthorityPDA(pool);
    const [bonusPot, bpBump] = await findBonusPotPDA(pool);
    const [draw, drawBump] = await findPrizeDrawPDA(pool, period);
    let ixs = [];
    // only for WRAPPED SOL
    if (prizeMint.toBase58() === NATIVE_MINT.toBase58())
      ixs.push(await this.buildWrappedSolIxs(owner, 0));
    let redeemIxs = [];
    for (const tt of tickets) {
      const [ticket, bump_ticket] = await findPrizeTicketPDA(pool, draw, owner, tt.no);
      redeemIxs.push(await this.program.instruction.redeemTicket(bump_ticket, tt.no,
          {
            accounts: {
              pool,
              owner,
              draw,
              ticket,
              bonusPot,
              poolAuthority,
              receiver,
              prizeMint,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
          }
      ));
    }
    // pack every 4 ixs into one tx
    while(redeemIxs.length > 0) ixs.push([...redeemIxs.splice(0, 4)]);
    // close wSOL account
    if (prizeMint.toBase58() === NATIVE_MINT.toBase58())
      ixs[ixs.length - 1].push(createCloseAccountInstruction(receiver, owner, owner));
    return this.sendTransactions(ixs, [], wallet, 1);
  }

  async withdrawTeam(
      pool: PublicKey,
      manager: PublicKey,
      prizeMint: PublicKey,
  ) {
    const receiver = await this.findATA(prizeMint, manager);
    const [poolAuthority, poolAuthBump] = await findPoolAuthorityPDA(pool);
    const [sharePot, bpBump] = await findSharePotPDA(pool);
    let ixs = [];
    // only for WRAPPED SOL
    if (prizeMint.toBase58() === NATIVE_MINT.toBase58())
      ixs.push(...(await this.buildWrappedSolIxs(manager, 0)));

    ixs.push(await this.program.instruction.withdrawTeam(
          {
            accounts: {
              pool,
              poolAuthority,
              manager,
              sharePot,
              receiver,
              prizeMint,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
          }));
    // close wSOL account
    if (prizeMint.toBase58() === NATIVE_MINT.toBase58())
      ixs.push(createCloseAccountInstruction(receiver, manager, manager));
    return this.sendTransaction(ixs, []);
  }

  async withdrawDealer(
      pool: PublicKey,
      wallet: PublicKey,
      dealer: PublicKey,
      prizeMint: PublicKey,
  ) {
    const receiver = await this.findATA(prizeMint, wallet);
    const [poolAuthority, poolAuthBump] = await findPoolAuthorityPDA(pool);
    const [sharePot, bpBump] = await findSharePotPDA(pool);
    let ixs = [];
    // only for WRAPPED SOL
    if (prizeMint.toBase58() === NATIVE_MINT.toBase58())
      ixs.push(...(await this.buildWrappedSolIxs(wallet, 0)));

    ixs.push(await this.program.instruction.withdrawDealer(
        {
          accounts: {
            pool,
            poolAuthority,
            wallet,
            dealer,
            sharePot,
            receiver,
            prizeMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }));
    // close wSOL account
    if (prizeMint.toBase58() === NATIVE_MINT.toBase58())
      ixs.push(createCloseAccountInstruction(receiver, wallet, wallet));
    return this.sendTransaction(ixs, []);
  }

  async withdrawPartner(
      pool: PublicKey,
      wallet: PublicKey,
      partner: PublicKey,
      prizeMint: PublicKey,
  ) {
    const receiver = await this.findATA(prizeMint, wallet);
    const [poolAuthority, poolAuthBump] = await findPoolAuthorityPDA(pool);
    const [sharePot, bpBump] = await findSharePotPDA(pool);
    let ixs = [];
    // only for WRAPPED SOL
    if (prizeMint.toBase58() === NATIVE_MINT.toBase58())
      ixs.push(...(await this.buildWrappedSolIxs(wallet, 0)));

    ixs.push(await this.program.instruction.withdrawPartner(
        {
          accounts: {
            pool,
            poolAuthority,
            wallet,
            partner,
            sharePot,
            receiver,
            prizeMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }));
    // close wSOL account
    if (prizeMint.toBase58() === NATIVE_MINT.toBase58())
      ixs.push(createCloseAccountInstruction(receiver, wallet, wallet));
    return this.sendTransaction(ixs, []);
  }

  async closeWrappedSolAccount(owner: PublicKey) {
    const receiver = await this.findATA(NATIVE_MINT, owner);
    return this.sendTransaction([createCloseAccountInstruction(receiver, owner, owner)], []);
  }

  async buildWrappedSolIxs(owner: PublicKey, lamports: number, ignoreCheck: boolean = false) {
    const ixs = [];
    const wSolAta = await this.findATA(NATIVE_MINT, owner);
    if (!ignoreCheck) {
        const wSolAccountInfo = await this.conn.getAccountInfo(wSolAta);
        // register ata for receiver
        if (wSolAccountInfo === null)
            ixs.push(createAssociatedTokenAccountInstruction(owner, wSolAta, owner, NATIVE_MINT));
    }
    if (lamports > 0)
      ixs.push(SystemProgram.transfer({fromPubkey: owner, toPubkey: wSolAta, lamports: lamports}));
    ixs.push(createSyncNativeInstruction(wSolAta));
    return ixs;
  }

  async sendTransaction(instructions: any[], signers: any[], signWallet: any = this.wallet) {
    let tx = new Transaction({
      feePayer: signWallet.publicKey,
      recentBlockhash: (await this.conn.getLatestBlockhash()).blockhash,
    });
    for (const ix of instructions) tx.add(ix);
    tx = await signWallet.signTransaction(tx);
    if (signers.length > 0) tx.partialSign(...signers);
    const txSig = await this.conn.sendRawTransaction(tx.serialize());
    return {
      txSig,
    };
  }

  async sendTransactions(instructions: Array<Array<any>>, signers: any[], signWallet: any, waitCompleted: number = 0, throwError: boolean = true) {
    const unsignedTxs = [];
    for (const ixs of instructions) {
      let tx = new Transaction({
        feePayer: signWallet.publicKey,
        recentBlockhash: (await this.conn.getLatestBlockhash()).blockhash,
      });
      for (const ix of ixs) tx.add(ix);
      if (signers.length > 0) tx.partialSign(...signers);
      unsignedTxs.push(tx);
    }

    const txSigs = [];
    const signedTxs = await signWallet.signAllTransactions(unsignedTxs);
    const txLen = signedTxs.length;
    for (let i = 0; i < txLen; i++) {
      try {
          txSigs.push(await this.conn.sendRawTransaction(signedTxs[i].serialize()));
          await sleep((waitCompleted > i) ? 10000 : 2000); // wait a moment
      } catch (e) {
          if (throwError) throw e;
          else return { txSigs }
      }
    }

    return { txSigs };
  }
}