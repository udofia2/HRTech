"use client"

import React, { useEffect, useState } from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
}

export default function MeloModelSelector({ value, onChange }: Props) {
  const [models, setModels] = useState<string[]>(['gemini-2.5-flash'])

  useEffect(() => {
    let mounted = true
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        if (Array.isArray(data?.models) && data.models.length > 0) {
          setModels(data.models)
          if (!data.models.includes(value)) {
            onChange(data.models[0])
          }
        }
      })
      .catch(() => {
        // swallow: keep fallback
      })
    return () => {
      mounted = false
    }
  }, [onChange, value])

  return (
    <label className="grid gap-2 text-sm font-medium text-primary-text">
      <span>Model</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-brand-charcoal/10 bg-card-bg px-4 py-3 text-sm text-primary-text shadow-sm outline-none transition focus:border-accent-emerald focus:ring-2 focus:ring-accent-emerald/20"
      >
        {models.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </label>
  )
}
