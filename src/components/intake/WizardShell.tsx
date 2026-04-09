'use client'

import { useState } from 'react'
import type { StepContactData } from '@/lib/validations'
import type { BookCondition } from '@/lib/supabase/types'

// Pixel-art books — each one independently placed & rotated for a scattered feel
const PIXEL_BOOKS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="200" opacity="0.09">

  <!-- 1. Closed book (rose), -10deg -->
  <g transform="translate(5 8) rotate(-10 8 12)">
    <rect x="0" y="0" width="16" height="24" fill="#3d1a14"/>
    <rect x="2" y="2" width="12" height="20" fill="#c4857a"/>
    <rect x="12" y="2" width="2" height="20" fill="#f2e4d0"/>
    <rect x="2" y="6" width="10" height="4" fill="#a06050"/>
    <rect x="4" y="18" width="6" height="2" fill="#a06050"/>
  </g>

  <!-- 2. Open book flat, +7deg -->
  <g transform="translate(50 5) rotate(7 19 9)">
    <rect x="0" y="0" width="38" height="18" fill="#3d1a14"/>
    <rect x="2" y="2" width="15" height="14" fill="#f2e4d0"/>
    <rect x="4" y="4" width="11" height="1" fill="#ddc5ae"/>
    <rect x="4" y="6" width="11" height="1" fill="#ddc5ae"/>
    <rect x="4" y="8" width="9" height="1" fill="#ddc5ae"/>
    <rect x="4" y="10" width="11" height="1" fill="#ddc5ae"/>
    <rect x="4" y="12" width="7" height="1" fill="#ddc5ae"/>
    <rect x="17" y="0" width="4" height="18" fill="#8a4a44"/>
    <rect x="21" y="2" width="15" height="14" fill="#f2e4d0"/>
    <rect x="23" y="4" width="11" height="1" fill="#ddc5ae"/>
    <rect x="23" y="6" width="11" height="1" fill="#ddc5ae"/>
    <rect x="23" y="8" width="9" height="1" fill="#ddc5ae"/>
    <rect x="23" y="10" width="11" height="1" fill="#ddc5ae"/>
    <rect x="23" y="12" width="7" height="1" fill="#ddc5ae"/>
    <rect x="0" y="16" width="38" height="2" fill="#8a4a44"/>
  </g>

  <!-- 3. Closed thin (green), -6deg -->
  <g transform="translate(150 10) rotate(-6 5 11)">
    <rect x="0" y="0" width="10" height="22" fill="#3d1a14"/>
    <rect x="2" y="2" width="6" height="18" fill="#8aaa90"/>
    <rect x="6" y="2" width="2" height="18" fill="#f2e4d0"/>
    <rect x="2" y="5" width="4" height="3" fill="#6a8a70"/>
  </g>

  <!-- 4. Stack of 3, +3deg -->
  <g transform="translate(182 3) rotate(3 22 11)">
    <rect x="0" y="16" width="44" height="5" fill="#3d1a14"/>
    <rect x="2" y="17" width="40" height="2" fill="#c4857a"/>
    <rect x="2" y="19" width="40" height="1" fill="#a06050"/>
    <rect x="0" y="20" width="44" height="1" fill="#3d1a14"/>
    <rect x="2" y="10" width="40" height="6" fill="#3d1a14"/>
    <rect x="4" y="11" width="36" height="2" fill="#9b8ea0"/>
    <rect x="4" y="13" width="36" height="2" fill="#7a6e80"/>
    <rect x="2" y="15" width="40" height="1" fill="#3d1a14"/>
    <rect x="4" y="4" width="36" height="6" fill="#3d1a14"/>
    <rect x="6" y="5" width="32" height="2" fill="#8aaa90"/>
    <rect x="6" y="7" width="32" height="2" fill="#6a8a70"/>
    <rect x="4" y="9" width="36" height="1" fill="#3d1a14"/>
  </g>

  <!-- 5. Closed book (purple), +14deg, far right -->
  <g transform="translate(255 14) rotate(14 8 12)">
    <rect x="0" y="0" width="16" height="24" fill="#3d1a14"/>
    <rect x="2" y="2" width="12" height="20" fill="#9b8ea0"/>
    <rect x="12" y="2" width="2" height="20" fill="#f2e4d0"/>
    <rect x="2" y="6" width="10" height="4" fill="#7a6e80"/>
    <rect x="4" y="18" width="6" height="2" fill="#7a6e80"/>
  </g>

  <!-- 6. Open book upright/front, +9deg -->
  <g transform="translate(8 100) rotate(9 17 13)">
    <rect x="0" y="2" width="15" height="22" fill="#3d1a14"/>
    <rect x="2" y="4" width="11" height="18" fill="#f2e4d0"/>
    <rect x="4" y="6" width="7" height="1" fill="#ddc5ae"/>
    <rect x="4" y="8" width="7" height="1" fill="#ddc5ae"/>
    <rect x="4" y="10" width="5" height="1" fill="#ddc5ae"/>
    <rect x="4" y="12" width="7" height="1" fill="#ddc5ae"/>
    <rect x="4" y="14" width="7" height="1" fill="#ddc5ae"/>
    <rect x="4" y="16" width="5" height="1" fill="#ddc5ae"/>
    <rect x="4" y="18" width="7" height="1" fill="#ddc5ae"/>
    <rect x="15" y="0" width="4" height="26" fill="#8a4a44"/>
    <rect x="19" y="2" width="15" height="22" fill="#3d1a14"/>
    <rect x="21" y="4" width="11" height="18" fill="#f2e4d0"/>
    <rect x="23" y="6" width="7" height="1" fill="#ddc5ae"/>
    <rect x="23" y="8" width="7" height="1" fill="#ddc5ae"/>
    <rect x="23" y="10" width="5" height="1" fill="#ddc5ae"/>
    <rect x="23" y="12" width="7" height="1" fill="#ddc5ae"/>
    <rect x="23" y="14" width="7" height="1" fill="#ddc5ae"/>
    <rect x="23" y="16" width="5" height="1" fill="#ddc5ae"/>
    <rect x="23" y="18" width="7" height="1" fill="#ddc5ae"/>
    <rect x="0" y="22" width="34" height="4" fill="#3d1a14"/>
    <rect x="2" y="23" width="30" height="2" fill="#c4857a"/>
  </g>

  <!-- 7. Closed thin (orange), -16deg -->
  <g transform="translate(82 122) rotate(-16 5 11)">
    <rect x="0" y="0" width="10" height="22" fill="#3d1a14"/>
    <rect x="2" y="2" width="6" height="18" fill="#e0a870"/>
    <rect x="6" y="2" width="2" height="18" fill="#f2e4d0"/>
    <rect x="2" y="5" width="4" height="3" fill="#c08050"/>
  </g>

  <!-- 8. Open book flat, -6deg -->
  <g transform="translate(118 104) rotate(-6 19 9)">
    <rect x="0" y="0" width="38" height="18" fill="#3d1a14"/>
    <rect x="2" y="2" width="15" height="14" fill="#f2e4d0"/>
    <rect x="4" y="4" width="11" height="1" fill="#ddc5ae"/>
    <rect x="4" y="6" width="11" height="1" fill="#ddc5ae"/>
    <rect x="4" y="8" width="9" height="1" fill="#ddc5ae"/>
    <rect x="4" y="10" width="11" height="1" fill="#ddc5ae"/>
    <rect x="4" y="12" width="7" height="1" fill="#ddc5ae"/>
    <rect x="17" y="0" width="4" height="18" fill="#8a4a44"/>
    <rect x="21" y="2" width="15" height="14" fill="#f2e4d0"/>
    <rect x="23" y="4" width="11" height="1" fill="#ddc5ae"/>
    <rect x="23" y="6" width="11" height="1" fill="#ddc5ae"/>
    <rect x="23" y="8" width="9" height="1" fill="#ddc5ae"/>
    <rect x="23" y="10" width="11" height="1" fill="#ddc5ae"/>
    <rect x="23" y="12" width="7" height="1" fill="#ddc5ae"/>
    <rect x="0" y="16" width="38" height="2" fill="#8a4a44"/>
  </g>

  <!-- 9. Closed book (blue), +12deg -->
  <g transform="translate(210 112) rotate(12 8 12)">
    <rect x="0" y="0" width="16" height="24" fill="#3d1a14"/>
    <rect x="2" y="2" width="12" height="20" fill="#8a8ae0"/>
    <rect x="12" y="2" width="2" height="20" fill="#f2e4d0"/>
    <rect x="2" y="6" width="10" height="4" fill="#6a6ac0"/>
    <rect x="4" y="18" width="6" height="2" fill="#6a6ac0"/>
  </g>

  <!-- 10. Stack of 3 (blue/orange/rose), -4deg, far right -->
  <g transform="translate(252 106) rotate(-4 22 11)">
    <rect x="0" y="16" width="44" height="5" fill="#3d1a14"/>
    <rect x="2" y="17" width="40" height="2" fill="#8a8ae0"/>
    <rect x="2" y="19" width="40" height="1" fill="#6a6ac0"/>
    <rect x="0" y="20" width="44" height="1" fill="#3d1a14"/>
    <rect x="2" y="10" width="40" height="6" fill="#3d1a14"/>
    <rect x="4" y="11" width="36" height="2" fill="#e0a870"/>
    <rect x="4" y="13" width="36" height="2" fill="#c08050"/>
    <rect x="2" y="15" width="40" height="1" fill="#3d1a14"/>
    <rect x="4" y="4" width="36" height="6" fill="#3d1a14"/>
    <rect x="6" y="5" width="32" height="2" fill="#c4857a"/>
    <rect x="6" y="7" width="32" height="2" fill="#a06050"/>
    <rect x="4" y="9" width="36" height="1" fill="#3d1a14"/>
  </g>

</svg>`

export const pixelBgStyle: React.CSSProperties = {
  backgroundColor: '#faf8f6',
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(PIXEL_BOOKS_SVG)}")`,
  backgroundRepeat: 'repeat',
  backgroundSize: '280px 200px',
}

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

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={pixelBgStyle}>
        <div className="w-full max-w-lg px-4 py-8 flex flex-col items-center gap-6">
          {children({ step, state, onStep1Complete, onStep2Complete, onBack })}
          <img src="/ohio_made.webp" alt="Ohio Made" className="h-10 opacity-30" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={pixelBgStyle}>
      <div className="w-full max-w-lg px-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4">
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

          <div className="px-6 pb-6">
            {children({ step, state, onStep1Complete, onStep2Complete, onBack })}
          </div>
        </div>
      </div>
    </div>
  )
}
