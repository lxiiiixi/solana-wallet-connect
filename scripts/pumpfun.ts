import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { Program, AnchorProvider, Wallet, setProvider } from '@project-serum/anchor'
import { readFileSync } from 'fs'
import bs58 from 'bs58'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')

  const secretKey = bs58.decode(process.env.PRIVATE_KEY ?? '')
  const wallet = Keypair.fromSecretKey(secretKey)
  console.log('Wallet Address:', wallet.publicKey.toBase58())

  const provider = new AnchorProvider(connection, new Wallet(wallet), {})
  setProvider(provider)

  const idlDemo = JSON.parse(readFileSync('./src/idls/pump_fun.json', 'utf-8'))
  const programId = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P')
  const program = new Program(idlDemo, programId)

  const mintAuthority = new PublicKey('TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM')
  const bondingCurve = new PublicKey('8geE3jXCcL1QC6i5NthTUKMy9vYP9Graboa6vCMWS6Mb')
  const associatedBondingCurve = new PublicKey('5xsLGvBiB69nG4YEF9Dr5H9aVdahxTyLtpRG5V2HEZY6')
  const global = new PublicKey('4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf')
  const mplTokenMetadata = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  const metadata = new PublicKey('9ifKGvDseZwt5LBwoFvsteVG7qLGQv86Y3uJupVC2sA4')
  const eventAuthority = new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1')

  const mintAccount = new Keypair() // 代币帐户
  console.log('Mint account:', mintAccount.publicKey)
  const createTx = await program.methods
    .create('Mezz', 'MZ', 'https://bafkreibkz2li2vzqzfxw3tw46vhyyfotpdfdjmdjsrca4v6q3ryybtzjui.ipfs.flk-ipfs.xyz/')
    .accounts({
      mintAuthority,
      bondingCurve,
      associatedBondingCurve,
      mint: mintAccount.publicKey,
      global,
      user: wallet.publicKey,
      mplTokenMetadata,
      metadata,
      eventAuthority,
      program: programId,
    })
    .signers([mintAccount])
    .rpc()
  console.log('Create pump token hash', createTx)
}

main().catch((err) => {
  console.error(err)
})
