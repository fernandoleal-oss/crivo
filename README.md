# Crivo

Creative review and approval platform for advertising agencies. Replaces the chaos of WhatsApp approvals with a clean, traceable flow.

## Problem

Approval of creative pieces in agencies happens through WhatsApp, email, and voice messages — no one knows which version was approved, who approved it, or when. Crivo organizes this into a clean, auditable workflow.

## Features

- **Project management** — create and organize projects by client
- **Piece versioning** — upload multiple versions of any creative piece
- **Public review links** — share a passwordless link with clients for review
- **Pin comments** — click anywhere on an image to leave position-based feedback
- **Version comparison** — side-by-side diff of any two versions
- **Approval workflow** — approve or request revision, with full history
- **Real-time updates** — Supabase Realtime pushes status changes instantly
- **WhatsApp notifications** — n8n webhook sends approval/revision alerts via Evolution API

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend/DB/Storage:** Supabase (PostgreSQL + Storage + Realtime)
- **Notifications:** n8n webhook → WhatsApp (Evolution API)
- **Deploy:** Vercel + Supabase Cloud

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- n8n instance (optional, for WhatsApp notifications)

### Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/crivo-notify
```

### Database

Run the SQL migrations from `docs/` against your Supabase project to create the schema:

- `projects` — client projects
- `pieces` — creative pieces with status and public token
- `piece_versions` — versioned file uploads
- `comments` — position-based annotations per version

### n8n Notification Workflow

The `Crivo_Notify` workflow receives POST requests at `/webhook/crivo-notify` with:

```json
{
  "decision": "approved | revision_requested",
  "pieceName": "Banner Homepage",
  "projectName": "Acme Corp",
  "decidedBy": "João Silva",
  "feedback": "Please fix the typography",
  "ownerPhone": "5511999999999"
}
```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run test     # Run tests
npm run lint     # Lint
```

## Architecture

**Hybrid Server + Client Components (Next.js App Router):**

- **Server Components** — initial data fetch for projects, pieces, versions, comments (no loading flicker)
- **Client Components** — Realtime subscriptions, modals, file upload, pin comments
- **No authentication** — public review links use random tokens (nanoid, 10 chars)

## License

MIT
