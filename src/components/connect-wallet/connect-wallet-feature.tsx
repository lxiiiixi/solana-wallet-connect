import { AppHero } from '../ui/ui-layout'
// import { ParticleConnectkit } from './kit/particle-connect-kit'
// import ParticleConnect from './particle-connect'
import { addRpcUrlOverrideToChain, PrivyProvider } from '@privy-io/react-auth'
import PrivyLogin from './privy-login'
import { solanaDevnet } from '@particle-network/connectkit/chains'

export default function SolanaFeature() {
  const solanaDevnetOverride = addRpcUrlOverrideToChain(solanaDevnet, 'https://api.devnet.solana.com')

  return (
    <div>
      <AppHero
        title="Solana"
        subtitle={
          'Create a new account by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (increment, decrement, set, and close).'
        }
      >
        <div className="flex flex-col justify-center gap-8 min-h-[400px]">
          <div className="bg-pink-50 w-full rounded-xl p-4">
            {/* <ParticleConnectkit>
              <ParticleConnect />
            </ParticleConnectkit> */}
            particle connectkit
          </div>
          <div className="bg-orange-50 w-full rounded-xl p-4">
            <PrivyProvider
              appId="cm485ehd706mjjqspwtpqlo74"
              config={{
                appearance: {
                  accentColor: '#6A6FF5',
                  theme: '#FFFFFF',
                  showWalletLoginFirst: false,
                  logo: 'https://auth.privy.io/logos/privy-logo.png',
                  walletChainType: 'solana-only',
                  walletList: ['detected_solana_wallets', 'phantom'],
                },
                // Display email and wallet as login methods
                loginMethods: ['email', 'wallet', 'google', 'apple', 'github', 'discord'],
                fundingMethodConfig: {
                  moonpay: {
                    useSandbox: true,
                  },
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                  createOnLogin: 'off',
                  requireUserPasswordOnCreate: false,
                },
                mfa: {
                  noPromptOnMfaRequired: false,
                },
                supportedChains: [solanaDevnetOverride],
              }}
            >
              <PrivyLogin />
            </PrivyProvider>
          </div>
        </div>
      </AppHero>
    </div>
  )
}
