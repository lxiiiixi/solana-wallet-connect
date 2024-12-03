import { AppHero } from '../ui/ui-layout'

export default function SolanaFeature() {
  return (
    <div>
      <AppHero
        title="Solana"
        subtitle={
          'Create a new account by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (increment, decrement, set, and close).'
        }
      >
        123
      </AppHero>
    </div>
  )
}
