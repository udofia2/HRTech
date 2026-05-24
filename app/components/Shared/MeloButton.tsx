import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }

export default function MeloButton({ children, variant = 'primary', ...rest }: Props) {
  const className =
    variant === 'primary'
      ? 'inline-flex items-center justify-center rounded-full bg-accent-emerald px-5 py-3 text-sm font-semibold text-card-bg shadow-[0_12px_30px_rgba(16,185,129,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-accent-emerald/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
      : 'inline-flex items-center justify-center rounded-full border border-brand-charcoal/10 bg-card-bg px-5 py-3 text-sm font-semibold text-primary-text shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-charcoal/20 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'

  return (
    <button className={className} {...rest}>
      {children}
    </button>
  )
}
