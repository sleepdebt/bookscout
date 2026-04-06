import { Suspense } from 'react'
import { ConfirmationContent } from './ConfirmationContent'

export const metadata = {
  title: 'Submitted — BookScout',
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}
