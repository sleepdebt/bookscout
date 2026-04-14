import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { PricingRulesForm } from '@/components/dashboard/PricingRulesForm'

export const metadata = { title: 'Settings — BookScout' }

export default async function SettingsPage() {
  const service = createServiceClient()
  const { data: rules } = await service
    .from('pricing_rules')
    .select('target_roi_min, max_buy_price, slow_mover_rank_threshold, avoid_amazon_present, amazon_fee_rate, amazon_closing_fee')
    .limit(1)
    .single()

  const initialRules = rules ?? {
    target_roi_min: 0.5,
    max_buy_price: null,
    slow_mover_rank_threshold: null,
    avoid_amazon_present: true,
    amazon_fee_rate: 0.15,
    amazon_closing_fee: 1.80,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</Link>
        <span className="text-gray-300">|</span>
        <h1 className="text-sm font-medium text-gray-900">Settings</h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Pricing Rules</h2>
          <p className="text-sm text-gray-500 mb-6">
            These rules apply to all automated offer calculations.
          </p>
          <PricingRulesForm initialRules={initialRules} />
        </div>
      </main>
    </div>
  )
}
