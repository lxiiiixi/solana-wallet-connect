/* eslint-disable @typescript-eslint/no-explicit-any */
import { clusterApiUrl, Connection, VersionedTransaction } from '@solana/web3.js'
// import { Wallet } from '@project-serum/anchor'
import fetch from 'cross-fetch'
import { useSolanaWallets } from '@privy-io/react-auth'
// import bs58 from 'bs58'
// import { useEffect, useState } from 'react'

// const connection = new Connection('https://rpc-mainnet.solanatracker.io/?api_key=72759b5d-df4b-461b-9a1d-4ab2abc30ad4')
// const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')))

async function fetchQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number,
  excludeDexes = [],
) {
  try {
    console.log('🚀 正在获取报价...')
    const excludeDexesParam = excludeDexes.length > 0 ? `&excludeDexes=${excludeDexes.join(',')}` : ''
    const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}${excludeDexesParam}`
    const response = await fetch(quoteUrl)

    if (!response.ok) {
      throw new Error(`获取报价失败，HTTP 状态码: ${response.status}`)
    }

    const quote = await response.json()
    console.log('✅ 获取报价成功:', quote)
    return quote
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ 获取报价失败:', error.message)
    throw error
  }
}

/**
 * 获取交换交易
 */
async function fetchSwapTransaction(quoteResponse: any, userPublicKey: string) {
  try {
    console.log('🚀 正在获取交换交易...')
    const swapUrl = 'https://quote-api.jup.ag/v6/swap'
    const response = await fetch(swapUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`获取交换交易失败，HTTP 状态码: ${response.status}`)
    }

    const { swapTransaction } = await response.json()
    console.log('✅ 获取交换交易成功', swapTransaction)
    return swapTransaction
  } catch (error: any) {
    console.error('❌ 获取交换交易失败:', error.message)
    throw error
  }
}

/**
 * 执行交易
 * swapTransaction： 一个以 Base64 编码的 Solana 交易数据，一个已经序列化的交易字符串。
 */
export async function executeTransaction(swapTransaction: string, connection: Connection) {
  try {
    console.log('🚀 正在反序列化交易...')
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64') // 转换为 Buffer，这是处理二进制的标准方法。
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf)

    console.log('✍️ 正在签署交易...')
    // transaction.sign([keypair])

    console.log('📤 正在发送交易...')
    const rawTransaction = transaction.serialize()
    const latestBlockHash = await connection.getLatestBlockhash()

    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2,
    })

    console.log(`✅ 交易已发送，交易 ID: ${txid}`)
    console.log('⌛ 正在等待确认...')
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txid,
    })

    console.log(`✅ 交易已确认！可在 Solscan 上查看交易详情: https://solscan.io/tx/${txid}`)
    return txid
  } catch (error: any) {
    console.error('❌ 执行交易失败:', error.message)
    throw error
  }
}

export default function Buy({ userWalletPublicKey }: { userWalletPublicKey?: string }) {
  const { wallets } = useSolanaWallets()
  const solanaWallet = wallets[0]

  const handleBuy = async () => {
    if (!userWalletPublicKey) {
      return
    }

    const inputMint = 'So11111111111111111111111111111111111111112' // SOL Mint
    const outputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC Mint
    const amount = 10000000 // 0.1 SOL in lamports  decimals-9
    const slippageBps = 50 // 0.5% 滑点
    const connection = new Connection(clusterApiUrl('mainnet-beta'))

    console.log('💡 开始交易流程...')

    const quote = await fetchQuote(inputMint, outputMint, amount, slippageBps)
    const swapTransaction = await fetchSwapTransaction(quote, userWalletPublicKey)
    // const txid = await executeTransaction(swapTransaction, connection)
    // console.log(`🎉 交易完成，交易 ID: ${txid}`)

    console.log('🚀 正在反序列化交易...')
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64')
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf)

    await solanaWallet.sendTransaction(transaction, connection)
  }

  return (
    <button className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg" onClick={handleBuy}>
      buy
    </button>
  )
}
