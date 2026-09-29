"use client";

import { Search, Cpu } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/60 px-5 backdrop-blur-sm">
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex w-72 items-center gap-2 rounded-md border border-border bg-surface-2/50 px-3 py-1.5 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search or run a command…</span>
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted-2">
          {isMac ? "⌘" : "Ctrl"}K
        </kbd>
      </button>

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="hidden items-center gap-1.5 sm:inline-flex" title="LLM reasoning engine for intent extraction">
          <Cpu className="h-3 w-3" />
          Powered by Grok 4.1
        </Badge>
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-[linear-gradient(135deg,#6d5bfa,#17b6d4)] text-white">DP</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
