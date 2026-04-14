import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { lookupByISBN } from '@/lib/canopy'
import { computeOffer } from '@/lib/pricing'
import type { PricingRules } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  // 1. Verify authenticated session
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse request body
  let submissionId: string
  try {
    const body = await req.json() as { submissionId?: string }
    if (!body.submissionId) throw new Error('missing submissionId')
    submissionId = body.submissionId
  } catch {
    return NextResponse.json({ error: 'submissionId is required' }, { status: 400 })
  }

  const service = createServiceClient()

  // 3. Fetch submission
  const { data: submission, error: subError } = await service
    .from('submissions')
    .select('id, isbn, isbn_extracted, condition')
    .eq('id', submissionId)
    .single()

  if (subError || !submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  // 4. Resolve ISBN — prefer AI-extracted over user-entered
  const isbn = submission.isbn_extracted ?? submission.isbn
  if (!isbn) {
    return NextResponse.json({ error: 'no_isbn' }, { status: 422 })
  }

  // 5. Look up on Amazon via Canopy
  let canopyResult: Awaited<ReturnType<typeof lookupByISBN>>
  try {
    canopyResult = await lookupByISBN(isbn)
    console.log('[price-book] Canopy raw response:', JSON.stringify(canopyResult?.raw ?? null, null, 2))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Canopy lookup failed'
    console.error('[price-book] Canopy error:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }

  if (!canopyResult) {
    // Book not found on Amazon
    await service
      .from('submissions')
      .update({ status: 'isbn_required', flags: ['not_found_on_amazon'] })
      .eq('id', submissionId)
    return NextResponse.json({ error: 'not_found_on_amazon' }, { status: 404 })
  }

  const { product, raw } = canopyResult

  // 6. Fetch pricing rules (single row)
  const { data: rulesRow } = await service
    .from('pricing_rules')
    .select('*')
    .limit(1)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = rulesRow as any
  const rules: PricingRules = {
    target_roi_min:            row?.target_roi_min            ?? 0.5,
    max_buy_price:             row?.max_buy_price             ?? null,
    slow_mover_rank_threshold: row?.slow_mover_rank_threshold ?? null,
    avoid_amazon_present:      row?.avoid_amazon_present      ?? true,
    amazon_fee_rate:           row?.amazon_fee_rate           ?? 0.15,
    amazon_closing_fee:        row?.amazon_closing_fee        ?? 1.80,
    category_overrides:        row?.category_overrides        ?? {},
  }

  // 7. Compute offer
  const offerResult = computeOffer(product, submission.condition, rules)

  // 8. Update submission — store parsed product (not raw wrapper) in amazon_data
  await service
    .from('submissions')
    .update({
      asin: product.asin,
      title: product.title ?? null,
      amazon_data: product,
      recommended_offer: offerResult.recommended_offer,
      confidence_level: offerResult.confidence_level,
      flags: offerResult.flags,
    })
    .eq('id', submissionId)

  return NextResponse.json({
    asin: product.asin,
    amazon_price: product.price?.value ?? null,
    ...offerResult,
  })
}
