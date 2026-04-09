'use client'

import { useRef, useState } from 'react'
import type { BookEntry } from './WizardShell'
import type { BookCondition } from '@/lib/supabase/types'

interface StepBooksProps {
  initialBooks: BookEntry[]
  onComplete: (books: BookEntry[]) => void
  onBack: () => void
}

const CONDITIONS: { value: BookCondition; label: string }[] = [
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'acceptable', label: 'Acceptable' },
  { value: 'poor', label: 'Poor' },
]

const CONDITION_LABELS: Record<BookCondition, string> = {
  like_new: 'Like New',
  good: 'Good',
  acceptable: 'Acceptable',
  poor: 'Poor',
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
const MAX_SIZE_BYTES = 10 * 1024 * 1024

interface ActiveBook {
  photos: File[]
  photoUrls: string[]
  condition: BookCondition | ''
  isbn: string
  notes: string
}

const emptyBook = (): ActiveBook => ({
  photos: [],
  photoUrls: [],
  condition: '',
  isbn: '',
  notes: '',
})

export function StepBooks({ initialBooks, onComplete, onBack }: StepBooksProps) {
  const [books, setBooks] = useState<BookEntry[]>(initialBooks)
  const [active, setActive] = useState<ActiveBook>(emptyBook())
  const [formatError, setFormatError] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormatError(null)
    setSizeError(null)
    const files = Array.from(e.target.files ?? [])
    const invalidFormat = files.find((f) => !ACCEPTED_TYPES.includes(f.type))
    if (invalidFormat) {
      setFormatError(`"${invalidFormat.name}" isn't supported. Use JPEG, PNG, HEIC, HEIF, or WebP.`)
      e.target.value = ''
      return
    }
    const oversized = files.find((f) => f.size > MAX_SIZE_BYTES)
    if (oversized) {
      setSizeError(`"${oversized.name}" is too large. Each photo must be under 10 MB.`)
      e.target.value = ''
      return
    }
    const toAdd = files.slice(0, 3 - active.photos.length)
    const newUrls = toAdd.map((f) => URL.createObjectURL(f))
    setActive((a) => ({
      ...a,
      photos: [...a.photos, ...toAdd].slice(0, 3),
      photoUrls: [...a.photoUrls, ...newUrls].slice(0, 3),
    }))
    e.target.value = ''
  }

  function clearUploadErrors() {
    setFormatError(null)
    setSizeError(null)
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(active.photoUrls[index])
    setActive((a) => ({
      ...a,
      photos: a.photos.filter((_, i) => i !== index),
      photoUrls: a.photoUrls.filter((_, i) => i !== index),
    }))
  }

  function addBook() {
    setFormError(null)
    if (active.photos.length === 0) {
      setFormError('Add at least one photo.')
      return
    }
    if (!active.condition) {
      setFormError('Select a condition.')
      return
    }
    if (active.isbn && !/^\d{9}[\dX]$|^\d{13}$/.test(active.isbn)) {
      setFormError('ISBN must be 10 or 13 digits.')
      return
    }
    setBooks((prev) => [
      ...prev,
      {
        photos: active.photos,
        condition: active.condition as BookCondition,
        isbn: active.isbn,
        notes: active.notes,
      },
    ])
    setActive(emptyBook())
  }

  function removeBook(index: number) {
    setBooks((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Add your books</h1>
        <p className="text-sm text-gray-500">
          Add each book you'd like to sell. Start with the back cover photo.
        </p>
      </div>

      {/* Already-added books */}
      {books.length > 0 && (
        <div className="space-y-2">
          {books.map((book, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
            >
              {/* Thumbnail */}
              <img
                src={URL.createObjectURL(book.photos[0])}
                alt={`Book ${i + 1}`}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Book {i + 1}</p>
                <p className="text-xs text-gray-500">{CONDITION_LABELS[book.condition]}{book.isbn ? ` · ISBN ${book.isbn}` : ''}</p>
              </div>
              <button
                type="button"
                onClick={() => removeBook(i)}
                className="text-gray-400 hover:text-red-500 text-lg leading-none ml-2"
                aria-label="Remove book"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add book form */}
      <div className="border border-gray-200 rounded-xl p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-700">
          {books.length === 0 ? 'Book details' : 'Add another book'}
        </p>

        {/* Photo upload */}
        <div>
          <div
            onClick={() => { clearUploadErrors(); inputRef.current?.click() }}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <p className="text-3xl mb-1">📷</p>
            <p className="text-sm font-medium text-gray-700">Tap to add photos</p>
            <p className="text-xs text-gray-400 mt-1">Up to 3 · JPEG, PNG, HEIC, HEIF, or WebP · max 10 MB each</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
              multiple
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {formatError && (
            <p className="text-sm text-red-600 mt-1.5 flex items-start gap-1">
              <span className="mt-px">⚠️</span> {formatError}
            </p>
          )}
          {sizeError && (
            <p className="text-sm text-red-600 mt-1.5 flex items-start gap-1">
              <span className="mt-px">⚠️</span> {sizeError}
            </p>
          )}

          {active.photos.length > 0 && (
            <div className="flex gap-2 mt-3">
              {active.photos.map((_, i) => (
                <div key={i} className="relative w-16 h-16">
                  <img
                    src={active.photoUrls[i]}
                    alt={`Photo ${i + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full text-xs flex items-center justify-center"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              {active.photos.length < 3 && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg text-xl text-gray-400 flex items-center justify-center"
                >
                  +
                </button>
              )}
            </div>
          )}
        </div>

        {/* Condition */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Condition</label>
          <select
            value={active.condition}
            onChange={(e) => setActive((a) => ({ ...a, condition: e.target.value as BookCondition | '' }))}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select condition...</option>
            {CONDITIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Optional ISBN */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            ISBN <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={active.isbn}
            onChange={(e) => setActive((a) => ({ ...a, isbn: e.target.value }))}
            placeholder="10 or 13 digits"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Optional notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={2}
            maxLength={200}
            value={active.notes}
            onChange={(e) => setActive((a) => ({ ...a, notes: e.target.value }))}
            placeholder="Torn cover, missing access code, etc."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="button"
          onClick={addBook}
          className="w-full py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl text-base hover:bg-blue-50 transition-colors"
        >
          + Add this book
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-auto">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl text-base"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => books.length > 0 && onComplete(books)}
          disabled={books.length === 0}
          className="flex-1 py-4 bg-blue-600 text-white font-semibold rounded-xl text-base disabled:opacity-40"
        >
          Review {books.length > 0 ? `(${books.length})` : ''}
        </button>
      </div>
    </div>
  )
}
