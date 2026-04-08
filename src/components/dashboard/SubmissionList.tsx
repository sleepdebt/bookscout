'use client'

import Link from 'next/link'
import { useState } from 'react'
import { StatusBadge } from './StatusBadge'
import type { SubmissionStatus } from '@/lib/supabase/types'

interface SubRow {
  id: string
  reference_number: string
  status: SubmissionStatus
  condition: string
  isbn: string | null
  isbn_extracted: string | null
  title: string | null
  recommended_offer: number | null
  final_offer: number | null
  created_at: string
  batch_id: string | null
}

export type GroupedRow =
  | { type: 'single'; sub: SubRow }
  | { type: 'batch'; batch_id: string; subs: SubRow[]; created_at: string }

const CONDITION_LABELS: Record<string, string> = {
  like_new: 'Like New',
  good: 'Good',
  acceptable: 'Acceptable',
  poor: 'Poor',
}

function batchSummaryStatus(subs: SubRow[]): string {
  const counts: Partial<Record<SubmissionStatus, number>> = {}
  for (const s of subs) {
    counts[s.status] = (counts[s.status] ?? 0) + 1
  }
  const parts = Object.entries(counts).map(([status, count]) =>
    count === 1 ? status.replace(/_/g, ' ') : `${count}× ${status.replace(/_/g, ' ')}`
  )
  return parts.join(', ')
}

function BatchRow({ row }: { row: Extract<GroupedRow, { type: 'batch' }> }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(row.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const totalOffer = row.subs.reduce((sum, s) => sum + (s.final_offer ?? 0), 0)
  const hasFinalOffers = row.subs.some((s) => s.final_offer != null)

  return (
    <>
      {/* Batch header row */}
      <tr
        className="hover:bg-blue-50 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">
          <span className="mr-1 text-gray-400">{expanded ? '▾' : '▸'}</span>
          BATCH
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            {row.subs.length} books
          </span>
        </td>
        <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">
          {batchSummaryStatus(row.subs)}
        </td>
        <td className="px-4 py-3 text-gray-400 text-xs">—</td>
        <td className="px-4 py-3 text-gray-400">—</td>
        <td className="px-4 py-3 text-gray-800 font-medium text-sm">
          {hasFinalOffers ? `$${totalOffer.toFixed(2)}` : '—'}
        </td>
        <td className="px-4 py-3 text-gray-500 text-sm">{date}</td>
        <td className="px-4 py-3" />
      </tr>

      {/* Expanded child rows */}
      {expanded && row.subs.map((sub) => {
        const isbn = sub.isbn_extracted ?? sub.isbn
        const displayBook = sub.title ?? isbn ?? '—'
        return (
          <tr key={sub.id} className="bg-gray-50 border-l-4 border-indigo-200 hover:bg-indigo-50 transition-colors">
            <td className="pl-8 pr-4 py-2.5 font-mono text-xs text-gray-400">{sub.reference_number}</td>
            <td className="px-4 py-2.5">
              <StatusBadge status={sub.status} />
            </td>
            <td className="px-4 py-2.5 max-w-[200px] truncate text-gray-700 text-sm">{displayBook}</td>
            <td className="px-4 py-2.5 text-gray-500 text-sm">
              {CONDITION_LABELS[sub.condition] ?? sub.condition}
            </td>
            <td className="px-4 py-2.5 text-gray-700 text-sm">
              {sub.recommended_offer != null ? `$${sub.recommended_offer.toFixed(2)}` : '—'}
            </td>
            <td className="px-4 py-2.5 text-gray-800 font-medium text-sm">
              {sub.final_offer != null ? `$${sub.final_offer.toFixed(2)}` : '—'}
            </td>
            <td className="px-4 py-2.5 text-gray-400 text-xs">
              {new Date(sub.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </td>
            <td className="px-4 py-2.5">
              <Link
                href={`/dashboard/submissions/${sub.id}`}
                className="text-xs font-medium text-indigo-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Review →
              </Link>
            </td>
          </tr>
        )
      })}
    </>
  )
}

export function SubmissionList({ rows }: { rows: GroupedRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">No submissions found.</div>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50">
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Ref</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Book</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Condition</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rec. Offer</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Final Offer</th>
          <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((row) => {
          if (row.type === 'batch') {
            return <BatchRow key={row.batch_id} row={row} />
          }
          const sub = row.sub
          const isbn = sub.isbn_extracted ?? sub.isbn
          const displayBook = sub.title ?? isbn ?? '—'
          const date = new Date(sub.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })
          return (
            <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{sub.reference_number}</td>
              <td className="px-4 py-3">
                <StatusBadge status={sub.status} />
              </td>
              <td className="px-4 py-3 max-w-[200px] truncate text-gray-800">{displayBook}</td>
              <td className="px-4 py-3 text-gray-600">
                {CONDITION_LABELS[sub.condition] ?? sub.condition}
              </td>
              <td className="px-4 py-3 text-gray-800">
                {sub.recommended_offer != null ? `$${sub.recommended_offer.toFixed(2)}` : '—'}
              </td>
              <td className="px-4 py-3 text-gray-800 font-medium">
                {sub.final_offer != null ? `$${sub.final_offer.toFixed(2)}` : '—'}
              </td>
              <td className="px-4 py-3 text-gray-500">{date}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/submissions/${sub.id}`}
                  className="text-xs font-medium text-gray-900 hover:underline"
                >
                  Review →
                </Link>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
