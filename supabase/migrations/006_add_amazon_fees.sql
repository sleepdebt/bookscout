-- Add configurable Amazon seller fee fields to pricing_rules
ALTER TABLE pricing_rules
  ADD COLUMN IF NOT EXISTS amazon_fee_rate   numeric(5,4) NOT NULL DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS amazon_closing_fee numeric(6,2) NOT NULL DEFAULT 1.80;
