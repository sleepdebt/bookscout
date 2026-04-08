'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stepContactSchema, type StepContactData } from '@/lib/validations'

interface StepContactProps {
  initialData: {
    contact_value: string
  }
  onComplete: (data: StepContactData) => void
}

export function StepContact({ initialData, onComplete }: StepContactProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StepContactData>({
    resolver: zodResolver(stepContactSchema),
    defaultValues: {
      contact_preference: 'email',
      contact_value: initialData.contact_value,
    },
  })

  return (
    <form onSubmit={handleSubmit(onComplete)} className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Where should we send your offer?</h1>
        <p className="text-sm text-gray-500">
          We'll email you within 4 hours with an offer or a pass.
        </p>
      </div>

      <input type="hidden" {...register('contact_preference')} value="email" />

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Email address</label>
        <input
          {...register('contact_value')}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.contact_value && (
          <p className="text-sm text-red-600 mt-1">{errors.contact_value.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl text-base mt-auto"
      >
        Continue
      </button>
    </form>
  )
}
