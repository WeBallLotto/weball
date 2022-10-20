import { Connection, PublicKey } from '@solana/web3.js';
const { getAssociatedTokenAddress } = require("@solana/spl-token");

export class AccountUtils {
  conn: Connection;

  constructor(conn: Connection) {
    this.conn = conn;
  }

  // --------------------------------------- PDA

  async findProgramAddress(programId: PublicKey, seeds: (PublicKey | Uint8Array | string)[]): Promise<[PublicKey, number]> {
    const seed_bytes = seeds.map((s) => {
      if (typeof s == 'string') {
        return Buffer.from(s);
      } else if ('toBytes' in s) {
        return s.toBytes();
      } else {
        return s;
      }
    });
    return await PublicKey.findProgramAddress(seed_bytes, programId);
  }

  // --------------------------------------- Normal account

  async getBalance(publicKey: PublicKey): Promise<number> {
    return this.conn.getBalance(publicKey);
  }

  async findATA(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
    return getAssociatedTokenAddress(mint, owner);
  }
}
