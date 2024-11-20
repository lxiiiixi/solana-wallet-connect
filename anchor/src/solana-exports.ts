// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SolanaIDL from '../target/idl/solana.json'
import type { Solana } from '../target/types/solana'

// Re-export the generated IDL and type
export { Solana, SolanaIDL }

// The programId is imported from the program IDL.
export const SOLANA_PROGRAM_ID = new PublicKey(SolanaIDL.address)

// This is a helper function to get the Solana Anchor program.
export function getSolanaProgram(provider: AnchorProvider) {
  return new Program(SolanaIDL as Solana, provider)
}

// This is a helper function to get the program ID for the Solana program depending on the cluster.
export function getSolanaProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Solana program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return SOLANA_PROGRAM_ID
  }
}
