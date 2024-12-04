import { VersionedTransaction } from '@solana/web3.js'
// import { Wallet } from '@project-serum/anchor'
import fetch from 'cross-fetch'
// import bs58 from 'bs58'
// import { useEffect, useState } from 'react'

// const connection = new Connection('https://rpc-mainnet.solanatracker.io/?api_key=72759b5d-df4b-461b-9a1d-4ab2abc30ad4')
// const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')))

const getQuote = async () => {
  // Swapping SOL to USDC with input 0.1 SOL and 0.5% slippage
  const quoteResponse = await (
    await fetch(
      'https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=50',
    )
  ).json()

  return quoteResponse
}

export default function Buy({ userWalletPublicKey }: { userWalletPublicKey?: string }) {
  const handleBuy = async () => {
    if (!userWalletPublicKey) {
      return
    }

    const quote = await getQuote()

    // get serialized transactions for the swap
    const { swapTransaction } = await (
      await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // quoteResponse from /quote api
          quote,
          // user public key to be used for the swap
          userPublicKey: userWalletPublicKey,
          // auto wrap and unwrap SOL. default is true
          wrapAndUnwrapSol: true,
          // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
          // feeAccount: "fee_account_public_key"
        }),
      })
    ).json()

    console.log('swapTransaction', swapTransaction)

    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64')
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf)
    console.log('transaction', transaction)
  }

  return (
    <button className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg" onClick={handleBuy}>
      buy
    </button>
  )
}
