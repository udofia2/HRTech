"use client"

import React, { useState } from 'react'
import { Sliders, Video, Users } from 'lucide-react'
import MeloModelSelector from './components/MeloModelSelector'
import MeloButton from './components/Shared/MeloButton'
import {
  COMPANY_NAME,
  FILL_RATE,
  NETWORK_SIZE,
  SUBMISSIONS_PER_HIRE,
} from '../lib/melo/constants'
import MeloComingSoonZone from './components/MeloComingSoonZone'

export default function Page() {
  const [model, setModel] = useState('gemini-2.5-flash')
  const [prompt, setPrompt] = useState('')
  const [promptError, setPromptError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasPromptError = Boolean(promptError)
  const hasQuestions = questions !== null
  const showSidebar = hasQuestions || error !== null || hasPromptError
  const showGeneratedContent = hasQuestions && error === null
  const isQuotaError = Boolean(error && /429|RESOURCE_EXHAUSTED|quota/i.test(error))

  React.useEffect(() => {
    const text = 'Customer Success Manager'
    let index = 0
    const interval = setInterval(() => {
      setPrompt((prev) => prev + text.charAt(index))
      index++
      if (index >= text.length) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [])

  async function handleSubmit(e?: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e?.preventDefault()

    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      setPromptError('Please enter the target candidate role.')
      setError('Missing prompt')
      setQuestions(null)
      return
    }

    setLoading(true)
    setError(null)
    setPromptError(null)
    setQuestions(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: trimmedPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Request failed')
      setQuestions(data.questions || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      if (/missing prompt/i.test(message)) {
        setPromptError('Please enter the target candidate role.')
        setError('Missing prompt')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className={showSidebar ? 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_415px]' : 'grid gap-8'}>
          <section className="overflow-hidden rounded-[2rem] border border-brand-charcoal/10 bg-card-bg shadow-[0_18px_50px_rgba(30,34,41,0.08)]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-8">
                <div className="space-y-5">
                  <div className="inline-flex items-center rounded-full border border-accent-emerald/20 bg-accent-emerald/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent-emerald">
                    {COMPANY_NAME}
                  </div>
                  <div className="space-y-4">
                    <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-primary-text sm:text-5xl">
                      High-signal interview plans for revenue and customer-growth teams.
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-muted-sage">
                      Trusted by high-growth technology companies, {COMPANY_NAME} helps you generate focused, behavioral interview questions tailored to roles that protect and grow revenue. Enter a target role to get started.
                    </p>
                    <div className="grid gap-3 pt-2 sm:grid-cols-3">
                      <div className="rounded-2xl border border-brand-charcoal/10 bg-background px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-sage">Network</p>
                        <p className="mt-1 text-sm font-semibold text-primary-text">{NETWORK_SIZE.toLocaleString()}+ professionals</p>
                      </div>
                      <div className="rounded-2xl border border-brand-charcoal/10 bg-background px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-sage">Fill rate</p>
                        <p className="mt-1 text-sm font-semibold text-primary-text">{Math.round(FILL_RATE * 100)}% average</p>
                      </div>
                      <div className="rounded-2xl border border-brand-charcoal/10 bg-background px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-sage">Submissions</p>
                        <p className="mt-1 text-sm font-semibold text-primary-text">{SUBMISSIONS_PER_HIRE} per hire</p>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.5rem] border border-brand-charcoal/10 bg-background p-4 sm:p-5">
                  <MeloModelSelector value={model} onChange={setModel} />

                  <label className="grid gap-2 text-sm font-medium text-primary-text">
                    <span>Target Candidate Role</span>
                    <input
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value)
                        if (promptError && e.target.value.trim()) {
                          setPromptError(null)
                        }
                      }}
                      aria-invalid={hasPromptError}
                      aria-describedby={hasPromptError ? 'candidate-role-error' : undefined}
                      className={`w-full rounded-2xl border bg-card-bg px-4 py-3 text-sm text-primary-text shadow-sm outline-none transition placeholder:text-muted-sage ${
                        hasPromptError
                          ? 'border-red-500 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/30'
                          : 'border-brand-charcoal/10 focus:border-accent-emerald focus:ring-2 focus:ring-accent-emerald/20'
                      }`}
                      placeholder='Customer Success Manager'
                    />
                    {hasPromptError && (
                      <span id="candidate-role-error" className="text-xs font-medium text-red-600">
                        {promptError}
                      </span>
                    )}
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <MeloButton type="submit" disabled={loading}>
                      {loading ? 'Analyzing Talent Requirements...' : 'Generate Interview Plan'}
                    </MeloButton>
                    <MeloButton
                      type="button"
                      onClick={() => {
                        setPrompt('')
                        setPromptError(null)
                        setError(null)
                        setQuestions(null)
                      }}
                      variant="secondary"
                    >
                      Reset
                    </MeloButton>
                  </div>
                </form>
              </div>
            </div>
          </section>

          {showSidebar && (
            <aside className="self-start rounded-[1.5rem] border border-brand-charcoal/10 bg-brand-charcoal p-6 text-card-bg shadow-[0_24px_60px_rgba(30,34,41,0.18)] sm:p-8 lg:sticky lg:top-8">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-status-gold">
                    Evaluation Blueprint
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                    High-Signal Interview Vectors
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-6 text-card-bg/80">
                    These questions are meticulously engineered to bypass rehearsed buzzwords and pinpoint cross-functional capability, leadership potential, and deep execution skills.
                  </p>
                </div>

                {isQuotaError && (
                  <div className="rounded-2xl border border-accent-emerald/20 bg-accent-emerald/10 px-4 py-3 text-sm leading-6 text-card-bg">
                    This model hit its quota. Please switch to a different model and try again.
                  </div>
                )}

                {error && (
                  <div className="max-w-full overflow-hidden rounded-2xl border border-status-gold/20 bg-status-gold/10 px-4 py-3 text-sm leading-6 text-status-gold [overflow-wrap:anywhere]">
                    Error: {error}
                  </div>
                )}

                {showGeneratedContent && (
                  <>
                    <section className="rounded-2xl border border-card-bg/10 bg-card-bg/5 p-4 text-card-bg">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-status-gold">
                        Core Evaluation Checklist
                      </h3>
                      <ol className="mt-4 space-y-3 text-sm leading-6 text-card-bg/90">
                        {questions.map((q, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-emerald/15 text-xs font-semibold text-accent-emerald">
                              {i + 1}
                            </span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ol>
                    </section>

                    <section className="rounded-3xl border border-card-bg/10 bg-card-bg/5 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <label className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.1em] text-status-gold">
                          Candidate Responses
                        </label>
                        <span className="relative flex items-center gap-1.5 whitespace-nowrap rounded-full border border-status-gold/20 bg-status-gold/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-status-gold">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                          Coming Soon
                        </span>
                      </div>
                      <textarea
                        disabled
                        placeholder="Type your response here"
                        className="mt-4 min-h-10 w-full resize-none rounded-3xl border border-card-bg/10 bg-brand-charcoal/50 px-4 py-4 text-sm leading-6 text-card-bg/60 outline-none placeholder:text-card-bg/35"
                      />
                    </section>
                  </>
                )}
              </div>
            </aside>
          )}
        </div>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-sage">
                Platform & Services
              </p>
              <h3 className="mt-2 text-xl font-semibold text-primary-text">
                Tools and services to accelerate hiring for revenue teams.
              </h3>
            </div>
          </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MeloComingSoonZone title="AI Scoring & Calibration" icon={<Sliders className="h-5 w-5 text-status-gold" />} />
          <MeloComingSoonZone title="Live Video Interview with Melo AI" icon={<Video className="h-5 w-5 text-status-gold" />} />
          <MeloComingSoonZone title="Custom Persona Testing" icon={<Users className="h-5 w-5 text-status-gold" />} />
        </div>
        </section>
        <div className="mt-6 flex items-center gap-3">
          <a href="https://meloassociates.com/about-us/" className="text-sm font-medium text-accent-emerald hover:underline">
            Learn more about {COMPANY_NAME}
          </a>
          <a href="https://meloassociates.com/job-search/#coaching" className="ml-4 rounded-full bg-accent-emerald/10 px-4 py-2 text-sm font-semibold text-accent-emerald hover:bg-accent-emerald/20">
            Schedule an introductory call
          </a>
        </div>
      </div>
    </main>
  )
}
