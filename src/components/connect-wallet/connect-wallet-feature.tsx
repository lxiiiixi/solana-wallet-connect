import { AppHero } from '../ui/ui-layout'
import { ParticleConnectkit } from './kit/particle-connect-kit'
import ParticleConnect from './particle-connect'
import { addRpcUrlOverrideToChain, PrivyProvider } from '@privy-io/react-auth'
import PrivyLogin from './privy-login'
import { solanaDevnet } from '@particle-network/connectkit/chains'

import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'

const solanaConnectors = toSolanaWalletConnectors({
  // By default, shouldAutoConnect is enabled
  shouldAutoConnect: true,
})

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
            <ParticleConnectkit>
              <ParticleConnect />
            </ParticleConnectkit>
            {/* particle connectkit */}
          </div>
          <div className="bg-orange-50 w-full rounded-xl p-4">
            <PrivyProvider
              appId="cm485ehd706mjjqspwtpqlo74"
              config={{
                appearance: {
                  accentColor: '#6A6FF5',
                  theme: '#fbe9e9',
                  logo: undefined,
                  // logo: (
                  //   <img src="https://auth.privy.io/logos/privy-logo.png" alt="privy-logo" style={{ width: '10px' }} />
                  // ),
                  // logo: 'https://auth.privy.io/logos/privy-logo.png',
                  landingHeader: 'Connect wallet',
                  showWalletLoginFirst: false, // 是否有限展示钱包链接的方式
                  loginMessage: 'Welcome to the app',
                  walletChainType: 'solana-only', // 展示支持链的钱包类型
                  walletList: ['phantom', 'metamask', 'okx_wallet'], // 可以选择的钱包列表 WalletListEntry
                },
                // Display email and wallet as login methods
                loginMethods: ['email', 'wallet', 'google', 'apple', 'github', 'discord'],
                fundingMethodConfig: {
                  moonpay: {
                    useSandbox: true,
                  },
                },
                externalWallets: {
                  solana: {
                    connectors: solanaConnectors,
                  },
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                  createOnLogin: 'all-users',
                  // createOnLogin: 'off',
                  // requireUserPasswordOnCreate: false,
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
