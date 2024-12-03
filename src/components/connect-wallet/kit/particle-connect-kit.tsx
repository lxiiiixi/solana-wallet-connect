import React from 'react'
import { ConnectKitProvider, createConfig } from '@particle-network/connectkit'
import { wallet, type EntryPosition } from '@particle-network/connectkit/wallet'
import { solana, solanaDevnet } from '@particle-network/connectkit/chains'
import { authWalletConnectors } from '@particle-network/connectkit/auth'
import dotenv from 'dotenv'

dotenv.config()

import { solanaWalletConnectors, injected as solaInjected } from '@particle-network/connectkit/solana'

console.log(import.meta.env)

const config = createConfig({
  projectId: import.meta.env.VITE_PUBLIC_PROJECT_ID!,
  clientKey: import.meta.env.VITE_PUBLIC_CLIENT_KEY!,
  appId: import.meta.env.VITE_PUBLIC_APP_ID!,
  appearance: {
    recommendedWallets: [
      { walletId: 'coinbaseWallet', label: 'Popular' },
      { walletId: 'okxWallet', label: 'none' },
      { walletId: 'phantom', label: 'none' },
      { walletId: 'trustWallet', label: 'none' },
      { walletId: 'bitKeep', label: 'none' },
    ],
    theme: {
      '--pcm-font-family': "'__Poppins_68bcaa', '__Poppins_Fallback_68bcaa'",
      '--pcm-rounded-sm': '4px',
      '--pcm-rounded-md': '8px',
      '--pcm-rounded-lg': '11px',
      '--pcm-rounded-xl': '22px',
    },
    splitEmailAndPhone: false,
    collapseWalletList: false,
    hideContinueButton: false,
    connectorsOrder: ['social', 'wallet'],
    language: 'en-US',
    collapsePasskeyButton: true,
  },
  walletConnectors: [
    authWalletConnectors({
      authTypes: ['google', 'apple', 'github', 'facebook', 'twitter', 'microsoft', 'discord', 'twitch', 'linkedin'],
      fiatCoin: 'USD',
      promptSettingConfig: {
        promptMasterPasswordSettingWhenLogin: 0,
        promptPaymentPasswordSettingWhenSign: 0,
      },
    }),

    solanaWalletConnectors({
      connectorFns: [
        solaInjected({ target: 'coinbaseWallet' }),
        solaInjected({ target: 'okxWallet' }),
        solaInjected({ target: 'phantom' }),
        solaInjected({ target: 'trustWallet' }),
        solaInjected({ target: 'bitKeep' }),
      ],
    }),
  ],
  plugins: [
    wallet({
      entryPosition: 'bottom-right' as EntryPosition,
      visible: true,
      customStyle: {
        fiatCoin: 'USD',
      },
    }),
  ],
  chains: [solana, solanaDevnet],
})

// Wrap your application with this component.
export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
  return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>
}
