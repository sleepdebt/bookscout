'use client'

import { WizardShell } from '@/components/intake/WizardShell'
import { StepContact } from '@/components/intake/StepContact'
import { StepBooks } from '@/components/intake/StepBooks'
import { StepReview } from '@/components/intake/StepReview'

export default function SellPage() {
  return (
    <WizardShell>
      {({ step, state, onStep1Complete, onStep2Complete, onBack }) => {
        if (step === 1) {
          return (
            <StepContact
              initialData={{ contact_value: state.contact_value }}
              onComplete={onStep1Complete}
            />
          )
        }
        if (step === 2) {
          return (
            <StepBooks
              initialBooks={state.books}
              onComplete={onStep2Complete}
              onBack={onBack}
            />
          )
        }
        return (
          <StepReview
            state={state}
            onBack={onBack}
          />
        )
      }}
    </WizardShell>
  )
}
