import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendEmail, buildOfferEmail } from '@/lib/resend'
import type { SubmissionStatus } from '@/lib/supabase/types'

interface PatchBody {
  status?: SubmissionStatus
  final_offer?: number | null
  seller_notes?: string | null
  isbn?: string | null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: PatchBody
  try {
    body = await req.json() as PatchBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (body.status !== undefined) update.status = body.status
  if (body.final_offer !== undefined) update.final_offer = body.final_offer
  if (body.seller_notes !== undefined) update.seller_notes = body.seller_notes
  if (body.isbn !== undefined) update.isbn = body.isbn
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service
    .from('submissions')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send offer email when status is set to offer_sent
  if (body.status === 'offer_sent') {
    const { data: sub } = await service
      .from('submissions')
      .select('contact_preference, contact_value, title, final_offer, reference_number')
      .eq('id', id)
      .single()

    if (sub?.contact_preference === 'email' && sub.contact_value && sub.final_offer != null) {
      const sellerEmail = process.env.SELLER_EMAIL ?? ''
      const { subject, text } = buildOfferEmail({
        reference_number: sub.reference_number,
        title: sub.title,
        final_offer: Number(sub.final_offer),
        seller_email: sellerEmail,
      })

      try {
        await sendEmail({ to: sub.contact_value, subject, text, replyTo: sellerEmail })
      } catch (err) {
        // Log but don't fail the request — the DB update already succeeded
        console.error('[notify-student] Email failed:', err)
        return NextResponse.json({ ok: true, email_error: String(err) })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
