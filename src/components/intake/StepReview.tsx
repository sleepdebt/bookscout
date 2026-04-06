'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { stepReviewSchema, type StepReviewData } from '@/lib/validations'
import { submitBook } from '@/lib/submitBook'
import type { WizardState } from './WizardShell'
import type { BookCondition } from '@/lib/supabase/types'

interface StepReviewProps {
  state: WizardState
  onBack: () => void
}

const CONDITION_LABELS: Record<string, string> = {
  like_new: 'Like New',
  good: 'Good',
  acceptable: 'Acceptable',
  poor: 'Poor',
}

export function StepReview({ state, onBack }: StepReviewProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StepReviewData>({
    resolver: zodResolver(stepReviewSchema),
    defaultValues: { isbn: state.isbn, notes: state.notes },
  })

  const notesValue = watch('notes') ?? ''

  async function onSubmit(data: StepReviewData) {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await submitBook({
        photos: state.photos,
        contact_preference: state.contact_preference,
        contact_value: state.contact_value,
        condition: state.condition as BookCondition,
        isbn: data.isbn,
        notes: data.notes,
      })
      router.push(`/sell/confirmation?ref=${result.reference_number}`)
    } catch (err) {
      setIsSubmitting(false)
      setSubmitError('Something went wrong. Please try again.')
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Review & submit</h1>
        <p className="text-sm text-gray-500">Make sure everything looks right.</p>
      </div>

      {/* Photo thumbnails */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Photos</p>
        <div className="flex gap-2">
          {state.photos.map((photo, i) => (
            <img
              key={i}
              src={URL.createObjectURL(photo)}
              alt={`Photo ${i + 1}`}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
            />
          ))}
        </div>
      </div>

      {/* Contact summary */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
        <p>
          <span className="font-medium">Contact: </span>
          {state.contact_preference === 'sms' ? 'Text' : 'Email'} — {state.contact_value}
        </p>
        <p className="mt-1">
          <span className="font-medium">Condition: </span>
          {CONDITION_LABELS[state.condition] ?? state.condition}
        </p>
      </div>

      {/* Optional ISBN */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          ISBN <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          {...register('isbn')}
          type="text"
          inputMode="numeric"
          placeholder="10 or 13 digits"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.isbn && (
          <p className="text-sm text-red-600 mt-1">{errors.isbn.message}</p>
        )}
      </div>

      {/* Optional notes */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          maxLength={200}
          placeholder="Anything we should know? (e.g. torn cover, no access code)"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{notesValue.length}/200</p>
        {errors.notes && (
          <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
        )}
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
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-4 bg-blue-600 text-white font-semibold rounded-xl text-base disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit book'}
        </button>
      </div>
    </form>
  )
}
