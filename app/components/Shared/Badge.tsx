import React from 'react'

type Props = { children: React.ReactNode }

export default function Badge({ children }: Props) {
  return (
    <span className="inline-flex items-center rounded-full bg-status-gold/10 px-3 py-1 text-xs font-semibold tracking-wide text-status-gold">
      {children}
    </span>
  )
}
