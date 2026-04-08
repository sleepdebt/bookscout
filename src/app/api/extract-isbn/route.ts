import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface ClaudeContent {
  type: string
  text?: string
}

interface ClaudeResponse {
  content: ClaudeContent[]
}

function cleanIsbn(raw: string): string | null {
  const digits = raw.replace(/[-\s]/g, '')
  if (/^\d{10}$/.test(digits) || /^\d{13}$/.test(digits)) return digits
  return null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let submissionId: string
  try {
    const body = await req.json() as { submissionId?: string }
    if (!body.submissionId) throw new Error()
    submissionId = body.submissionId
  } catch {
    return NextResponse.json({ error: 'submissionId is required' }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: sub, error: subError } = await service
    .from('submissions')
    .select('id, photo_urls')
    .eq('id', submissionId)
    .single()

  if (subError || !sub) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  if (!sub.photo_urls || sub.photo_urls.length === 0) {
    return NextResponse.json({ error: 'No photos to analyze' }, { status: 422 })
  }

  // Generate signed URLs and download up to 3 photos as base64
  const { data: signed } = await service.storage
    .from('book-photos')
    .createSignedUrls(sub.photo_urls.slice(0, 3), 60)

  if (!signed || signed.length === 0) {
    return NextResponse.json({ error: 'Could not access photos' }, { status: 500 })
  }

  // Download photos and convert to base64
  const imageBlocks: unknown[] = []
  for (const { signedUrl } of signed) {
    try {
      const imgRes = await fetch(signedUrl)
      if (!imgRes.ok) continue
      const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg'
      const buffer = await imgRes.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      imageBlocks.push({
        type: 'image',
        source: { type: 'base64', media_type: contentType, data: base64 },
      })
    } catch {
      // Skip photos that fail to download
    }
  }

  if (imageBlocks.length === 0) {
    return NextResponse.json({ error: 'Could not load photos' }, { status: 500 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set' }, { status: 500 })
  }

  // Call Claude vision
  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 64,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks,
            {
              type: 'text',
              text: 'Find the ISBN number in this book photo. Reply with ONLY the ISBN digits (no hyphens, no other text). If there are multiple ISBNs, return the 13-digit one. If no ISBN is visible, reply with NOT_FOUND.',
            },
          ],
        },
      ],
    }),
  })

  if (!claudeRes.ok) {
    const body = await claudeRes.text()
    return NextResponse.json({ error: `Claude API error: ${body}` }, { status: 502 })
  }

  const claudeData = await claudeRes.json() as ClaudeResponse
  const rawText = claudeData.content?.[0]?.text?.trim() ?? ''

  if (rawText === 'NOT_FOUND' || !rawText) {
    await service
      .from('submissions')
      .update({
        isbn_confidence: 'low',
        claude_response: claudeData,
      })
      .eq('id', submissionId)

    return NextResponse.json({ found: false })
  }

  const isbn = cleanIsbn(rawText)
  const confidence = isbn ? 'high' : 'low'

  await service
    .from('submissions')
    .update({
      isbn_extracted: isbn ?? null,
      isbn_confidence: confidence,
      claude_response: claudeData,
    })
    .eq('id', submissionId)

  return NextResponse.json({ found: !!isbn, isbn_extracted: isbn, confidence })
}
