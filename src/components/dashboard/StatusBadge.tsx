import type { SubmissionStatus } from '@/lib/supabase/types'

const STATUS_STYLES: Record<SubmissionStatus, { label: string; className: string }> = {
  pending_review: { label: 'Pending',     className: 'bg-yellow-100 text-yellow-800' },
  isbn_required:  { label: 'Needs ISBN',  className: 'bg-orange-100 text-orange-800' },
  unidentifiable: { label: 'Unidentifiable', className: 'bg-red-100 text-red-700' },
  offer_sent:     { label: 'Offer Sent',  className: 'bg-blue-100 text-blue-800' },
  pass_sent:      { label: 'Pass Sent',   className: 'bg-gray-100 text-gray-600' },
  accepted:       { label: 'Accepted',    className: 'bg-green-100 text-green-800' },
  declined:       { label: 'Declined',    className: 'bg-gray-100 text-gray-500' },
}

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const { label, className } = STATUS_STYLES[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
