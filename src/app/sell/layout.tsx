import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sell Your Book — BookScout',
  description: 'Submit your textbook for a fast cash offer. No account needed.',
}

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
