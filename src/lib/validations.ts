import { z } from 'zod'

export const stepPhotosSchema = z.object({
  photos: z
    .array(z.instanceof(File))
    .min(1, 'At least one photo is required')
    .max(3, 'Maximum 3 photos allowed'),
})

export const stepContactSchema = z.object({
  contact_preference: z.enum(['sms', 'email']),
  contact_value: z.string().min(1, 'This field is required'),
  condition: z.enum(['like_new', 'good', 'acceptable', 'poor'], {
    error: () => ({ message: 'Please select a condition' }),
  }),
}).superRefine((data, ctx) => {
  if (data.contact_preference === 'sms') {
    if (!/^\d{10}$/.test(data.contact_value.replace(/\D/g, ''))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid 10-digit US phone number',
        path: ['contact_value'],
      })
    }
  } else {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid email address',
        path: ['contact_value'],
      })
    }
  }
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
