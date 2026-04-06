'use client'

import { useSearchParams } from 'next/navigation'

export function ConfirmationContent() {
  const params = useSearchParams()
  const ref = params.get('ref') ?? '------'

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center gap-6">
      {/* Checkmark */}
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-3xl">
        ✓
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">We got it!</h1>
        <p className="text-gray-500 text-sm">Your book is in the queue.</p>
      </div>

      {/* Reference number */}
      <div className="bg-gray-50 rounded-xl px-8 py-4">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">
          Reference
        </p>
        <p className="text-3xl font-bold text-gray-900 tracking-widest">{ref}</p>
      </div>

      {/* Response timeframe */}
      <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
        We'll text or email you within <strong>4 hours</strong>{' '}
        (Mon–Sat, 9am–6pm) with an offer or a pass.
      </p>

      {/* What's next */}
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed border-t border-gray-100 pt-5">
        If we make an offer, we'll send a pickup time and OSU location. No shipping, no hassle.
      </p>
    </div>
  )
}
