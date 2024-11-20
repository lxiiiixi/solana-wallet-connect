import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Solana} from '../target/types/solana'

describe('solana', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Solana as Program<Solana>

  const solanaKeypair = Keypair.generate()

  it('Initialize Solana', async () => {
    await program.methods
      .initialize()
      .accounts({
        solana: solanaKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([solanaKeypair])
      .rpc()

    const currentCount = await program.account.solana.fetch(solanaKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Solana', async () => {
    await program.methods.increment().accounts({ solana: solanaKeypair.publicKey }).rpc()

    const currentCount = await program.account.solana.fetch(solanaKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Solana Again', async () => {
    await program.methods.increment().accounts({ solana: solanaKeypair.publicKey }).rpc()

    const currentCount = await program.account.solana.fetch(solanaKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Solana', async () => {
    await program.methods.decrement().accounts({ solana: solanaKeypair.publicKey }).rpc()

    const currentCount = await program.account.solana.fetch(solanaKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set solana value', async () => {
    await program.methods.set(42).accounts({ solana: solanaKeypair.publicKey }).rpc()

    const currentCount = await program.account.solana.fetch(solanaKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the solana account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        solana: solanaKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.solana.fetchNullable(solanaKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
