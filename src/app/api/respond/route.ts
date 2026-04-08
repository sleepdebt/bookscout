import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const token = searchParams.get('token')
  const action = searchParams.get('action')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const redirect = (path: string) => NextResponse.redirect(new URL(path, appUrl))

  if (!token || (action !== 'accept' && action !== 'decline')) {
    return redirect('/sell/responded?error=invalid')
  }

  const service = createServiceClient()

  const { data: sub } = await service
    .from('submissions')
    .select('id, status, reference_number')
    .eq('response_token', token)
    .single()

  if (!sub) {
    return redirect('/sell/responded?error=expired')
  }

  if (sub.status !== 'offer_sent') {
    return redirect('/sell/responded?error=already_responded')
  }

  const newStatus = action === 'accept' ? 'accepted' : 'declined'

  await service
    .from('submissions')
    .update({
      status: newStatus,
      response_token: null,
      responded_at: new Date().toISOString(),
    })
    .eq('id', sub.id)

  await service
    .from('submission_events')
    .insert({
      submission_id: sub.id,
      event_type: 'student_responded',
      old_status: 'offer_sent',
      new_status: newStatus,
    })

  return redirect(`/sell/responded?action=${action}`)
}
