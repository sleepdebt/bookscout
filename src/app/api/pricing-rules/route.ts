import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface PatchBody {
  target_roi_min?: number
  max_buy_price?: number | null
  slow_mover_rank_threshold?: number | null
  avoid_amazon_present?: boolean
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('pricing_rules')
    .select('*')
    .limit(1)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: PatchBody
  try {
    body = await req.json() as PatchBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.target_roi_min !== undefined) update.target_roi_min = body.target_roi_min
  if (body.max_buy_price !== undefined) update.max_buy_price = body.max_buy_price
  if (body.slow_mover_rank_threshold !== undefined) update.slow_mover_rank_threshold = body.slow_mover_rank_threshold
  if (body.avoid_amazon_present !== undefined) update.avoid_amazon_present = body.avoid_amazon_present

  const service = createServiceClient()
  const { error } = await service
    .from('pricing_rules')
    .update(update)
    .neq('id', '00000000-0000-0000-0000-000000000000') // update the single row

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
