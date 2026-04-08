import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SubmissionList } from '@/components/dashboard/SubmissionList'
import type { GroupedRow } from '@/components/dashboard/SubmissionList'
import type { SubmissionStatus } from '@/lib/supabase/types'

export const metadata = { title: 'Dashboard — BookScout' }

const STATUS_TABS: { value: SubmissionStatus | 'all'; label: string }[] = [
  { value: 'all',            label: 'All' },
  { value: 'pending_review', label: 'Pending' },
  { value: 'isbn_required',  label: 'Needs ISBN' },
  { value: 'unidentifiable', label: 'Unidentifiable' },
  { value: 'offer_sent',     label: 'Offer Sent' },
  { value: 'pass_sent',      label: 'Pass Sent' },
  { value: 'accepted',       label: 'Accepted' },
  { value: 'declined',       label: 'Declined' },
]

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams
  const activeStatus = (statusParam ?? 'all') as SubmissionStatus | 'all'

  const supabase = await createClient()

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  // Analytics + notifications + table query all in parallel
  const [totalRes, needsReviewRes, offersRes, acceptedRes, todayRes, eventsRes, tableRes] =
    await Promise.all([
      supabase.from('submissions').select('*', { count: 'exact', head: true }),
      supabase.from('submissions').select('*', { count: 'exact', head: true })
        .in('status', ['pending_review', 'isbn_required']),
      supabase.from('submissions').select('*', { count: 'exact', head: true })
        .eq('status', 'offer_sent'),
      supabase.from('submissions').select('*', { count: 'exact', head: true })
        .eq('status', 'accepted'),
      supabase.from('submissions').select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString()),
      supabase
        .from('submission_events')
        .select('id, submission_id, event_type, new_status, created_at, submissions(reference_number, title, id)')
        .eq('event_type', 'student_responded')
        .order('created_at', { ascending: false })
        .limit(10),
      (() => {
        let q = supabase
          .from('submissions')
          .select('id, reference_number, status, condition, isbn, isbn_extracted, title, recommended_offer, final_offer, created_at, batch_id')
          .order('created_at', { ascending: false })
        if (activeStatus !== 'all') q = q.eq('status', activeStatus)
        return q
      })(),
    ])

  const totalCount    = totalRes.count ?? 0
  const needsReview   = needsReviewRes.count ?? 0
  const offersOut     = offersRes.count ?? 0
  const acceptedCount = acceptedRes.count ?? 0
  const todayCount    = todayRes.count ?? 0
  type EventRow = {
    id: string
    event_type: string
    new_status: string | null
    created_at: string
    submissions: { id: string; reference_number: string; title: string | null } | null
  }
  const events = (eventsRes.data ?? []) as unknown as EventRow[]
  const submissions   = tableRes.data

  // Group by batch_id
  const batchMap = new Map<string, NonNullable<typeof submissions>>()
  for (const sub of submissions ?? []) {
    if (sub.batch_id) {
      const existing = batchMap.get(sub.batch_id)
      if (existing) existing.push(sub)
      else batchMap.set(sub.batch_id, [sub])
    }
  }

  const allRows: (GroupedRow & { _sortDate: string })[] = []
  for (const sub of submissions ?? []) {
    if (sub.batch_id) {
      if (!allRows.some((r) => r.type === 'batch' && r.batch_id === sub.batch_id)) {
        const subs = batchMap.get(sub.batch_id)!
        allRows.push({ type: 'batch', batch_id: sub.batch_id, subs, created_at: subs[0].created_at, _sortDate: subs[0].created_at })
      }
    } else {
      allRows.push({ type: 'single', sub, _sortDate: sub.created_at })
    }
  }
  const finalRows: GroupedRow[] = allRows.map(({ _sortDate: _, ...r }) => r as GroupedRow)

  function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <span className="text-base font-semibold text-gray-900">BookScout</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/dashboard/settings" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Settings</Link>
            <form action="/auth/sign-out" method="POST">
              <button className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Analytics cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Total Submissions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Total Submissions</p>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
            <p className="text-xs text-gray-400 mt-2">
              <span className="text-emerald-600 font-semibold">+{todayCount}</span> today
            </p>
          </div>

          {/* Needs Review */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Needs Review</p>
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{needsReview}</p>
            <p className="text-xs text-gray-400 mt-2">pending + needs ISBN</p>
          </div>

          {/* Offers Out */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Offers Out</p>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{offersOut}</p>
            <p className="text-xs text-gray-400 mt-2">awaiting student response</p>
          </div>

          {/* Accepted */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">Accepted</p>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{acceptedCount}</p>
            <p className="text-xs text-gray-400 mt-2">confirmed purchases</p>
          </div>

        </div>

        {/* Student Responses (only rendered when there are events) */}
        {events.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">Student Responses</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {events.length}
              </span>
            </div>
            <ul className="divide-y divide-gray-100">
              {events.map((event) => {
                const sub = event.submissions as { id: string; reference_number: string; title: string | null } | null
                const accepted = event.new_status === 'accepted'
                return (
                  <li key={event.id} className="flex items-center gap-4 px-6 py-4">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${accepted ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      {accepted ? (
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className={`font-semibold ${accepted ? 'text-emerald-700' : 'text-gray-600'}`}>
                          {accepted ? 'Accepted' : 'Declined'}
                        </span>
                        {' — '}
                        {sub?.title ?? sub?.reference_number ?? 'submission'}
                        {sub?.title && sub?.reference_number && (
                          <span className="text-gray-400"> · {sub.reference_number}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{relativeTime(event.created_at)}</p>
                    </div>

                    {/* Link */}
                    {sub?.id && (
                      <Link
                        href={`/dashboard/submissions/${sub.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                      >
                        View →
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Submissions Console */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Console header */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100 space-y-3">
            <h2 className="font-semibold text-gray-900">Submissions Console</h2>
            <div className="overflow-x-auto pb-0.5">
              <div className="flex gap-1 min-w-max">
                {STATUS_TABS.map(tab => (
                  <Link
                    key={tab.value}
                    href={tab.value === 'all' ? '/dashboard' : `/dashboard?status=${tab.value}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      activeStatus === tab.value
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <SubmissionList rows={finalRows} />
        </div>

      </main>
    </div>
  )
}
