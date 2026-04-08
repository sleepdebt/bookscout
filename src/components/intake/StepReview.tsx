'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitBook } from '@/lib/submitBook'
import type { WizardState } from './WizardShell'
import type { BookCondition } from '@/lib/supabase/types'

interface StepReviewProps {
  state: WizardState
  onBack: () => void
}

const CONDITION_LABELS: Record<BookCondition, string> = {
  like_new: 'Like New',
  good: 'Good',
  acceptable: 'Acceptable',
  poor: 'Poor',
}

export function StepReview({ state, onBack }: StepReviewProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function onSubmit() {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // All books in a bulk session share a batch_id
      const batchId = state.books.length > 1 ? crypto.randomUUID() : undefined

      const results = await Promise.all(
        state.books.map((book) =>
          submitBook({
            photos: book.photos,
            contact_preference: state.contact_preference,
            contact_value: state.contact_value,
            condition: book.condition,
            isbn: book.isbn || undefined,
            notes: book.notes || undefined,
            batch_id: batchId,
          })
        )
      )

      const refs = results.map((r) => r.reference_number).join(',')
      router.push(`/sell/confirmation?refs=${refs}`)
    } catch (err) {
      setIsSubmitting(false)
      setSubmitError('Something went wrong. Please try again.')
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Review & submit</h1>
        <p className="text-sm text-gray-500">Make sure everything looks right.</p>
      </div>

      {/* Contact summary */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
        <p>
          <span className="font-medium">Email: </span>
          {state.contact_value}
        </p>
        <p className="mt-0.5 text-gray-500">Offers will be sent here within 4 hours.</p>
      </div>

      {/* Books list */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {state.books.length} {state.books.length === 1 ? 'book' : 'books'}
        </p>
        <div className="space-y-3">
          {state.books.map((book, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 flex gap-3">
              {/* Photo thumbnails */}
              <div className="flex gap-1.5 flex-shrink-0">
                {book.photos.slice(0, 2).map((photo, j) => (
                  <img
                    key={j}
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${j + 1}`}
                    className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                  />
                ))}
                {book.photos.length > 2 && (
                  <div className="w-14 h-14 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    +{book.photos.length - 2}
                  </div>
                )}
              </div>
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Book {i + 1}</p>
                <p className="text-xs text-gray-500 mt-0.5">{CONDITION_LABELS[book.condition]}</p>
                {book.isbn && <p className="text-xs text-gray-400 mt-0.5">ISBN: {book.isbn}</p>}
                {book.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{book.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex gap-3 mt-auto">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl text-base disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 py-4 bg-blue-600 text-white font-semibold rounded-xl text-base disabled:opacity-50"
        >
          {isSubmitting
            ? `Submitting${state.books.length > 1 ? ` (0/${state.books.length})` : ''}...`
            : `Submit ${state.books.length === 1 ? 'book' : `${state.books.length} books`}`}
        </button>
      </div>
    </div>
  )
}
