'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stepContactSchema, type StepContactData } from '@/lib/validations'

interface StepContactProps {
  initialData: {
    contact_preference: 'sms' | 'email'
    contact_value: string
    condition: 'like_new' | 'good' | 'acceptable' | 'poor' | ''
  }
  onComplete: (data: StepContactData) => void
  onBack: () => void
}

const CONDITIONS = [
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'acceptable', label: 'Acceptable' },
  { value: 'poor', label: 'Poor' },
] as const

export function StepContact({ initialData, onComplete, onBack }: StepContactProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<StepContactData>({
    resolver: zodResolver(stepContactSchema),
    defaultValues: {
      contact_preference: initialData.contact_preference,
      contact_value: initialData.contact_value,
      condition: initialData.condition as 'like_new' | 'good' | 'acceptable' | 'poor',
    },
  })

  const contactPreference = watch('contact_preference')

  return (
    <form onSubmit={handleSubmit(onComplete)} className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">How to reach you</h1>
        <p className="text-sm text-gray-500">
          We'll send your offer or pass to this contact within 4 hours.
        </p>
      </div>

      {/* Contact preference toggle */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Preferred contact</p>
        <Controller
          name="contact_preference"
          control={control}
          render={({ field }) => (
            <div className="flex gap-3">
              {(['sms', 'email'] as const).map((pref) => (
                <label
                  key={pref}
                  className={`flex-1 py-3 text-center rounded-xl border-2 cursor-pointer font-medium text-sm transition-colors ${
                    field.value === pref
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    value={pref}
                    checked={field.value === pref}
                    onChange={() => field.onChange(pref)}
                    className="sr-only"
                  />
                  {pref === 'sms' ? '💬 Text' : '✉️ Email'}
                </label>
              ))}
            </div>
          )}
        />
      </div>

      {/* Conditional contact field */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          {contactPreference === 'sms' ? 'Phone number' : 'Email address'}
        </label>
        <input
          {...register('contact_value')}
          type={contactPreference === 'sms' ? 'tel' : 'email'}
          inputMode={contactPreference === 'sms' ? 'tel' : 'email'}
          autoComplete={contactPreference === 'sms' ? 'tel' : 'email'}
          placeholder={contactPreference === 'sms' ? '(614) 555-0123' : 'you@example.com'}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.contact_value && (
          <p className="text-sm text-red-600 mt-1">{errors.contact_value.message}</p>
        )}
      </div>

      {/* Condition */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Book condition</label>
        <select
          {...register('condition')}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select condition...</option>
          {CONDITIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {errors.condition && (
          <p className="text-sm text-red-600 mt-1">{errors.condition.message}</p>
        )}
      </div>

      <div className="flex gap-3 mt-auto">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl text-base"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-4 bg-blue-600 text-white font-semibold rounded-xl text-base"
        >
          Continue
        </button>
      </div>
    </form>
  )
}
