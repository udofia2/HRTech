import React from 'react'
import meloTelemetry from '../utils/meloTelemetry'

type Props = { 
  title: string 
  icon?: React.ReactNode 
}

export default function MeloComingSoonZone({ title, icon }: Props) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    meloTelemetry.track('coming_soon_click', { title })
    const email = window.prompt('We are scaling this feature. Enter your email to join the waitlist:')
    if (email) meloTelemetry.track('waitlist_signup', { title, email })
    alert('Thanks — we added you to the waitlist.')
  }

  return (
    <div
      onClick={handleClick}
      className="group relative flex min-h-[160px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[2rem] border border-brand-charcoal/10 bg-[#1e2229] p-6 text-card-bg transition-all duration-300 hover:-translate-y-1 hover:border-accent-emerald/20 hover:bg-[#252a33] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
    >

      <div className="flex items-center justify-between w-full">

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-charcoal border border-card-bg/5 text-status-gold shadow-sm group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        

        <span className="rounded-full bg-status-gold/10 border border-status-gold/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-status-gold shadow-sm group-hover:bg-status-gold/15 transition-colors">
          Coming Soon
        </span>
      </div>


      <div className="mt-6 w-full">
        <strong className="block text-[15px] font-semibold tracking-tight text-card-bg transition-colors group-hover:text-white">
          {title}
        </strong>
        <p className="mt-1.5 text-xs text-muted-sage opacity-75 group-hover:opacity-100 transition-opacity">
          Click to request early access & preview features.
        </p>
      </div>
    </div>
  )
}
