# ClosePilot - AI-Powered Ad Agency CRM

A production-grade CRM built specifically for advertising agencies. Manage your pipeline, track campaigns, and close deals faster with intelligent automation and an AI-powered agent.

## Tech Stack

- **Frontend:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS + Framer Motion (animations) + Lucide Icons
- **State Management:** Zustand
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage)
- **Charts:** Recharts
- **Drag & Drop:** @dnd-kit
- **Auth:** Supabase Auth with Google OAuth support + email/password

## Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd closepilot-ai-agency-crm

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. (Optional) Configure Supabase - see Environment Variables below
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start dev server
npm run dev

# 5. Open http://localhost:5173
# Click "Enter Demo Mode" to use with mock data, or configure Supabase for full persistence
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Optional | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Optional | Your Supabase anonymous key |

> **Note:** The app works fully in Demo Mode without Supabase. All CRUD operations, the AI agent, and drag-and-drop pipeline work with in-memory state.

## Features

### A) Core CRM Features
- **Entities:** Users (profiles), Contacts/Leads, Accounts, Deals/Opportunities, Notes, Tasks
- **Full CRUD:** Create, edit, and delete contacts, deals, notes, and tasks via modal forms
- **Workflows:**
  1. Create a contact (Leads page > "+ Add Contact")
  2. Create a deal (Pipeline page > "+ New Deal")
  3. Add notes/tasks (Deal Detail > Notes & Tasks panel)
  4. Move deal through pipeline stages (drag & drop on Kanban board)
  5. Changes reflected everywhere (dashboard KPIs, event log, activity timeline)

### B) Dashboard & Analytics
- **8 Dashboard Widgets:** Total Pipeline, New Contacts, Win Rate, Tasks Due, Active Spend, Active Deals, Active Campaigns, Conversion Rate
- **Behavior Tracking:** Every action (login, deal stage change, contact created, deal created, note added, task completed, agent action) is logged and displayed in the Event Log widget on the dashboard
- **Charts:** Revenue forecast (area), Pipeline breakdown (bar), Campaign performance (line, pie, bar)

### C) Agentic Capability
- **Lead Follow-up Agent:** An AI-powered agent accessible from any Deal Detail page
- **Multi-step actions:**
  1. Analyzes deal context (stage, value, probability, contact info)
  2. Generates contextual follow-up emails, meeting summaries, or health analyses
  3. **Writes back to CRM:** Automatically creates Notes and Tasks in the CRM
- **Quick Actions:** Draft follow-up email, Analyze deal health, Generate meeting notes, Summarize pipeline, Find at-risk deals, Weekly report
- All agent actions are logged in the behavior tracking system

### D) Public API Integration
- **Google OAuth:** Implemented via Supabase Auth OAuth provider
- To enable: Configure Google OAuth credentials in Supabase Dashboard > Authentication > Providers > Google
- Auth method: **OAuth 2.0** (not PAT) via `supabase.auth.signInWithOAuth({ provider: 'google' })`
- The Auth page includes a "Continue with Google" button when Supabase is configured

## Database Schema

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor to create:

- `profiles` — User data and roles (auto-created on signup)
- `accounts` — Companies/clients
- `contacts` — Individual people at companies
- `deals` — Pipeline opportunities with stage, value, probability
- `activities` — Log of calls, emails, meetings
- `campaigns` — Ad campaigns with budget, spend, performance metrics
- `smart_actions_log` — Automated action history
- `creative-assets` storage bucket — File uploads for creative assets

All tables have Row Level Security (RLS) enabled with policies for authenticated users.

## Project Structure

```
src/
├── components/
│   ├── ui/             # Modal, Toast
│   ├── AgentPanel.tsx   # AI Lead Follow-up Agent
│   ├── AssetManager.tsx # Creative asset upload/management
│   ├── CreateContactModal.tsx
│   ├── CreateDealModal.tsx
│   ├── Layout.tsx
│   └── NoteTaskPanel.tsx # Notes & Tasks CRUD
├── lib/
│   ├── google-auth.ts   # Google OAuth integration
│   ├── mock-data.ts     # Demo data
│   ├── smart-actions.ts # Pipeline automation rules
│   └── supabase.ts      # Supabase client + data layer
├── pages/
│   ├── Auth.tsx         # Login/Signup/Google OAuth/Demo
│   ├── Dashboard.tsx    # KPIs, charts, event log
│   ├── Leads.tsx        # Contact list with CRUD
│   ├── LeadDetail.tsx   # Contact detail + timeline
│   ├── Pipeline.tsx     # Kanban board + drag-and-drop
│   ├── DealDetail.tsx   # Deal detail + notes + tasks + agent
│   ├── Accounts.tsx     # Company management
│   └── Analytics.tsx    # Campaign performance
├── stores/
│   ├── app-store.ts     # Main state (CRUD + events)
│   ├── auth-store.ts    # Authentication state
│   └── toast-store.ts   # Notification state
└── types/
    └── index.ts         # TypeScript interfaces
```

## What I'd Do Next

1. **Real-time sync:** Use Supabase Realtime subscriptions for live updates across tabs/users
2. **Google Calendar import:** Already scoped in `google-auth.ts` — would fetch calendar events and auto-create activities
3. **Email integration:** Connect to SendGrid/Resend to actually send the agent-drafted emails
4. **Advanced AI agent:** Replace the rule-based agent with an LLM-powered agent (OpenAI/Claude API) for truly dynamic responses
5. **Role-based access control:** Implement admin/manager/member roles with different permissions
6. **Reporting exports:** PDF/CSV export of pipeline reports and campaign analytics
7. **Mobile responsiveness:** Further optimize the layout for tablet and mobile views
8. **End-to-end tests:** Add Playwright tests for the critical CRUD workflow
9. **Webhook integrations:** Connect to Slack, HubSpot, or Salesforce for cross-platform sync
10. **Performance:** Code-split with React.lazy() and add virtualization for large contact lists
