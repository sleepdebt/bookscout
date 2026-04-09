'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { pixelBgStyle } from '@/components/intake/WizardShell'

export function ConfirmationContent() {
  const params = useSearchParams()
  const refsParam = params.get('refs') ?? params.get('ref') ?? ''
  const refs = refsParam ? refsParam.split(',').filter(Boolean) : []

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4" style={pixelBgStyle}>
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl px-8 py-10 flex flex-col items-center text-center gap-6">
      {/* Animated checkmark */}
      <style>{`
        @keyframes circle-fade {
          0%, 100% { transform: scale(0.4); opacity: 0; }
          15%, 75% { transform: scale(1); opacity: 1; }
          10% { transform: scale(1.1); }
        }
        @keyframes check-loop {
          0%, 20% { stroke-dashoffset: 30; }
          50%, 80% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 30; }
        }
        .check-circle { animation: circle-fade 2.4s cubic-bezier(0.34,1.56,0.64,1) infinite; }
        .check-path {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: check-loop 2.4s ease-in-out infinite;
        }
      `}</style>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="check-circle" cx="32" cy="32" r="32" fill="#dbeafe" />
        <path
          className="check-path"
          d="M20 33l9 9 15-16"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

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
    </div>
  )
}
