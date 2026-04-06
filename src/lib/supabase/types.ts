export type SubmissionStatus =
  | 'pending_review'
  | 'isbn_required'
  | 'unidentifiable'
  | 'offer_sent'
  | 'pass_sent'
  | 'accepted'
  | 'declined'

export type ContactPreference = 'sms' | 'email'
export type BookCondition = 'like_new' | 'good' | 'acceptable' | 'poor'
export type IsbnConfidence = 'low' | 'medium' | 'high'

export interface Submission {
  id: string
  reference_number: string
  status: SubmissionStatus
  photo_urls: string[]
  contact_preference: ContactPreference
  contact_value: string
  condition: BookCondition
  isbn: string | null
  notes: string | null
  created_at: string
  isbn_extracted: string | null
  isbn_confidence: IsbnConfidence | null
  title: string | null
  author: string | null
  edition: string | null
  publisher: string | null
  asin: string | null
  claude_response: unknown | null
  keepa_data: unknown | null
  amazon_data: unknown | null
  recommended_offer: number | null
  confidence_level: string | null
  flags: string[]
  final_offer: number | null
  seller_notes: string | null
  responded_at: string | null
}

export interface Database {
  public: {
    Tables: {
      submissions: {
        Row: Submission
        Insert: Omit<Submission, 'id' | 'reference_number' | 'created_at' | 'status' | 'flags'> & {
          id?: string
          status?: SubmissionStatus
          flags?: string[]
        }
        Update: Partial<Submission>
      }
    }
  }
}
