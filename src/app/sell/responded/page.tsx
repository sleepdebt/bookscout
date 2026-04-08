import { Suspense } from 'react'
import Link from 'next/link'

export const metadata = { title: 'Response Recorded — BookScout' }

const STATES = {
  accept: {
    icon: (
      <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: 'bg-emerald-50',
    heading: 'Offer accepted!',
    body: "We'll reach out shortly to arrange a pickup time and location.",
  },
  decline: {
    icon: (
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: 'bg-gray-50',
    heading: 'No problem.',
    body: "Your response has been recorded. Thanks for giving BookScout a try.",
  },
  already_responded: {
    icon: (
      <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    bg: 'bg-amber-50',
    heading: "You've already responded.",
    body: "Looks like this offer has already been accepted or declined.",
  },
  expired: {
    icon: (
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: 'bg-gray-50',
    heading: 'This link has expired.',
    body: 'The offer may have been updated or the link is no longer valid. Reply to the original email if you have questions.',
  },
  invalid: {
    icon: (
      <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    bg: 'bg-red-50',
    heading: 'Invalid link.',
    body: 'Something went wrong with this link. Reply to the original email if you need help.',
  },
} as const

type StateKey = keyof typeof STATES

function RespondedContent({ searchParams }: { searchParams: URLSearchParams }) {
  const action = searchParams.get('action')
  const error = searchParams.get('error')
  const key: StateKey = (action === 'accept' || action === 'decline')
    ? action
    : (error as StateKey | null) ?? 'invalid'
  const state = STATES[key] ?? STATES.invalid

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center gap-5">
      <div className={`w-16 h-16 ${state.bg} rounded-full flex items-center justify-center`}>
        {state.icon}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{state.heading}</h1>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{state.body}</p>
      </div>
      {(action === 'accept' || action === 'decline') && (
        <Link href="/sell" className="text-sm text-blue-600 underline underline-offset-2">
          Got more books? Submit them here.
        </Link>
      )}
    </div>
  )
}

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function RespondedPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <Suspense>
      <RespondedContent searchParams={new URLSearchParams(params)} />
    </Suspense>
  )
}
