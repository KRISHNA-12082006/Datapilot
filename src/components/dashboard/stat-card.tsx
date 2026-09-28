import * as React from "react";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  accent = "primary",
  suffix,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "primary" | "secondary" | "success" | "accent";
  suffix?: string;
}) {
  const accentClasses: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    success: "text-success bg-success/10",
    accent: "text-accent bg-accent/10",
  };

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground mono-tabular">
            <AnimatedCounter value={value} />
            {suffix}
          </p>
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", accentClasses[accent])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
