"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const [notifications, setNotifications] = React.useState(true);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">How DataPilot connects and behaves.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>The pipeline behind every request you make.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <HowRow n="1" title="Understand" desc="An LLM reads your question and extracts entities, filters and the exact fields you need." />
          <HowRow n="2" title="Collect" desc="The engine ranks 24 verified organizations against that intent — no invented companies, no dead links." />
          <HowRow n="3" title="Prove" desc="Every record is validated (URL, email, completeness), deduped and scored — then linked to its source." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Behavior for new requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <SettingRow label="Task notifications" description="Notify when a request finishes running.">
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI configuration</CardTitle>
          <CardDescription>
            The reasoning engine (OpenRouter) and data connection. Set these in{" "}
            <code className="font-mono text-[11px]">.env</code>, see{" "}
            <code className="font-mono text-[11px]">.env.example</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnvRow name="OPENROUTER_API_KEY" placeholder="sk-or-••••••••••" />
          <EnvRow name="AI_MODEL" placeholder="x-ai/grok-4.1-fast:free" />
          <Separator />
          <EnvRow name="DATABASE_URL" placeholder="postgresql://user:password@host:5432/datapilot" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Plan</span>
            <Badge variant="secondary">Hackathon build</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Storage backend</span>
            <span className="text-foreground">PostgreSQL</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Knowledge base</span>
            <span className="text-foreground">24 verified organizations</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="gradient" onClick={() => toast.success("Settings saved")}>Save changes</Button>
      </div>
    </div>
  );
}

function HowRow({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2/60 font-mono text-[11px] text-secondary">{n}</span>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{desc}</p>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label>{label}</Label>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function EnvRow({ name, placeholder }: { name: string; placeholder: string }) {
  return (
    <div>
      <Label className="font-mono text-xs">{name}</Label>
      <Input className="mt-1.5" placeholder={placeholder} disabled />
    </div>
  );
}
