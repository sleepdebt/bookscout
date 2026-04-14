export type SubmissionStatus =
  | 'pending_review'
  | 'isbn_required'
  | 'unidentifiable'
  | 'offer_sent'
  | 'pass_sent'
  | 'accepted'
  | 'declined'
  | 'paid'

export type ContactPreference = 'email'
export type BookCondition = 'like_new' | 'good' | 'acceptable' | 'poor'
export type IsbnConfidence = 'low' | 'medium' | 'high'

export type Submission = {
  id: string
  reference_number: string
  status: SubmissionStatus
  photo_urls: string[]
  contact_preference: ContactPreference
  contact_value: string
  condition: BookCondition
  isbn: string | null
  notes: string | null
  student_name: string | null
  created_at: string
  isbn_extracted: string | null
  isbn_confidence: IsbnConfidence | null
  title: string | null
  author: string | null
  edition: string | null
  publisher: string | null
  asin: string | null
  claude_response: unknown
  keepa_data: unknown
  amazon_data: unknown
  recommended_offer: number | null
  confidence_level: string | null
  flags: string[]
  final_offer: number | null
  seller_notes: string | null
  responded_at: string | null
  batch_id: string | null
  response_token: string | null
}

export type SubmissionInsert = {
  id?: string
  reference_number?: string
  status?: SubmissionStatus
  photo_urls: string[]
  contact_preference: ContactPreference
  contact_value: string
  condition: BookCondition
  isbn?: string | null
  notes?: string | null
  student_name?: string | null
  isbn_extracted?: string | null
  isbn_confidence?: IsbnConfidence | null
  title?: string | null
  author?: string | null
  edition?: string | null
  publisher?: string | null
  asin?: string | null
  claude_response?: unknown
  keepa_data?: unknown
  amazon_data?: unknown
  recommended_offer?: number | null
  confidence_level?: string | null
  flags?: string[]
  final_offer?: number | null
  seller_notes?: string | null
  responded_at?: string | null
  batch_id?: string | null
  response_token?: string | null
}

export type PricingRulesRow = {
  id: string
  target_roi_min: number
  max_buy_price: number | null
  slow_mover_rank_threshold: number | null
  avoid_amazon_present: boolean
  category_overrides: Record<string, unknown>
  updated_at: string
}

export type SubmissionEvent = {
  id: string
  submission_id: string
  event_type: string
  old_status: string | null
  new_status: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      submissions: {
        Row: Submission
        Insert: SubmissionInsert
        Update: Partial<Submission>
        Relationships: []
      }
      pricing_rules: {
        Row: PricingRulesRow
        Insert: Partial<PricingRulesRow>
        Update: Partial<PricingRulesRow>
        Relationships: []
      }
      submission_events: {
        Row: SubmissionEvent
        Insert: Omit<SubmissionEvent, 'id' | 'created_at'>
        Update: Partial<SubmissionEvent>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
