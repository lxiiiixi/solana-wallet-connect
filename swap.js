import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { config } from 'dotenv';
config(); // 加载环境变量

// 配置连接
const RPC_ENDPOINT = process.env.SOL_PRC || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// 加载密钥对
// const secretKey = Buffer.from(process.env.PRIVATE_KEY || '', 'hex');
// const keypair = Keypair.fromSecretKey(secretKey);
const userPublicKey = "CFG4xvFXamf6RGgfoSdSukgt8gKBF8JiJd3d7Rxvx4EB"; // "CFG4xvFXamf6RGgfoSdSukgt8gKBF8JiJd3d7Rxvx4EB"

/**
 * 获取报价
 */
async function fetchQuote(inputMint, outputMint, amount, slippageBps, excludeDexes = []) {
    try {
        console.log('🚀 正在获取报价...');
        const excludeDexesParam = excludeDexes.length > 0 ? `&excludeDexes=${excludeDexes.join(',')}` : '';
        const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}${excludeDexesParam}`;
        const response = await fetch(quoteUrl);

        if (!response.ok) {
            throw new Error(`获取报价失败，HTTP 状态码: ${response.status}`);
        }

        const quote = await response.json();
        console.log('✅ 获取报价成功:', quote);
        return quote;
    } catch (error) {
        console.error('❌ 获取报价失败:', error.message);
        throw error;
    }
}

/**
 * 获取交换交易
 */
async function fetchSwapTransaction(quoteResponse) {
    try {
        console.log('🚀 正在获取交换交易...');
        const swapUrl = 'https://quote-api.jup.ag/v6/swap';
        const response = await fetch(swapUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey,
                wrapAndUnwrapSol: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`获取交换交易失败，HTTP 状态码: ${response.status}`);
        }

        const { swapTransaction } = await response.json();
        console.log('✅ 获取交换交易成功', swapTransaction);
        return swapTransaction;
    } catch (error) {
        console.error('❌ 获取交换交易失败:', error.message);
        throw error;
    }
}

/**
 * 执行交易
 */
async function executeTransaction(swapTransaction) {
    try {
        console.log('🚀 正在反序列化交易...');
        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

        console.log('✍️ 正在签署交易...');
        transaction.sign([keypair]);

        console.log('📤 正在发送交易...');
        const rawTransaction = transaction.serialize();
        const latestBlockHash = await connection.getLatestBlockhash();

        const txid = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 2,
        });

        console.log(`✅ 交易已发送，交易 ID: ${txid}`);
        console.log('⌛ 正在等待确认...');
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: txid,
        });

        console.log(`✅ 交易已确认！可在 Solscan 上查看交易详情: https://solscan.io/tx/${txid}`);
        return txid;
    } catch (error) {
        console.error('❌ 执行交易失败:', error.message);
        throw error;
    }
}

/**
 * 从失败交易中提取失败的 AMM 并生成排除列表
 */
async function extractFailedAMMs(txid) {
    try {
        console.log('🔍 正在解析失败交易...');

        // 检查签名状态
        const statusResponse = await connection.getSignatureStatuses([txid]);
        const status = statusResponse.value[0];

        if (!status) {
            console.log('⚠️ 未找到签名状态，可能交易未广播或签名无效。');
            return [];
        }

        if (!status.confirmationStatus) {
            console.log('⚠️ 交易未确认，可能未广播或已过期。');
            return [];
        }

        if (status.err) {
            console.log('❌ 交易执行失败:', status.err);
        }

        // 获取交易详细信息
        const transaction = await connection.getTransaction(txid, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed',
        });

        if (!transaction) {
            console.log('⚠️ 未找到交易，可能交易未广播或已被丢弃。');
            return [];
        }

        const programIdToLabelHash = await (
            await fetch('https://quote-api.jup.ag/v6/program-id-to-label')
        ).json();

        const failedProgramIds = extractProgramIdsFromTransaction(transaction);
        let excludeDexes = new Set();

        for (let programId of failedProgramIds) {
            const foundLabel = programIdToLabelHash[programId];
            if (foundLabel) {
                excludeDexes.add(foundLabel);
            }
        }

        console.log('🚫 需要排除的 AMM:', Array.from(excludeDexes));
        return Array.from(excludeDexes);
    } catch (error) {
        console.error('❌ 提取失败的 AMM 时出错:', error.message);
        throw error;
    }
}


/**
 * 从交易对象中提取失败的程序 ID
 */
function extractProgramIdsFromTransaction(transaction) {
    const programIds = new Set();
    const { logMessages, meta } = transaction;

    if (meta?.err) {
        console.log('⚠️ 交易失败，正在解析程序 ID...');

        // 从日志消息中提取失败的程序 ID
        if (logMessages) {
            for (const log of logMessages) {
                const match = log.match(/Program (\w+) failed/);
                if (match && match[1]) {
                    programIds.add(match[1]);
                }
            }
        }

        // 如果 meta.innerInstructions 提供了失败的指令，提取相关程序 ID
        if (meta.innerInstructions) {
            for (const innerInstruction of meta.innerInstructions) {
                for (const instruction of innerInstruction.instructions) {
                    if (instruction.programIdIndex !== undefined) {
                        const programId = transaction.transaction.message.accountKeys[
                            instruction.programIdIndex
                        ].toString();
                        programIds.add(programId);
                    }
                }
            }
        }
    }

    return Array.from(programIds);
}


/**
 * 主逻辑
 */
async function main() {
    try {
        const inputMint = 'So11111111111111111111111111111111111111112'; // SOL Mint
        const outputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC Mint
        const amount = 100000000; // 0.1 SOL in lamports
        const slippageBps = 50; // 0.5% 滑点
        let excludeDexes = []; // 初始不排除任何 AMM

        console.log('💡 开始交易流程...');

        while (true) {
            const quoteResponse = await fetchQuote(inputMint, outputMint, amount, slippageBps, excludeDexes);
            const swapTransaction = await fetchSwapTransaction(quoteResponse);

            return

            try {
                const txid = await executeTransaction(swapTransaction);
                console.log(`🎉 交易完成，交易 ID: ${txid}`);
                break; // 交易成功，退出循环
            } catch (transactionError) {
                console.error('❌ 交易失败，尝试解析失败原因:', transactionError.message);

                if (transactionError.message.includes('expired')) {
                    console.error('⚠️ 交易已过期，跳过处理。');
                    break;
                }

                // 提取失败的 AMM，并更新排除列表
                const failedAMMs = await extractFailedAMMs(transactionError.txid || '');
                excludeDexes = [...new Set([...excludeDexes, ...failedAMMs])];

                console.log('🔄 重试交易，排除失败的 AMM...');
            }
        }
    } catch (error) {
        console.error('❌ 发生错误:', error.message);
    }
}

// 执行主逻辑
main();
