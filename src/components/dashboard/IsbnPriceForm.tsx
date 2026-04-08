'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function IsbnPriceForm({ submissionId }: { submissionId: string }) {
  const router = useRouter()
  const [isbn, setIsbn] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = isbn.replace(/[-\s]/g, '')
    if (cleaned.length !== 10 && cleaned.length !== 13) {
      setError('Enter a valid 10 or 13-digit ISBN')
      return
    }

    setLoading(true)
    setError(null)

    // Save ISBN to submission
    const patchRes = await fetch(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isbn: cleaned }),
    })
    if (!patchRes.ok) {
      const data = await patchRes.json() as { error?: string }
      setError(data.error ?? 'Failed to save ISBN')
      setLoading(false)
      return
    }

    // Now price it
    const priceRes = await fetch('/api/price-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    })
    const priceData = await priceRes.json() as { error?: string }
    if (!priceRes.ok) {
      setError(priceData.error ?? 'Pricing failed')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-gray-500">Enter the ISBN from the photo to price automatically.</p>
      <input
        type="text"
        value={isbn}
        onChange={e => setIsbn(e.target.value)}
        placeholder="e.g. 9780307719225"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !isbn.trim()}
        className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Pricing…' : 'Save & Price'}
      </button>
    </form>
  )
}
