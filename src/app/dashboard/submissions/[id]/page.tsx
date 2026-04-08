import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { PriceButton } from '@/components/dashboard/PriceButton'
import { IsbnPriceForm } from '@/components/dashboard/IsbnPriceForm'
import { ExtractIsbnButton } from '@/components/dashboard/ExtractIsbnButton'
import { OfferForm } from '@/components/dashboard/OfferForm'

export const metadata = { title: 'Submission — BookScout' }

const CONDITION_LABELS = {
  like_new: 'Like New',
  good: 'Good',
  acceptable: 'Acceptable',
  poor: 'Poor',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const service = createServiceClient()

  // Fetch full submission
  const { data: sub, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !sub) notFound()

  // Generate signed URLs for photos (private bucket, 1hr expiry)
  let photoUrls: string[] = []
  if (sub.photo_urls && sub.photo_urls.length > 0) {
    const { data: signed } = await service.storage
      .from('book-photos')
      .createSignedUrls(sub.photo_urls, 3600)
    photoUrls = signed?.map(s => s.signedUrl).filter(Boolean) ?? []
  }

  const isbn = sub.isbn_extracted ?? sub.isbn
  const amazonData = sub.amazon_data as {
    price?: { value: number; displayString: string }
    asin?: string
    link?: string
  } | null
  const hasPricing = sub.recommended_offer != null || amazonData != null

  const date = new Date(sub.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</Link>
        <span className="text-gray-300">|</span>
        <span className="font-mono text-sm text-gray-600">{sub.reference_number}</span>
        <StatusBadge status={sub.status} />
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Photos + book info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          {photoUrls.length > 0 ? (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-3">Photos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photoUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center text-gray-400 text-sm">
              No photos
            </div>
          )}

          {/* Book details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Submission Details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Submitted</dt>
                <dd className="text-gray-900 mt-0.5">{date}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Condition</dt>
                <dd className="text-gray-900 mt-0.5">
                  {CONDITION_LABELS[sub.condition as keyof typeof CONDITION_LABELS] ?? sub.condition}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">ISBN</dt>
                <dd className="font-mono text-gray-900 mt-0.5">{isbn ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">ASIN</dt>
                <dd className="font-mono text-gray-900 mt-0.5">{sub.asin ?? '—'}</dd>
              </div>
              {sub.title && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Title</dt>
                  <dd className="text-gray-900 mt-0.5">{sub.title}</dd>
                </div>
              )}
              {sub.author && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Author</dt>
                  <dd className="text-gray-900 mt-0.5">{sub.author}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900 mt-0.5">{sub.contact_value}</dd>
              </div>
              {sub.notes && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Student Notes</dt>
                  <dd className="text-gray-900 mt-0.5">{sub.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Amazon data */}
          {hasPricing && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Amazon Data</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Current Price</dt>
                  <dd className="text-gray-900 mt-0.5 font-medium">
                    {amazonData?.price?.displayString ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Recommended Offer</dt>
                  <dd className={`mt-0.5 font-semibold ${sub.recommended_offer ? 'text-green-700' : 'text-gray-400'}`}>
                    {sub.recommended_offer != null ? `$${sub.recommended_offer.toFixed(2)}` : '—'}
                  </dd>
                </div>
                {sub.confidence_level && (
                  <div>
                    <dt className="text-gray-500">Confidence</dt>
                    <dd className="text-gray-900 mt-0.5 capitalize">{sub.confidence_level}</dd>
                  </div>
                )}
                {amazonData?.link && (
                  <div>
                    <dt className="text-gray-500">Amazon</dt>
                    <dd className="mt-0.5">
                      <a href={amazonData.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                        View listing ↗
                      </a>
                    </dd>
                  </div>
                )}
                {sub.flags && sub.flags.length > 0 && (
                  <div className="col-span-2">
                    <dt className="text-gray-500">Flags</dt>
                    <dd className="mt-0.5 flex flex-wrap gap-1">
                      {sub.flags.map((flag: string) => (
                        <span key={flag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700">
                          {flag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          {/* Pricing panel — always visible */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Pricing</h2>
            {hasPricing ? (
              <div className="space-y-3">
                <div className="text-sm space-y-1">
                  {amazonData?.price?.displayString ? (
                    <p className="text-gray-700">Amazon: <span className="font-medium">{amazonData.price.displayString}</span></p>
                  ) : (
                    <p className="text-orange-600 text-sm">No active Amazon listing.</p>
                  )}
                  {sub.recommended_offer != null && sub.recommended_offer > 0 && (
                    <p className="text-green-700 font-semibold">Offer: ${sub.recommended_offer.toFixed(2)}</p>
                  )}
                  {sub.recommended_offer === 0 && (
                    <p className="text-red-600 text-sm">Pass — {sub.flags?.join(', ')}</p>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400 mb-2">Re-run pricing:</p>
                  <PriceButton submissionId={sub.id} />
                </div>
              </div>
            ) : isbn ? (
              <PriceButton submissionId={sub.id} />
            ) : (
              <div className="space-y-4">
                {photoUrls.length > 0 && (
                  <>
                    <ExtractIsbnButton submissionId={sub.id} />
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-400 mb-3">Or enter manually:</p>
                      <IsbnPriceForm submissionId={sub.id} />
                    </div>
                  </>
                )}
                {photoUrls.length === 0 && <IsbnPriceForm submissionId={sub.id} />}
              </div>
            )}
          </div>

          {/* Offer & status form */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Decision</h2>
            <div className="mb-4 pb-4 border-b border-gray-100 text-sm">
              <p className="text-gray-500 text-xs mb-1">Student email</p>
              <a href={`mailto:${sub.contact_value}`} className="text-gray-900 hover:underline break-all">
                {sub.contact_value}
              </a>
            </div>
            <OfferForm
              submissionId={sub.id}
              initialStatus={sub.status}
              initialOffer={sub.final_offer}
              initialNotes={sub.seller_notes}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
