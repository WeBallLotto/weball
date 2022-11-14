# Blockchain lottery experience

### Build ts sdk
```
yarn install
yarn pub
``` 

### Buy ticket
```
    const dealerPK = new PublicKey("your dealer pubkey");
    const owner = new PublicKey("owner pubkey");
    const pool = new PublickKey("8p6BjXBnjyPNxyZaKAYP9m1BGsmr6qqkB63JxY5wmVxo");

    const numOfBets = 12;
    // generate the betting number(array length must be 64)
    let balls = Array(64).fill(0);
    for (let i = 0; i < numOfBets; i++) {
        // one betting contains 5 balls, and the white balls must be sorted
        balls.push(...[7, 12, 23, 39, 5]);
    }

    // maximum 4 bets in one transaction
    const bets = [];
    bets.push({
      balls: Uint8Array.from(balls),
      numOfBets: numOfBets, 
      multiplier: 1,
      ticketNo: new BN(randomInt(1, Math.pow(2, 32) - 1))
    });
    // bets.push(...);

    const signWallet：any = null; // wallet adapter
    const connection = null; // connection
    const idl = await (await fetch('lottery.json')).json(); // run 'anchor build' to generate
    const cient = new LotteryClient(connection, signWallet, idl, LOTTERY_PROG_ID)
    const {txSigs} = await client.buyTicket(pool, owner, owner, dealerPK, bets, signWallet, []);
```

### Fetch tickets
```
    const period = 20221018;
    const owner = new PublicKey("owner pubkey");

    const signWallet：any = null; // wallet adapter
    const connection = null; // connection
    const idl = await (await fetch('lottery.json')).json(); // run 'anchor build' to generate
    const cient = new LotteryClient(connection, signWallet, idl, LOTTERY_PROG_ID)
    const result = await client.fetchAllPrizeTickets(owner, new BN(period));
    if (!result || !result.length) {
        console.log("No tickets found");
        return;
    }
    
    result = result.sort((a:any,b:any)=>{return b.account.createdAt.toNumber()-a.account.createdAt.toNumber()});
```

### Redeem tickets
```
    import {NATIVE_MINT} from '@solana/spl-token';
    import { findPrizeDrawPDA, evalTicket } from '@/dist';

    const period = 20221018;
    const owner = new PublicKey("owner pubkey");
    const pool = new PublickKey("8p6BjXBnjyPNxyZaKAYP9m1BGsmr6qqkB63JxY5wmVxo");

    const signWallet：any = null; // wallet adapter
    const connection = null; // connection
    const idl = await (await fetch('lottery.json')).json(); // run 'anchor build' to generate
    const cient = new LotteryClient(connection, signWallet, idl, LOTTERY_PROG_ID)

    const [drawPK, bump] = await findPrizeDrawPDA(pool, period);
    const drawAcc = await client.fetchPrizeDraw(drawPK);
    
    const myTickets = 'fetch tickets';
    const tickets = [];
    for (const t of myTickets) {
        // only for same period and unredeemed ticket
        if (t.account.draw.toNumber() !== period.toNumber()
            || t.account.redeemedBonus.toNumber() > 0) continue;
        // check the ticket bonus
        const {bonus, wepot} = evalTicket(t.account, drawAcc.balls, 1);
        if (bonus > 0 || wepot > 0) tickets.push({pubkey: t.publicKey, no: t.account.ticketNo});
    }

    if (tickets.length <= 0) {
        alert("you are not winner");
        return
    }
    
    const result = await client.redeemTicket(pool, owner, period, tickets, NATIVE_MINT, signWallet);
```


