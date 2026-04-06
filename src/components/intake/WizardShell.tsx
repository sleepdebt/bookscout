'use client'

import { useState } from 'react'
import type { StepPhotosData, StepContactData, StepReviewData } from '@/lib/validations'

export type WizardStep = 1 | 2 | 3

export interface WizardState {
  photos: File[]
  contact_preference: 'sms' | 'email'
  contact_value: string
  condition: 'like_new' | 'good' | 'acceptable' | 'poor' | ''
  isbn: string
  notes: string
}

interface WizardShellProps {
  children: (props: {
    step: WizardStep
    state: WizardState
    onStep1Complete: (data: StepPhotosData) => void
    onStep2Complete: (data: StepContactData) => void
    onStep3Complete: (data: StepReviewData) => void
    onBack: () => void
  }) => React.ReactNode
}

const STEP_LABELS = ['Photos', 'Contact', 'Review']

export function WizardShell({ children }: WizardShellProps) {
  const [step, setStep] = useState<WizardStep>(1)
  const [state, setState] = useState<WizardState>({
    photos: [],
    contact_preference: 'sms',
    contact_value: '',
    condition: '',
    isbn: '',
    notes: '',
  })

  function onStep1Complete(data: StepPhotosData) {
    setState((s) => ({ ...s, photos: data.photos }))
    setStep(2)
  }

  function onStep2Complete(data: StepContactData) {
    setState((s) => ({
      ...s,
      contact_preference: data.contact_preference,
      contact_value: data.contact_value,
      condition: data.condition,
    }))
    setStep(3)
  }

  function onStep3Complete(data: StepReviewData) {
    setState((s) => ({
      ...s,
      isbn: data.isbn ?? '',
      notes: data.notes ?? '',
    }))
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
        {children({ step, state, onStep1Complete, onStep2Complete, onStep3Complete, onBack })}
      </div>
    </div>
  )
}
