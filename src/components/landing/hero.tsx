"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const DataNetworkScene = dynamic(
  () => import("@/components/three/data-network-scene").then((m) => m.DataNetworkScene),
  { ssr: false }
);

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="grid-fade pointer-events-none absolute inset-0" />
      <div className="absolute inset-0 -z-10 opacity-90">
        <DataNetworkScene className="h-full w-full" />
      </div>

      <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-center px-6 pt-24 pb-16 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/70 px-3 py-1 text-xs text-muted glass">
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            Dynamic workflow builder, not a fixed scraper
          </div>

          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Describe the data you need.
            <br />
            <span className="text-gradient">DataPilot builds the pipeline.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Type a plain-English request. DataPilot AI extracts your intent, designs a
            collection workflow on the fly, gathers from permitted sources, validates and
            deduplicates the results, and hands you a traceable dataset in minutes.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button size="lg" variant="gradient" asChild>
              <Link href="/tasks/new">
                Try the live demo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">Explore the dashboard</Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted-2">
            <PipelineChip label="Prompt" />
            <Chevron />
            <PipelineChip label="AI Intent" />
            <Chevron />
            <PipelineChip label="Workflow" />
            <Chevron />
            <PipelineChip label="Collection" />
            <Chevron />
            <PipelineChip label="Validation" />
            <Chevron />
            <PipelineChip label="Dataset" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PipelineChip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-border bg-surface/60 px-2.5 py-1 font-mono text-[11px] tracking-wide text-muted">
      {label}
    </span>
  );
}

function Chevron() {
  return <span className="text-muted-2">/</span>;
}
