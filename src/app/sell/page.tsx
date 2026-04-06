'use client'

import { WizardShell } from '@/components/intake/WizardShell'
import { StepPhotos } from '@/components/intake/StepPhotos'
import { StepContact } from '@/components/intake/StepContact'
import { StepReview } from '@/components/intake/StepReview'

export default function SellPage() {
  return (
    <WizardShell>
      {({ step, state, onStep1Complete, onStep2Complete, onStep3Complete, onBack }) => {
        if (step === 1) {
          return (
            <StepPhotos
              initialPhotos={state.photos}
              onComplete={onStep1Complete}
            />
          )
        }
        if (step === 2) {
          return (
            <StepContact
              initialData={{
                contact_preference: state.contact_preference,
                contact_value: state.contact_value,
                condition: state.condition,
              }}
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
