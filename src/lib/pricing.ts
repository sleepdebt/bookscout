import type { CanopyProduct } from './canopy'
import type { BookCondition } from './supabase/types'

export interface PricingRules {
  target_roi_min: number        // e.g. 0.50 = 50% ROI required
  max_buy_price: number | null
  slow_mover_rank_threshold: number | null
  avoid_amazon_present: boolean
  category_overrides: Record<string, unknown>
}

export interface OfferResult {
  recommended_offer: number | null
  confidence_level: 'high' | 'medium' | 'low'
  flags: string[]
}

const CONDITION_MULTIPLIERS: Record<BookCondition, number> = {
  like_new:   0.80,
  good:       0.60,
  acceptable: 0.35,
  poor:       0.15,
}

function roundToQuarter(value: number): number {
  return Math.floor(value * 4) / 4
}

export function computeOffer(
  product: CanopyProduct,
  condition: BookCondition,
  rules: PricingRules
): OfferResult {
  const flags: string[] = []

  // No price data — can't make an offer
  if (!product.price || product.price.value <= 0) {
    return { recommended_offer: null, confidence_level: 'low', flags: ['no_amazon_price'] }
  }

  const amazonPrice = product.price.value
  const multiplier = CONDITION_MULTIPLIERS[condition]

  // Flag slow movers (if Canopy returns salesRank)
  if (
    rules.slow_mover_rank_threshold !== null &&
    product.salesRank !== null &&
    product.salesRank > rules.slow_mover_rank_threshold
  ) {
    flags.push('slow_mover')
  }

  // Hard pass if Amazon is a seller and seller config says to avoid
  if (rules.avoid_amazon_present && product.amazonIsSeller === true) {
    flags.push('amazon_seller')
    return { recommended_offer: 0, confidence_level: 'low', flags }
  }

  // Base offer: condition-adjusted price
  let offer = amazonPrice * multiplier

  // ROI floor: we need to buy at most amazonPrice / (1 + target_roi_min)
  // to guarantee the minimum ROI when reselling at amazon price
  const roiCap = amazonPrice / (1 + rules.target_roi_min)
  if (offer > roiCap) {
    offer = roiCap
  }

  // Hard cap from seller config
  if (rules.max_buy_price !== null && offer > rules.max_buy_price) {
    offer = rules.max_buy_price
    flags.push('capped_at_max')
  }

  // Round down to nearest $0.25
  offer = roundToQuarter(offer)

  // Don't offer less than $0.25
  if (offer < 0.25) {
    return { recommended_offer: 0, confidence_level: 'low', flags: [...flags, 'below_minimum'] }
  }

  const confidence_level =
    flags.length === 0 ? 'high'
    : flags.includes('slow_mover') ? 'medium'
    : 'medium'

  return { recommended_offer: offer, confidence_level, flags }
}
