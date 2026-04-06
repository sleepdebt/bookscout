import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SELLER_EMAIL = Deno.env.get('SELLER_EMAIL')!

serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record

    if (!record) {
      return new Response(JSON.stringify({ error: 'No record in payload' }), { status: 400 })
    }

    const conditionLabels: Record<string, string> = {
      like_new: 'Like New',
      good: 'Good',
      acceptable: 'Acceptable',
      poor: 'Poor',
    }

    const lines = [
      `New BookScout submission: ${record.reference_number}`,
      '',
      `Condition: ${conditionLabels[record.condition] ?? record.condition}`,
      `Contact: ${record.contact_preference === 'sms' ? 'Text' : 'Email'} — ${record.contact_value}`,
      record.isbn ? `ISBN (student-provided): ${record.isbn}` : null,
      record.notes ? `Notes: ${record.notes}` : null,
      '',
      `Submitted at: ${new Date(record.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })}`,
    ].filter(Boolean).join('\n')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BookScout <onboarding@resend.dev>',
        to: SELLER_EMAIL,
        subject: `New submission: ${record.reference_number}`,
        text: lines,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error('notify-seller error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
