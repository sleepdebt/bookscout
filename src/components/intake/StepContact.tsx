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
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
    <form onSubmit={handleSubmit(onComplete)} className="flex flex-col">

      {/* Hero image — bleeds to modal edges at top */}
      <div className="relative overflow-hidden">
        <img
          src="/hero_books.webp"
          alt="Stack of college textbooks"
          className="w-full object-cover h-52"
        />
        {/* Overlay with text */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/100 via-blue-900/75 to-blue-900/45 flex flex-col items-center justify-between px-6 pt-6 pb-5 text-center">
          {/* Book icon badge */}
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          {/* Bottom text */}
          <div>
          <p className="text-2xl font-bold text-white uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--font-poller-one)' }}>
            BookScout
          </p>
          <p className="text-sm text-blue-200/90 leading-snug mb-2">
            Get cash for your textbooks. Fast.
          </p>
          {/* Feature pills */}
          <div className="flex justify-center gap-2 flex-wrap">
            {['4-hr offers', 'Campus pickup', 'Venmo, Zelle & more'].map((label) => (
              <span key={label} className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium">
                {label}
              </span>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Form section */}
      <div className="px-6 pt-6 pb-2 space-y-4">
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

      <div className="px-6 pb-6 pt-2">
        <button
          type="submit"
          className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl text-base hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          Get Started
        </button>
      </div>

    </form>
    </div>
  )
}
