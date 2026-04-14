'use client'

import { useState } from 'react'

interface Props {
  initialRules: {
    target_roi_min: number
    max_buy_price: number | null
    slow_mover_rank_threshold: number | null
    avoid_amazon_present: boolean
    amazon_fee_rate: number
    amazon_closing_fee: number
  }
}

export function PricingRulesForm({ initialRules }: Props) {
  const [roi, setRoi] = useState(Math.round(initialRules.target_roi_min * 100).toString())
  const [maxBuy, setMaxBuy] = useState(initialRules.max_buy_price?.toString() ?? '')
  const [rankThreshold, setRankThreshold] = useState(initialRules.slow_mover_rank_threshold?.toString() ?? '')
  const [avoidAmazon, setAvoidAmazon] = useState(initialRules.avoid_amazon_present)
  const [feeRate, setFeeRate] = useState(Math.round(initialRules.amazon_fee_rate * 100).toString())
  const [closingFee, setClosingFee] = useState(initialRules.amazon_closing_fee.toFixed(2))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const roiNum = parseFloat(roi)
    if (isNaN(roiNum) || roiNum < 0 || roiNum > 100) {
      setError('ROI must be between 0 and 100')
      return
    }

    setSaving(true)
    setError(null)
    setSaved(false)

    const res = await fetch('/api/pricing-rules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_roi_min: roiNum / 100,
        max_buy_price: maxBuy !== '' ? parseFloat(maxBuy) : null,
        slow_mover_rank_threshold: rankThreshold !== '' ? parseInt(rankThreshold) : null,
        avoid_amazon_present: avoidAmazon,
        amazon_fee_rate: parseFloat(feeRate) / 100,
        amazon_closing_fee: parseFloat(closingFee),
      }),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json() as { error?: string }
      setError(data.error ?? 'Save failed')
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* Min ROI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Minimum ROI (%)
        </label>
        <p className="text-xs text-gray-400 mb-2">
          The minimum return on investment required. At 50%, a $20 book gets a max offer of $13.33.
        </p>
        <div className="flex items-center gap-2 w-40">
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={roi}
            onChange={e => setRoi(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <span className="text-sm text-gray-500">%</span>
        </div>
      </div>

      {/* Max buy price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max Buy Price ($)
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Hard cap on any offer regardless of Amazon price. Leave blank for no cap.
        </p>
        <div className="flex items-center gap-2 w-40">
          <span className="text-sm text-gray-500">$</span>
          <input
            type="number"
            min="0"
            step="0.25"
            placeholder="No cap"
            value={maxBuy}
            onChange={e => setMaxBuy(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Condition multipliers — read-only info */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Condition Multipliers</p>
        <p className="text-xs text-gray-400 mb-3">Applied to Amazon price before ROI cap.</p>
        <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 rounded-lg p-4">
          {[
            { label: 'Like New', value: '80%' },
            { label: 'Good', value: '60%' },
            { label: 'Acceptable', value: '35%' },
            { label: 'Poor', value: '15%' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-600">{label}</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Amazon Fees */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amazon Referral Fee (%)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Amazon&apos;s percentage cut of each sale. Books are typically 15%.
          </p>
          <div className="flex items-center gap-2 w-full">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={feeRate}
              onChange={e => setFeeRate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Closing Fee ($)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Flat per-item fee Amazon charges for media. Currently $1.80.
          </p>
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm text-gray-500">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={closingFee}
              onChange={e => setClosingFee(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Avoid Amazon */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="avoid-amazon"
          checked={avoidAmazon}
          onChange={e => setAvoidAmazon(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <div>
          <label htmlFor="avoid-amazon" className="text-sm font-medium text-gray-700 cursor-pointer">
            Pass when Amazon is the seller
          </label>
          <p className="text-xs text-gray-400 mt-0.5">
            If Amazon itself is selling the book, recommend $0 (pass). Competing with Amazon on price is rarely profitable.
          </p>
        </div>
      </div>

      {/* Slow mover rank */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slow Mover Rank Threshold
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Books with a sales rank above this number get a &ldquo;slow mover&rdquo; flag. Leave blank to disable. Note: Canopy does not currently return sales rank data.
        </p>
        <input
          type="number"
          min="0"
          placeholder="e.g. 500000"
          value={rankThreshold}
          onChange={e => setRankThreshold(e.target.value)}
          className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-gray-900 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save Rules'}
      </button>
    </form>
  )
}
