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
  const [demoMode, setDemoMode] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Workspace preferences and connection details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Behavior for new collection tasks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <SettingRow
            label="Corpus mode"
            description="Rank the curated corpus against each prompt instead of calling live connectors."
          >
            <Switch checked={demoMode} onCheckedChange={setDemoMode} />
          </SettingRow>
          <Separator />
          <SettingRow label="Task notifications" description="Notify when a task finishes running.">
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection</CardTitle>
          <CardDescription>
            Environment variables used when demo mode is off. Set these in <code className="font-mono text-[11px]">.env</code>, see <code className="font-mono text-[11px]">.env.example</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnvRow name="DATABASE_URL" placeholder="postgresql://user:password@host:5432/datapilot" />
          <EnvRow name="OPENROUTER_API_KEY" placeholder="sk-or-••••••••••" />
          <EnvRow name="AI_MODEL" placeholder="x-ai/grok-4.1-fast:free" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Plan</span>
            <Badge variant="cyan">Hackathon Demo</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Storage backend</span>
            <span className="text-foreground">PostgreSQL via Prisma</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="gradient" onClick={() => toast.success("Settings saved")}>Save changes</Button>
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
