"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Globe, Building2, Newspaper, Users, Leaf, Briefcase, File, Plug } from "lucide-react";
import { CONNECTORS } from "@/lib/demo-engine";
import { useAppStore } from "@/store/use-app-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  globe: Globe,
  building: Building2,
  newspaper: Newspaper,
  users: Users,
  leaf: Leaf,
  briefcase: Briefcase,
  file: File,
};

const STATUS_VARIANT = {
  active: "success",
  syncing: "cyan",
  idle: "secondary",
  error: "danger",
} as const;

export default function SourcesPage() {
  const sources = useAppStore((s) => s.sources);
  const fetchSources = useAppStore((s) => s.fetchSources);

  React.useEffect(() => {
    fetchSources().catch(() => {});
  }, [fetchSources]);

  const contributions = new Map<string, number>();
  sources.forEach((s) => contributions.set(s.name, s.recordsContributed));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
        <p className="mt-1 text-sm text-muted">Connectors DataPilot can use when planning a workflow.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONNECTORS.map((c, i) => {
          const Icon = ICONS[c.icon] ?? Plug;
          const contributed = contributions.get(c.name) ?? 0;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2/70 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant={STATUS_VARIANT[c.status]} className="capitalize">{c.status}</Badge>
                </div>
                <h3 className="mt-3.5 text-sm font-medium text-foreground">{c.name}</h3>
                <p className="mt-0.5 text-xs capitalize text-muted-2">{c.type} connector</p>

                <div className="mt-4 space-y-2 border-t border-border pt-3">
                  <Row label="Records contributed" value={contributed.toString()} />
                  <Row label="Reliability" value={`${c.reliability}%`} />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted">{label}</span>
      <span className="mono-tabular font-medium text-foreground">{value}</span>
    </div>
  );
}
