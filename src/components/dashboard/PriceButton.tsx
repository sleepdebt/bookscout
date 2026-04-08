'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PriceResult {
  asin?: string
  amazon_price?: number | null
  recommended_offer?: number | null
  confidence_level?: string
  flags?: string[]
  error?: string
}

export function PriceButton({ submissionId }: { submissionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PriceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handlePrice() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/price-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      })

      const data = await res.json() as PriceResult

      if (!res.ok) {
        setError(data.error ?? 'Pricing failed')
        return
      }

      setResult(data)
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePrice}
        disabled={loading}
        className="inline-flex items-center gap-1.5 bg-gray-900 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Pricing…
          </>
        ) : (
          'Price This'
        )}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {result && (
        <div className="text-sm space-y-1 bg-gray-50 rounded-lg p-3">
          {result.amazon_price != null ? (
            <p className="text-gray-700">Amazon price: <span className="font-medium">${result.amazon_price.toFixed(2)}</span></p>
          ) : (
            <p className="text-orange-600 font-medium">No active Amazon listing found.</p>
          )}
          {result.recommended_offer != null && result.recommended_offer > 0 ? (
            <p className="text-green-700">Recommended offer: <span className="font-semibold">${result.recommended_offer.toFixed(2)}</span></p>
          ) : result.amazon_price != null ? (
            <p className="text-red-600">No offer — {result.flags?.join(', ') ?? 'does not meet pricing rules'}</p>
          ) : null}
          {result.flags && result.flags.length > 0 && (
            <p className="text-xs text-gray-400">{result.flags.map(f => f.replace(/_/g, ' ')).join(' · ')}</p>
          )}
        </div>
      )}
    </div>
  )
}
