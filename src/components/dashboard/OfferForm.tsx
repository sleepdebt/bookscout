'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SubmissionStatus } from '@/lib/supabase/types'

const STATUSES: { value: SubmissionStatus; label: string }[] = [
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'isbn_required',  label: 'Needs ISBN' },
  { value: 'unidentifiable', label: 'Unidentifiable' },
  { value: 'offer_sent',     label: 'Offer Sent' },
  { value: 'pass_sent',      label: 'Pass Sent' },
]

const READONLY_STATUSES: { value: SubmissionStatus; label: string }[] = [
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
]

interface Props {
  submissionId: string
  initialStatus: SubmissionStatus
  initialOffer: number | null
  initialNotes: string | null
}

export function OfferForm({ submissionId, initialStatus, initialOffer, initialNotes }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<SubmissionStatus>(initialStatus)
  const [offer, setOffer] = useState(initialOffer?.toString() ?? '')
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        final_offer: offer !== '' ? parseFloat(offer) : null,
        seller_notes: notes || null,
      }),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json() as { error?: string }
      setError(data.error ?? 'Save failed')
      return
    }

    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        {READONLY_STATUSES.some(s => s.value === status) ? (
          <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50">
            {READONLY_STATUSES.find(s => s.value === status)?.label}
            <span className="ml-2 text-xs text-gray-400">(set by seller)</span>
          </div>
        ) : (
          <select
            value={status}
            onChange={e => setStatus(e.target.value as SubmissionStatus)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Final Offer ($)</label>
        <input
          type="number"
          min="0"
          step="0.25"
          placeholder="e.g. 12.00"
          value={offer}
          onChange={e => setOffer(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Seller Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Internal notes…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
      </button>
    </form>
  )
}
