import { AppHero } from '../ui/ui-layout'
import { ParticleConnectkit } from './kit/particle-connect-kit'
import ParticleConnect from './particle-connect'

export default function SolanaFeature() {
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
          </div>
          <div className="bg-orange-50 w-full rounded-xl p-4">privy</div>
        </div>
      </AppHero>
    </div>
  )
}
