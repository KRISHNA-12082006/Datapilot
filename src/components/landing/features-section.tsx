"use client";

import { motion } from "framer-motion";
import {
  MessageSquareText,
  Workflow,
  Plug,
  ActivitySquare,
  ShieldCheck,
  Link2,
  Table2,
  BarChart3,
  Download,
  PlayCircle,
  History,
  SearchCheck,
} from "lucide-react";

const FEATURES = [
  { icon: MessageSquareText, title: "Natural-language intake", desc: "Describe what you need the way you'd brief a colleague — no query language required." },
  { icon: Workflow, title: "Dynamic workflow generation", desc: "Each request produces its own visual collection workflow, built on the fly." },
  { icon: Plug, title: "Multi-source connectors", desc: "APIs, permitted web sources and uploaded files, combined in a single run." },
  { icon: ActivitySquare, title: "Real-time execution", desc: "Watch each pipeline stage progress live, with logs as they happen." },
  { icon: ShieldCheck, title: "Validation & dedup", desc: "Incomplete records are dropped and near-duplicates are merged automatically." },
  { icon: Link2, title: "Full provenance", desc: "Every record links back to the exact source it came from." },
  { icon: Table2, title: "Dataset Explorer", desc: "Search, filter, sort and paginate through dynamic, request-specific columns." },
  { icon: BarChart3, title: "Built-in analytics", desc: "Confidence distributions, source breakdowns and field coverage, visualized." },
  { icon: Download, title: "CSV / JSON export", desc: "Take your dataset anywhere — clean, structured, ready to use." },
  { icon: PlayCircle, title: "Task controls", desc: "Run, pause, resume, cancel or rerun any collection task." },
  { icon: History, title: "Workflow history", desc: "Revisit, clone and reuse any workflow you've generated before." },
  { icon: SearchCheck, title: "Source inspector", desc: "Drill into any connector to see exactly what it contributed." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Built for real data operations</h2>
          <p className="mt-4 text-muted">
            Not a toy demo — the task management, traceability and export tooling you&apos;d
            actually want to keep using after the first run.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.06 }}
              className="rounded-xl border border-border bg-surface/50 p-5 transition-colors hover:border-border-strong hover:bg-surface/80"
            >
              <f.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
              <h3 className="mt-3.5 text-sm font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
