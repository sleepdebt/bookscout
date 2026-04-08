'use client'

import { useState } from 'react'
import type { StepContactData } from '@/lib/validations'
import type { BookCondition } from '@/lib/supabase/types'

export type WizardStep = 1 | 2 | 3

export interface BookEntry {
  photos: File[]
  condition: BookCondition
  isbn: string
  notes: string
}

export interface WizardState {
  contact_preference: 'email'
  contact_value: string
  books: BookEntry[]
}

interface WizardShellProps {
  children: (props: {
    step: WizardStep
    state: WizardState
    onStep1Complete: (data: StepContactData) => void
    onStep2Complete: (books: BookEntry[]) => void
    onBack: () => void
  }) => React.ReactNode
}

const STEP_LABELS = ['Contact', 'Books', 'Review']

export function WizardShell({ children }: WizardShellProps) {
  const [step, setStep] = useState<WizardStep>(1)
  const [state, setState] = useState<WizardState>({
    contact_preference: 'email',
    contact_value: '',
    books: [],
  })

  function onStep1Complete(data: StepContactData) {
    setState((s) => ({
      ...s,
      contact_preference: data.contact_preference,
      contact_value: data.contact_value,
    }))
    setStep(2)
  }

  function onStep2Complete(books: BookEntry[]) {
    setState((s) => ({ ...s, books }))
    setStep(3)
  }

  function onBack() {
    setStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s))
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex gap-2 mb-3">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Step {step} of 3 — {STEP_LABELS[step - 1]}
        </p>
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 pb-8">
        {children({ step, state, onStep1Complete, onStep2Complete, onBack })}
      </div>
    </div>
  )
}
