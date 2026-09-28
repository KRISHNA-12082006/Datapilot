"use client";

import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { SourceRecord } from "@/types";

export function RecordDetailDialog({
  record,
  open,
  onOpenChange,
}: {
  record: SourceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record details</DialogTitle>
          <DialogDescription className="font-mono text-[11px]">{record?.id}</DialogDescription>
        </DialogHeader>

        {record && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(record.fields).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-border bg-surface-2/30 p-2.5">
                  <p className="text-[10px] font-medium text-muted-2">{key}</p>
                  <p className="mt-0.5 truncate text-sm text-foreground">{String(value)}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2/30 p-3">
              <div>
                <p className="text-[10px] font-medium text-muted-2">SOURCE</p>
                <a
                  href={record.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {record.sourceName} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Badge variant={record.confidence > 0.85 ? "success" : record.confidence > 0.7 ? "warning" : "danger"}>
                {Math.round(record.confidence * 100)}% confidence
              </Badge>
            </div>

            <p className="text-[11px] text-muted-2">
              Collected {new Date(record.collectedAt).toLocaleString()}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
