import { z } from 'zod'

export const stepPhotosSchema = z.object({
  photos: z
    .array(z.instanceof(File))
    .min(1, 'At least one photo is required')
    .max(3, 'Maximum 3 photos allowed'),
})

export const stepContactSchema = z.object({
  contact_preference: z.literal('email'),
  contact_value: z.string().email('Enter a valid email address'),
})

export const bookEntrySchema = z.object({
  photos: z
    .array(z.instanceof(File))
    .min(1, 'At least one photo is required')
    .max(3, 'Maximum 3 photos allowed'),
  condition: z.enum(['like_new', 'good', 'acceptable', 'poor'], {
    error: () => ({ message: 'Please select a condition' }),
  }),
  isbn: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{9}[\dX]$|^\d{13}$/.test(val), {
      message: 'ISBN must be 10 or 13 digits',
    }),
  notes: z
    .string()
    .max(200, 'Notes must be 200 characters or fewer')
    .optional(),
})

export const stepReviewSchema = z.object({
  isbn: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{9}[\dX]$|^\d{13}$/.test(val), {
      message: 'ISBN must be 10 or 13 digits',
    }),
  notes: z
    .string()
    .max(200, 'Notes must be 200 characters or fewer')
    .optional(),
})

export type StepPhotosData = z.infer<typeof stepPhotosSchema>
export type StepContactData = z.infer<typeof stepContactSchema>
export type StepReviewData = z.infer<typeof stepReviewSchema>
export type BookEntryData = z.infer<typeof bookEntrySchema>
