
export type Lottery = {
  "version": "0.1.0",
  "name": "lottery",
  "instructions": [
    {
      "name": "initPrizePool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusPot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sharePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpAuth",
          "type": "u8"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "shareRate",
          "type": "u8"
        },
        {
          "name": "ballMaxWhite",
          "type": "u8"
        },
        {
          "name": "ballMaxRed",
          "type": "u8"
        },
        {
          "name": "minBettingTs",
          "type": "u64"
        },
        {
          "name": "maxBettingTs",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updatePrizePool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newManager",
          "type": "publicKey"
        },
        {
          "name": "newDrawer",
          "type": "publicKey"
        },
        {
          "name": "minBettingTs",
          "type": "u64"
        },
        {
          "name": "maxBettingTs",
          "type": "u64"
        },
        {
          "name": "minBettingMultiplier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "depositPrizePool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferBonus",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusPot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "topAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "recycleBonus",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusPot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initPrizeDraw",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "newestDraw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextDraw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "period",
          "type": "u64"
        },
        {
          "name": "closeTs",
          "type": "u64"
        },
        {
          "name": "bonusMultiplier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "drawPrize",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "drawer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "switchboardProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dataBuffer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "recentBlockhashes",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "permissionBump",
          "type": "u8"
        },
        {
          "name": "switchboardStateBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initPartner",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "partner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "partnerNo",
          "type": "u64"
        },
        {
          "name": "partnerName",
          "type": "string"
        },
        {
          "name": "wallet",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updatePartner",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "partner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "partnerName",
          "type": "string"
        },
        {
          "name": "wallet",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "initDealer",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "partner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "dealerNo",
          "type": "u64"
        },
        {
          "name": "dealerName",
          "type": "string"
        },
        {
          "name": "wallet",
          "type": "publicKey"
        },
        {
          "name": "shareRate",
          "type": "u8"
        },
        {
          "name": "partnerRate",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateDealer",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "partner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "dealerName",
          "type": "string"
        },
        {
          "name": "wallet",
          "type": "publicKey"
        },
        {
          "name": "shareRate",
          "type": "u8"
        },
        {
          "name": "partnerRate",
          "type": "u8"
        }
      ]
    },
    {
      "name": "buyTicket",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "partner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sharePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ticketNo",
          "type": "u64"
        },
        {
          "name": "balls",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "numOfBets",
          "type": "u8"
        },
        {
          "name": "multiplier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "redeemTicket",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusPot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpTicket",
          "type": "u8"
        },
        {
          "name": "ticketNo",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawDealer",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sharePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawPartner",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "partner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sharePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawTeam",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "sharePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "burn",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "count",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initState",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vrf",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateResult",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vrf",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "dealer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "partner",
            "type": "publicKey"
          },
          {
            "name": "shareRate",
            "type": "u8"
          },
          {
            "name": "partnerRate",
            "type": "u8"
          },
          {
            "name": "paidOutAmount",
            "type": "u64"
          },
          {
            "name": "accruedShareAmount",
            "type": "u64"
          },
          {
            "name": "numOfBets",
            "type": "u64"
          },
          {
            "name": "amountOfBets",
            "type": "u64"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "no",
            "type": "u64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "partner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "accruedShareAmount",
            "type": "u64"
          },
          {
            "name": "paidOutAmount",
            "type": "u64"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "no",
            "type": "u64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "prizeDraw",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "period",
            "type": "u64"
          },
          {
            "name": "drawnTs",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "numOfBets",
            "type": "u64"
          },
          {
            "name": "topAmount",
            "type": "u64"
          },
          {
            "name": "bonusAmount",
            "type": "u64"
          },
          {
            "name": "paidOutAmount",
            "type": "u64"
          },
          {
            "name": "balls",
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          },
          {
            "name": "closeTs",
            "type": "u64"
          },
          {
            "name": "teamShareAmount",
            "type": "u64"
          },
          {
            "name": "dealerShareAmount",
            "type": "u64"
          },
          {
            "name": "partnerShareAmount",
            "type": "u64"
          },
          {
            "name": "bonusMultiplier",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "prizePool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "manager",
            "type": "publicKey"
          },
          {
            "name": "drawer",
            "type": "publicKey"
          },
          {
            "name": "poolAuthority",
            "type": "publicKey"
          },
          {
            "name": "poolAuthoritySeed",
            "type": "publicKey"
          },
          {
            "name": "poolAuthorityBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "prizeMint",
            "type": "publicKey"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "numOfBets",
            "type": "u64"
          },
          {
            "name": "amountOfBets",
            "type": "u64"
          },
          {
            "name": "numOfDealers",
            "type": "u32"
          },
          {
            "name": "prizePot",
            "type": "publicKey"
          },
          {
            "name": "prizeAmount",
            "type": "u64"
          },
          {
            "name": "sharePot",
            "type": "publicKey"
          },
          {
            "name": "shareRate",
            "type": "u8"
          },
          {
            "name": "teamShareAmount",
            "type": "u64"
          },
          {
            "name": "teamPaidOutAmount",
            "type": "u64"
          },
          {
            "name": "dealerShareAmount",
            "type": "u64"
          },
          {
            "name": "dealerPaidOutAmount",
            "type": "u64"
          },
          {
            "name": "partnerShareAmount",
            "type": "u64"
          },
          {
            "name": "partnerPaidOutAmount",
            "type": "u64"
          },
          {
            "name": "bonusPot",
            "type": "publicKey"
          },
          {
            "name": "bonusAmount",
            "type": "u64"
          },
          {
            "name": "bonusPaidOutAmount",
            "type": "u64"
          },
          {
            "name": "newestDraw",
            "type": "publicKey"
          },
          {
            "name": "ballMaxWhite",
            "type": "u8"
          },
          {
            "name": "ballMaxRed",
            "type": "u8"
          },
          {
            "name": "minBettingTs",
            "type": "u64"
          },
          {
            "name": "maxBettingTs",
            "type": "u64"
          },
          {
            "name": "minBettingMultiplier",
            "type": "u8"
          },
          {
            "name": "reserved1",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "reserved2",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "prizeTicket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "dealer",
            "type": "u64"
          },
          {
            "name": "draw",
            "type": "u64"
          },
          {
            "name": "balls",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "multiplier",
            "type": "u8"
          },
          {
            "name": "numOfBets",
            "type": "u8"
          },
          {
            "name": "redeemedBonus",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "ticketNo",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vrfClient",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "vrf",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "resultBuffer",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "updateTs",
            "type": "u64"
          },
          {
            "name": "consumeTs",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSwitchboardAccount",
      "msg": "Not a valid Switchboard account"
    },
    {
      "code": 6001,
      "name": "MaxResultExceedsMaximum",
      "msg": "The max result must not exceed u64"
    },
    {
      "code": 6002,
      "name": "EmptyCurrentRoundResult",
      "msg": "Current round result is empty"
    },
    {
      "code": 6003,
      "name": "InvalidAuthorityError",
      "msg": "Invalid authority account provided."
    },
    {
      "code": 6004,
      "name": "InvalidVrfAccount",
      "msg": "Invalid VRF account provided."
    },
    {
      "code": 6005,
      "name": "ArithmeticError",
      "msg": "failed to perform some math operation safely"
    },
    {
      "code": 6006,
      "name": "UnknownInstruction",
      "msg": "unknown instruction called"
    },
    {
      "code": 6007,
      "name": "InvalidParameter",
      "msg": "invalid parameter passed"
    },
    {
      "code": 6008,
      "name": "AnchorSerializationIssue",
      "msg": "anchor serialization issue"
    },
    {
      "code": 6009,
      "name": "PermissionDenied",
      "msg": "permission denied"
    },
    {
      "code": 6010,
      "name": "IllegalState",
      "msg": "illegal state"
    },
    {
      "code": 6011,
      "name": "IncorrectBalls",
      "msg": "incorrect balls"
    },
    {
      "code": 6012,
      "name": "BettingClosed",
      "msg": "stop betting now"
    },
    {
      "code": 6013,
      "name": "InsufficientBalance",
      "msg": "insufficient balance"
    },
    {
      "code": 6014,
      "name": "NotWinner",
      "msg": "sorry, you are not a winner"
    },
    {
      "code": 6015,
      "name": "TicketExpired",
      "msg": "sorry, ticket has expired"
    }
  ]
};

export const IDL: Lottery = {
  "version": "0.1.0",
  "name": "lottery",
  "instructions": [
    {
      "name": "initPrizePool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusPot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sharePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpAuth",
          "type": "u8"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "shareRate",
          "type": "u8"
        },
        {
          "name": "ballMaxWhite",
          "type": "u8"
        },
        {
          "name": "ballMaxRed",
          "type": "u8"
        },
        {
          "name": "minBettingTs",
          "type": "u64"
        },
        {
          "name": "maxBettingTs",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updatePrizePool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newManager",
          "type": "publicKey"
        },
        {
          "name": "newDrawer",
          "type": "publicKey"
        },
        {
          "name": "minBettingTs",
          "type": "u64"
        },
        {
          "name": "maxBettingTs",
          "type": "u64"
        },
        {
          "name": "minBettingMultiplier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "depositPrizePool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferBonus",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusPot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "topAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "recycleBonus",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusPot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initPrizeDraw",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "newestDraw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nextDraw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "period",
          "type": "u64"
        },
        {
          "name": "closeTs",
          "type": "u64"
        },
        {
          "name": "bonusMultiplier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "drawPrize",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "drawer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "switchboardProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vrf",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracleQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "queueAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dataBuffer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "permission",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "recentBlockhashes",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "permissionBump",
          "type": "u8"
        },
        {
          "name": "switchboardStateBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initPartner",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "partner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "partnerNo",
          "type": "u64"
        },
        {
          "name": "partnerName",
          "type": "string"
        },
        {
          "name": "wallet",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updatePartner",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "partner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "partnerName",
          "type": "string"
        },
        {
          "name": "wallet",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "initDealer",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "partner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "dealerNo",
          "type": "u64"
        },
        {
          "name": "dealerName",
          "type": "string"
        },
        {
          "name": "wallet",
          "type": "publicKey"
        },
        {
          "name": "shareRate",
          "type": "u8"
        },
        {
          "name": "partnerRate",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateDealer",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "partner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "dealerName",
          "type": "string"
        },
        {
          "name": "wallet",
          "type": "publicKey"
        },
        {
          "name": "shareRate",
          "type": "u8"
        },
        {
          "name": "partnerRate",
          "type": "u8"
        }
      ]
    },
    {
      "name": "buyTicket",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "partner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sharePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ticketNo",
          "type": "u64"
        },
        {
          "name": "balls",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "numOfBets",
          "type": "u8"
        },
        {
          "name": "multiplier",
          "type": "u8"
        }
      ]
    },
    {
      "name": "redeemTicket",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonusPot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpTicket",
          "type": "u8"
        },
        {
          "name": "ticketNo",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawDealer",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "dealer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sharePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawPartner",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "partner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sharePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawTeam",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "manager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "sharePot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "burn",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "count",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initState",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vrf",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateResult",
      "accounts": [
        {
          "name": "pool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vrf",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "dealer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "partner",
            "type": "publicKey"
          },
          {
            "name": "shareRate",
            "type": "u8"
          },
          {
            "name": "partnerRate",
            "type": "u8"
          },
          {
            "name": "paidOutAmount",
            "type": "u64"
          },
          {
            "name": "accruedShareAmount",
            "type": "u64"
          },
          {
            "name": "numOfBets",
            "type": "u64"
          },
          {
            "name": "amountOfBets",
            "type": "u64"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "no",
            "type": "u64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "partner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "accruedShareAmount",
            "type": "u64"
          },
          {
            "name": "paidOutAmount",
            "type": "u64"
          },
          {
            "name": "name",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "no",
            "type": "u64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "prizeDraw",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "period",
            "type": "u64"
          },
          {
            "name": "drawnTs",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "numOfBets",
            "type": "u64"
          },
          {
            "name": "topAmount",
            "type": "u64"
          },
          {
            "name": "bonusAmount",
            "type": "u64"
          },
          {
            "name": "paidOutAmount",
            "type": "u64"
          },
          {
            "name": "balls",
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          },
          {
            "name": "closeTs",
            "type": "u64"
          },
          {
            "name": "teamShareAmount",
            "type": "u64"
          },
          {
            "name": "dealerShareAmount",
            "type": "u64"
          },
          {
            "name": "partnerShareAmount",
            "type": "u64"
          },
          {
            "name": "bonusMultiplier",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "prizePool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "manager",
            "type": "publicKey"
          },
          {
            "name": "drawer",
            "type": "publicKey"
          },
          {
            "name": "poolAuthority",
            "type": "publicKey"
          },
          {
            "name": "poolAuthoritySeed",
            "type": "publicKey"
          },
          {
            "name": "poolAuthorityBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "prizeMint",
            "type": "publicKey"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "numOfBets",
            "type": "u64"
          },
          {
            "name": "amountOfBets",
            "type": "u64"
          },
          {
            "name": "numOfDealers",
            "type": "u32"
          },
          {
            "name": "prizePot",
            "type": "publicKey"
          },
          {
            "name": "prizeAmount",
            "type": "u64"
          },
          {
            "name": "sharePot",
            "type": "publicKey"
          },
          {
            "name": "shareRate",
            "type": "u8"
          },
          {
            "name": "teamShareAmount",
            "type": "u64"
          },
          {
            "name": "teamPaidOutAmount",
            "type": "u64"
          },
          {
            "name": "dealerShareAmount",
            "type": "u64"
          },
          {
            "name": "dealerPaidOutAmount",
            "type": "u64"
          },
          {
            "name": "partnerShareAmount",
            "type": "u64"
          },
          {
            "name": "partnerPaidOutAmount",
            "type": "u64"
          },
          {
            "name": "bonusPot",
            "type": "publicKey"
          },
          {
            "name": "bonusAmount",
            "type": "u64"
          },
          {
            "name": "bonusPaidOutAmount",
            "type": "u64"
          },
          {
            "name": "newestDraw",
            "type": "publicKey"
          },
          {
            "name": "ballMaxWhite",
            "type": "u8"
          },
          {
            "name": "ballMaxRed",
            "type": "u8"
          },
          {
            "name": "minBettingTs",
            "type": "u64"
          },
          {
            "name": "maxBettingTs",
            "type": "u64"
          },
          {
            "name": "minBettingMultiplier",
            "type": "u8"
          },
          {
            "name": "reserved1",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "reserved2",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "prizeTicket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "dealer",
            "type": "u64"
          },
          {
            "name": "draw",
            "type": "u64"
          },
          {
            "name": "balls",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "multiplier",
            "type": "u8"
          },
          {
            "name": "numOfBets",
            "type": "u8"
          },
          {
            "name": "redeemedBonus",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "ticketNo",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vrfClient",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "vrf",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "resultBuffer",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "updateTs",
            "type": "u64"
          },
          {
            "name": "consumeTs",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSwitchboardAccount",
      "msg": "Not a valid Switchboard account"
    },
    {
      "code": 6001,
      "name": "MaxResultExceedsMaximum",
      "msg": "The max result must not exceed u64"
    },
    {
      "code": 6002,
      "name": "EmptyCurrentRoundResult",
      "msg": "Current round result is empty"
    },
    {
      "code": 6003,
      "name": "InvalidAuthorityError",
      "msg": "Invalid authority account provided."
    },
    {
      "code": 6004,
      "name": "InvalidVrfAccount",
      "msg": "Invalid VRF account provided."
    },
    {
      "code": 6005,
      "name": "ArithmeticError",
      "msg": "failed to perform some math operation safely"
    },
    {
      "code": 6006,
      "name": "UnknownInstruction",
      "msg": "unknown instruction called"
    },
    {
      "code": 6007,
      "name": "InvalidParameter",
      "msg": "invalid parameter passed"
    },
    {
      "code": 6008,
      "name": "AnchorSerializationIssue",
      "msg": "anchor serialization issue"
    },
    {
      "code": 6009,
      "name": "PermissionDenied",
      "msg": "permission denied"
    },
    {
      "code": 6010,
      "name": "IllegalState",
      "msg": "illegal state"
    },
    {
      "code": 6011,
      "name": "IncorrectBalls",
      "msg": "incorrect balls"
    },
    {
      "code": 6012,
      "name": "BettingClosed",
      "msg": "stop betting now"
    },
    {
      "code": 6013,
      "name": "InsufficientBalance",
      "msg": "insufficient balance"
    },
    {
      "code": 6014,
      "name": "NotWinner",
      "msg": "sorry, you are not a winner"
    },
    {
      "code": 6015,
      "name": "TicketExpired",
      "msg": "sorry, ticket has expired"
    }
  ]
};
