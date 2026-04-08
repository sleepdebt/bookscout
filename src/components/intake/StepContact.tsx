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

      {/* Hero card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-6 py-10 text-center">
        {/* Decorative background circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute top-8 right-10 w-10 h-10 rounded-full bg-white/10" />
        <div className="absolute bottom-10 left-10 w-6 h-6 rounded-full bg-white/10" />

        {/* Book icon badge */}
        <div className="relative flex justify-center mb-5">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        </div>

        {/* Brand + headline */}
        <p className="relative text-xs font-semibold text-blue-200 uppercase tracking-widest mb-2">
          BookScout
        </p>
        <h1 className="relative text-2xl font-bold text-white leading-snug mb-2">
          Get cash for your<br />textbooks. Fast.
        </h1>
        <p className="relative text-sm text-blue-100/80">
          No account needed — we come to you.
        </p>

        {/* Feature pills */}
        <div className="relative flex justify-center gap-2 mt-5 flex-wrap">
          {['4-hr offers', 'Campus pickup', 'Venmo, Zelle & more'].map((label) => (
            <span key={label} className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Form section */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-0.5">Where should we send your offer?</p>
          <p className="text-xs text-gray-400">We'll email you within 4 hours with an offer or a pass.</p>
        </div>

        <input type="hidden" {...register('contact_preference')} value="email" />

        <div>
          <input
            {...register('contact_value')}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@university.edu"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.contact_value && (
            <p className="text-sm text-red-600 mt-1.5">{errors.contact_value.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl text-base hover:bg-blue-700 active:bg-blue-800 transition-colors mt-auto"
      >
        Get Started
      </button>

    </form>
  )
}
