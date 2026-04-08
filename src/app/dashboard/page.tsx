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

  let query = supabase
    .from('submissions')
    .select('id, reference_number, status, condition, isbn, isbn_extracted, title, recommended_offer, final_offer, created_at, batch_id')
    .order('created_at', { ascending: false })

  if (activeStatus !== 'all') {
    query = query.eq('status', activeStatus)
  }

  const { data: submissions } = await query

  // Group by batch_id — batch submissions become a single expandable row
  const rows: GroupedRow[] = []
  const batchMap = new Map<string, typeof submissions>()

  for (const sub of submissions ?? []) {
    if (sub.batch_id) {
      const existing = batchMap.get(sub.batch_id)
      if (existing) {
        existing.push(sub)
      } else {
        batchMap.set(sub.batch_id, [sub])
      }
    } else {
      rows.push({ type: 'single', sub })
    }
  }

  // Insert batch groups at the position of their earliest (first-created) submission
  // Since submissions are sorted DESC, first in array = most recent in batch
  // We need to interleave batches in the right position relative to singles.
  // Simpler: build a unified list sorted by the earliest submission in each group.
  const allRows: (GroupedRow & { _sortDate: string })[] = []

  for (const sub of submissions ?? []) {
    if (sub.batch_id) {
      // Only add the batch group once (when we encounter the first member, i.e. most recent)
      if (!allRows.some((r) => r.type === 'batch' && r.batch_id === sub.batch_id)) {
        const subs = batchMap.get(sub.batch_id)!
        allRows.push({
          type: 'batch',
          batch_id: sub.batch_id,
          subs,
          created_at: subs[0].created_at, // most recent in the batch
          _sortDate: subs[0].created_at,
        })
      }
    } else {
      allRows.push({ type: 'single', sub, _sortDate: sub.created_at })
    }
  }

  const finalRows: GroupedRow[] = allRows.map(({ _sortDate: _, ...r }) => r as GroupedRow)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">BookScout Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings" className="text-sm text-gray-500 hover:text-gray-700">Settings</Link>
          <form action="/auth/sign-out" method="POST">
            <button className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Status tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-lg p-1 w-fit">
          {STATUS_TABS.map(tab => (
            <Link
              key={tab.value}
              href={tab.value === 'all' ? '/dashboard' : `/dashboard?status=${tab.value}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeStatus === tab.value
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <SubmissionList rows={finalRows} />
        </div>
      </main>
    </div>
  )
}
