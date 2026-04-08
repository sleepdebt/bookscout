'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ExtractIsbnButton({ submissionId }: { submissionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExtract() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/extract-isbn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      })

      const data = await res.json() as { found?: boolean; isbn_extracted?: string; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Extraction failed')
        return
      }

      if (!data.found) {
        setError('No ISBN found in photos — enter it manually below.')
        return
      }

      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleExtract}
        disabled={loading}
        className="inline-flex items-center gap-1.5 bg-gray-900 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Scanning photos…
          </>
        ) : (
          'Extract ISBN from Photos'
        )}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
