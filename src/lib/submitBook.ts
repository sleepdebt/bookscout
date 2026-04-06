import { createClient } from './supabase/client'
import type { BookCondition, ContactPreference, Database } from './supabase/types'

type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']

export interface SubmitBookInput {
  photos: File[]
  contact_preference: ContactPreference
  contact_value: string
  condition: BookCondition
  isbn?: string
  notes?: string
}

export interface SubmitBookResult {
  reference_number: string
}

export async function submitBook(input: SubmitBookInput): Promise<SubmitBookResult> {
  const supabase = createClient()

  // 1. Upload photos to Supabase Storage
  const photoUrls: string[] = []
  for (const photo of input.photos) {
    const ext = photo.name.split('.').pop() ?? 'jpg'
    const path = `submissions/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage
      .from('book-photos')
      .upload(path, photo, { contentType: photo.type, upsert: false })
    if (error) throw new Error(`Photo upload failed: ${error.message}`)
    photoUrls.push(path)
  }

  // 2. Insert submission record
  const insertData: SubmissionInsert = {
    photo_urls: photoUrls,
    contact_preference: input.contact_preference,
    contact_value: input.contact_value.trim(),
    condition: input.condition,
    isbn: input.isbn?.trim() || null,
    notes: input.notes?.trim() || null,
  }
  const { data, error } = await supabase
    .from('submissions')
    .insert(insertData)
    .select('reference_number')
    .single()

  if (error) throw new Error(`Submission failed: ${error.message}`)
  if (!data) throw new Error('No data returned from submission')

  return { reference_number: data.reference_number }
}
