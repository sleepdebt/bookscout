const RESEND_API_URL = 'https://api.resend.com/emails'

interface SendEmailOptions {
  to: string
  subject: string
  text: string
  replyTo?: string
}

export async function sendEmail({ to, subject, text, replyTo }: SendEmailOptions): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BookScout <onboarding@resend.dev>',
      to,
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
}

export function buildOfferEmail(params: {
  reference_number: string
  title: string | null
  final_offer: number
  seller_email: string
  response_token?: string | null
  app_url?: string
}): { subject: string; text: string } {
  const book = params.title ?? 'your book'
  const subject = `Your BookScout offer — ${params.reference_number}`

  const responseLines: string[] = []
  if (params.response_token && params.app_url) {
    const base = `${params.app_url}/api/respond?token=${params.response_token}`
    responseLines.push(
      `Accept this offer:`,
      `${base}&action=accept`,
      ``,
      `Decline this offer:`,
      `${base}&action=decline`,
    )
  } else {
    responseLines.push(`To accept or decline, reply to this email or contact us at ${params.seller_email}.`)
  }

  const text = [
    `Hi,`,
    ``,
    `We've reviewed ${book} (ref: ${params.reference_number}) and we'd like to make you an offer.`,
    ``,
    `Our offer: $${params.final_offer.toFixed(2)}`,
    ``,
    ...responseLines,
    ``,
    `This offer is valid for 7 days.`,
    ``,
    `— BookScout`,
  ].join('\n')

  return { subject, text }
}
