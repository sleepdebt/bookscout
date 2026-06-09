import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  await supabase.from('pricing_rules').select('id').limit(1)
  return NextResponse.json({ ok: true })
}
