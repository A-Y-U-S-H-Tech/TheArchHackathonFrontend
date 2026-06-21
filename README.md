# FMCG Operations Copilot — Frontend

Next.js 14 (App Router) + TypeScript + Ant Design (dark theme) frontend for the FMCG Operations
Copilot backend (FastAPI monolith). Built for Vercel deployment, designed for a hackathon demo.

## What this is

An AI-assisted complaint-handling system for an FMCG (consumer packaged goods) business. Customers
file complaints about products; an AI triage agent reasons through the complaint against SOPs and
past cases, classifies severity, and drafts a ticket; staff review the AI's reasoning, accept or
edit the ticket, route it to a department, and close the loop back to the customer.

## Roles

- **Customer (CUS)** — files complaints, tracks pipeline progress, sees a "Final Update" once staff
  close out the case.
- **Customer Service Executive (CSE)** — views all complaints, runs AI triage, creates/manages
  tickets, updates complaint status.
- **Supervisor (SUP)** — everything CSE can do, plus manages the product catalog, the knowledge
  base that grounds the AI, and Customer Service Executive accounts.

The backend's `AMS/login` response doesn't return a role (per the design doc), so the login screen
asks which role you're signing in as. This only controls which nav items render client-side — the
backend's own auth/role checks on each endpoint remain the real security boundary.

## Demo flow (suggested order for judges)

1. **Sign up** as a Customer, **file a complaint** against a product (`/complaints/new`).
2. **Log in as a Supervisor**, create a Service Executive account (`/accounts`).
3. **Log in as that Service Executive**, open the complaint, **Run AI Triage** — watch the
   ChatGPT/Claude-style "thinking" animation, then expand the collapsed reasoning trace to see each
   tool call the agent made.
4. **Accept or edit** the AI's suggested ticket, optionally mark it **Internal Only**, and create it.
5. **Update the complaint status** (Update Status button) — this is what signals "staff have made a
   final call on this complaint."
6. **Switch back to the Customer** — the complaint now shows a **Final Update** card surfacing the
   last ticket's outcome, instead of raw operational ticket data.
7. As Supervisor, check `/products`, `/knowledge`, and `/dashboard` for the rest of the surface area.

## Key design touches

- Dark, bold SaaS aesthetic: near-black base (`#0B0E14`), teal-green accent (`#00D4B8`) signaling
  "quality/verified," coral (`#FF6B5B`) for high severity.
- A **pipeline rail** (customer-only) visualizes complaint progress through the backend's own agent
  steps (Received → Retrieval → Triage → Ticket → Resolved).
- A **thinking panel** mimics Claude/ChatGPT's reasoning UX: an animated "Thinking…" state while
  triage runs, collapsing into an expandable step-by-step trace once it completes.
- A **suggested ticket panel** lets staff accept the AI's ticket as-is or edit fields before sending,
  with an always-available Internal Only toggle.
- Fully responsive: off-canvas drawer nav on mobile, scrollable/column-hiding tables, modals capped
  to viewport width.

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
Changing them requires a rebuild (or a redeploy on Vercel).

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

## Known gaps (by design, not oversight)

- **No account directory**: the backend doesn't expose a "list all users" endpoint, so
  `/accounts` (Supervisor account management) is username-driven rather than browsed from a table.
- **No account deletion**: the system overview lists "Delete" as a conceptual AMS capability, but
  no route is documented for it — the UI shows this control disabled with an explanatory tooltip
  rather than calling an endpoint that doesn't exist.
- **Role isn't returned by login**: handled via a role selector at sign-in (see Roles above).

## Project structure

```
src/
  app/                  Next.js App Router pages
    login/
    signup/
    account/             Self-service account settings (all roles)
    accounts/            Supervisor-only account management (create/manage CSE accounts)
    dashboard/
    complaints/
      [id]/                Status updates, AI triage, ticket creation, final update reveal
      new/
    tickets/
      [id]/
    knowledge/
    products/
  components/           Shared UI: AppShell, ProtectedPage, PipelineRail, ThinkingTrace,
                         SuggestedTicketPanel, tags, state banners
  context/              AuthContext (session state)
  lib/
    api/                One module per backend system (ams, cms, pms, pkms, tgs, misc)
    apiClient.ts          fetch wrapper (cookie auth, error normalization)
    config.ts              env-var -> base URL resolution
    theme.ts                Ant Design theme tokens
  types/                 Shared TS types mirroring backend entities
```
