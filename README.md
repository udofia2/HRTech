# Melo Associates — Interview Plan Generator

Melo app that generates short, behavioral interview questions for target roles using a Gemini model.

![App screenshot](public/landing_page.png)

Quick start

```bash
# Install deps
npm install

# Run dev server
npm run dev

# Build
npm run build
```

Edit the UI at `app/page.tsx`. Serverless API routes live under `app/api/*`.

Files of interest

- `app/utils/geminiClient.ts` — Gemini client + parsing and tracing
- `app/page.tsx` — main UI and form handling
- `app/api/chat/route.ts` — POST endpoint that returns generated questions

Short, internal-friendly project — keep edits focused and incremental.
