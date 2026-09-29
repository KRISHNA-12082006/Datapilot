"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Building2, Briefcase, Rocket, Leaf } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_PROMPT } from "@/lib/demo-engine";
import { toast } from "sonner";

const EXAMPLES = [
  {
    icon: Leaf,
    title: "Sponsor leads",
    prompt: DEMO_PROMPT,
  },
  {
    icon: Briefcase,
    title: "Job openings",
    prompt: "Find open marketing manager roles in Bangalore posted in the last 7 days. Include company, role title, location and salary range.",
  },
  {
    icon: Building2,
    title: "Market research",
    prompt: "Collect information on mid-size fintech companies in Mumbai, including website, industry and contact email.",
  },
  {
    icon: Rocket,
    title: "Investor list",
    prompt: "Find early-stage investors focused on climate tech, with website, location and contact information.",
  },
];

export default function NewTaskPage() {
  const [prompt, setPrompt] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const submitPrompt = useAppStore((s) => s.submitPrompt);
  const router = useRouter();

  const handleSubmit = async (value?: string) => {
    const finalPrompt = (value ?? prompt).trim();
    if (!finalPrompt) return;
    setSubmitting(true);
    try {
      const id = await submitPrompt(finalPrompt);
      router.push(`/tasks/${id}`);
    } catch {
      setSubmitting(false);
      toast.error("Could not create the task. Is the backend running?");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6d5bfa,#17b6d4)]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">What data do you need?</h1>
        <p className="mt-2 text-sm text-muted">
          Describe your request in plain English. DataPilot will design and run the collection workflow.
        </p>
      </div>

      <Card className="p-5">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Find sustainability-focused sponsor leads for a college technology festival in Pune. Include company name, website, industry, location and contact information."
          className="min-h-32 resize-none border-none bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
          }}
        />
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <Badge variant="cyan">Verified corpus — every record traceable to source</Badge>
          <Button variant="gradient" disabled={!prompt.trim() || submitting} onClick={() => handleSubmit()}>
            Run collection <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <div>
        <p className="mb-3 text-xs font-medium text-muted">Or try an example</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EXAMPLES.map((ex, i) => (
            <motion.button
              key={ex.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSubmit(ex.prompt)}
              className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-surface/50 p-4 text-left transition-colors hover:border-border-strong hover:bg-surface/90"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2/70 text-primary">
                <ex.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">{ex.title}</span>
              <span className="line-clamp-2 text-xs text-muted">{ex.prompt}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
