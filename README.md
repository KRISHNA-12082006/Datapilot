# DataPilot AI

An AI-powered data intelligence platform, built for hackathon demonstration.

Turn a plain-English request into a clean, validated, source-backed dataset:

```
Prompt → AI Intent → Dynamic Workflow → Multi-Source Collection → Validation → Deduplication → Dataset → Analytics → Export
```

DataPilot is a **dynamic workflow builder**, not a fixed scraper — every request is parsed
into structured intent, and a task-specific collection workflow is generated and executed
live, with full source provenance on every record.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + hand-built shadcn/ui-style component library
- **Framer Motion** for page/element animation
- **React Three Fiber** + **Drei** + **Three.js** for the 3D data-network hero visualization
- **Zustand** for client state (drives the live pipeline simulation)
- **Recharts** for dataset analytics
- **cmdk** for the command palette (`⌘K` / `Ctrl+K`)
- **PostgreSQL** via `pg`, with the schema documented in `prisma/schema.prisma`

## Running it

Requires Node 20+ and a PostgreSQL database.

```bash
npm install
cp .env.example .env      # set DATABASE_URL (and optionally AI_API_KEY)
npm run db:init           # creates tables + seeds the connector catalog
npm run dev               # http://localhost:3000
```

Production check: `npm run build && npm start`.

## How the backend works

- **API routes** (`src/app/api/*`): `POST/GET /api/tasks`, `GET /api/tasks/:id`,
  `POST /api/tasks/:id/{pause,resume,cancel,rerun}`, `GET /api/datasets[/:id]`,
  `GET /api/workflows`, `GET /api/sources`.
- **Persistence**: every task, stage update, intent, connector choice, dataset and record is
  stored in PostgreSQL (`src/lib/server/repository.ts`). State survives page refreshes and
  server restarts; the UI polls `/api/tasks/:id` for live progress.
- **Pipeline engine** (`src/lib/server/pipeline-engine.ts`): runs Interpret, Plan, Collect,
  Validate, Deduplicate, Deliver in the Node process, writing progress to the DB at each step.
- **Intent extraction** (`src/lib/server/ai.ts`): calls the Anthropic Messages API when
  `AI_API_KEY` is set; otherwise (or on any failure) falls back to a local keyword heuristic.

### What is real and what is simulated

| Part | Status |
|---|---|
| PostgreSQL storage, REST API, task control (pause/resume/cancel/rerun) | Real |
| Live progress, dataset explorer, analytics, CSV/JSON export | Real, reading from the DB |
| Intent extraction | Real LLM if `AI_API_KEY` is set, else local heuristic |
| **Data collection connectors** | **Simulated**: records are generated, and labeled DEMO DATA in the UI |

Live collection would be added by implementing real connectors behind `generateDemoRecords`
in the pipeline's Collect stage.

### Known limitations

- The pipeline runs in the server process's memory (timers). It works with `next dev` /
  `next start` or any long-running Node host; on serverless platforms replace it with a job
  queue/worker. A task interrupted by a server restart stays in `running`; rerun it.
- The schema exists both as `prisma/schema.prisma` and as hand-written `prisma/init.sql`
  (the runtime uses `pg` directly). With normal internet access `npx prisma migrate dev`
  also works against the same schema.

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing page with 3D hero, pipeline explainer, features |
| `/dashboard` | Stats overview + recent tasks |
| `/tasks/new` | Prompt input + example requests |
| `/tasks/[id]` | Live pipeline execution, intent, connectors, results preview |
| `/datasets` | All generated datasets |
| `/datasets/[id]` | Dataset Explorer — search/filter/sort/paginate, analytics, export |
| `/sources` | Connector inspector |
| `/workflows` | Generated workflows — clone & rerun |
| `/history` | All tasks, filterable by status |
| `/settings` | Preferences and connection details |

## Notes for judges

- All collected records are clearly labeled **DEMO DATA** / simulated throughout the UI.
- The command palette (`⌘K`) is the fastest way to trigger the full demo flow.
- The 3D visualization is intentionally lightweight (capped particle/node counts, no
  post-processing) to stay performant on modest hardware during a live demo.
