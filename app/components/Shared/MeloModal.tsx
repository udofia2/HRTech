import React from 'react'
import MeloButton from './MeloButton'

type Props = {
  open: boolean
  title?: string
  onClose: () => void
  children?: React.ReactNode
}

export default function MeloModal({ open, title, onClose, children }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-brand-charcoal/10 bg-card-bg p-6 shadow-[0_24px_60px_rgba(30,34,41,0.18)]">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-primary-text">{title}</h3>
          <MeloButton type="button" variant="secondary" onClick={onClose} aria-label="Close">
            ✕
          </MeloButton>
        </div>
        <div className="mt-4 text-sm leading-6 text-muted-sage">{children}</div>
      </div>
    </div>
  )
}
