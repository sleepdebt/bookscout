'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function ConfirmationContent() {
  const params = useSearchParams()
  const refsParam = params.get('refs') ?? params.get('ref') ?? ''
  const refs = refsParam ? refsParam.split(',').filter(Boolean) : []

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center gap-6">
      {/* Checkmark */}
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-3xl">
        ✓
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {refs.length > 1 ? `${refs.length} books submitted!` : 'We got it!'}
        </h1>
        <p className="text-gray-500 text-sm">
          {refs.length > 1 ? 'All your books are in the queue.' : 'Your book is in the queue.'}
        </p>
      </div>

      {/* Reference numbers */}
      {refs.length === 1 ? (
        <div className="bg-gray-50 rounded-xl px-8 py-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">
            Reference
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-widest">{refs[0]}</p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl px-6 py-4 w-full max-w-xs">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
            References
          </p>
          <div className="space-y-2">
            {refs.map((ref, i) => (
              <div key={ref} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Book {i + 1}</span>
                <span className="font-bold text-gray-900 tracking-widest text-lg">{ref}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response timeframe */}
      <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
        We'll email you within <strong>4 hours</strong>{' '}
        (Mon–Sat, 9am–6pm) with an offer or a pass on each book.
      </p>

      {/* What's next */}
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed border-t border-gray-100 pt-5">
        If we make an offer, we'll send a pickup time and OSU location. No shipping, no hassle.
      </p>

      {/* Submit another */}
      <Link
        href="/sell"
        className="text-sm text-blue-600 underline underline-offset-2"
      >
        Got more books? Submit them here.
      </Link>
    </div>
  )
}
