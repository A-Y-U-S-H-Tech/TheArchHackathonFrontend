# FMCG Operations Copilot — Frontend

Next.js 14 (App Router) + TypeScript + Ant Design (dark theme) frontend for the FMCG Operations
Copilot backend (FastAPI monolith). Built for Vercel deployment.

## Roles supported

- **Customer (CUS)** — file complaints, track their own complaint history and resolution progress.
- **Customer Service Executive (CSE)** — view all complaints, run AI triage, manage tickets.
- **Supervisor (SUP)** — everything CSE can do, plus manage the product catalog and knowledge base
  documents that ground the RAG/triage agent.

The backend's `AMS/login` response (per the design doc) doesn't return a role, so the login screen
asks which role you're signing in as. This only controls which nav items/pages render client-side —
the backend's own auth/role checks on each endpoint remain the real security boundary.

## Configuring the backend connection

The app talks to your backend entirely through environment variables — no URLs are hardcoded.

Copy `.env.local.example` to `.env.local` for local development:

```bash
cp .env.local.example .env.local
```

Then set either:

**Option A — host + port (most common):**
```
NEXT_PUBLIC_API_PROTOCOL=http
NEXT_PUBLIC_API_HOST=127.0.0.1
NEXT_PUBLIC_API_PORT=8000
```

**Option B — a full base URL** (overrides A entirely, useful once you have a real domain/HTTPS):
```
NEXT_PUBLIC_API_BASE_URL=https://api.yourbackend.com
```

These are `NEXT_PUBLIC_*` variables, which Next.js inlines into the JS bundle at **build time**.
That means:
- Changing them requires a rebuild (just re-running `npm run build`, or redeploying on Vercel).
- They're visible in client-side code — fine here since they're just a host/port, not a secret.

## Local development

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Deploying to Vercel

1. Push this project to a Git repo (GitHub/GitLab/Bitbucket).
2. Import the repo in Vercel ("Add New Project").
3. In **Project Settings → Environment Variables**, add `NEXT_PUBLIC_API_HOST`,
   `NEXT_PUBLIC_API_PORT`, `NEXT_PUBLIC_API_PROTOCOL` (or `NEXT_PUBLIC_API_BASE_URL`) for the
   Production (and Preview, if you want) environment.
4. Deploy. Vercel auto-detects Next.js — no extra build config needed.

### CORS note

Since the frontend (on a Vercel domain) and backend (on your own IP/host) are different origins,
your FastAPI backend needs CORS configured to allow the Vercel domain, with
`allow_credentials=True`, since this frontend sends the auth cookie via `credentials: "include"`
on every request.

### Mixed content note

If your Vercel deployment is served over HTTPS (it always is) and your backend is plain HTTP,
browsers will block the requests as mixed content. Either put the backend behind HTTPS (e.g. via a
reverse proxy or tunnel like ngrok/Cloudflare Tunnel for a hackathon demo), or run the frontend
locally over HTTP during the demo.

## Project structure

```
src/
  app/                  Next.js App Router pages
    login/
    signup/
    dashboard/
    complaints/
      [id]/
      new/
    tickets/
      [id]/
    knowledge/
    products/
  components/           Shared UI: AppShell, ProtectedPage, PipelineRail, AgentTrace, tags
  context/              AuthContext (session state)
  lib/
    api/                One module per backend system (ams, cms, pms, pkms, tgs, misc)
    apiClient.ts         fetch wrapper (cookie auth, error normalization)
    config.ts            env-var -> base URL resolution
    theme.ts              Ant Design theme tokens
  types/                 Shared TS types mirroring backend entities

```

## Design notes

- Dark, bold SaaS aesthetic: near-black base (`#0B0E14`), teal-green accent (`#00D4B8`) signaling
  "quality/verified," coral (`#FF6B5B`) for high severity.
- A **pipeline rail** component visualizes each complaint's progress through the backend's own
  agent steps (Received → Retrieval → Triage → Ticket → Resolved).
- An **agent trace** panel renders CTAS triage output in a terminal/log style, making the AI's
  reasoning inspectable rather than a black box.
# TheArchHackathonFrontend
