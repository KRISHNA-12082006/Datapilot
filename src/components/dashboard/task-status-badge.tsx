import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/types";
import { Loader2, CheckCircle2, PauseCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

const STATUS_CONFIG: Record<
  TaskStatus,
  { variant: "default" | "success" | "warning" | "danger" | "secondary" | "cyan"; label: string; icon: React.ReactNode }
> = {
  queued: { variant: "secondary", label: "Queued", icon: <Clock className="h-3 w-3" /> },
  running: { variant: "cyan", label: "Running", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  paused: { variant: "warning", label: "Paused", icon: <PauseCircle className="h-3 w-3" /> },
  completed: { variant: "success", label: "Completed", icon: <CheckCircle2 className="h-3 w-3" /> },
  failed: { variant: "danger", label: "Failed", icon: <AlertTriangle className="h-3 w-3" /> },
  cancelled: { variant: "secondary", label: "Cancelled", icon: <XCircle className="h-3 w-3" /> },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.icon}
      {config.label}
    </Badge>
  );
}
