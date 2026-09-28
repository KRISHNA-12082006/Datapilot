"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

export function PreviewSection() {
  return (
    <section id="preview" className="border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">From prompt to dataset, visually</h2>
          <p className="mt-4 text-muted">
            A live look at what happens after you hit submit on a request.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mt-12 overflow-hidden rounded-2xl border border-border-strong glass shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
            <span className="ml-3 font-mono text-xs text-muted-2">datapilot.ai/tasks/task_8f2c19</span>
          </div>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-5">
            <div className="border-border md:col-span-2 md:border-r p-6">
              <p className="text-[11px] font-medium tracking-wide text-muted-2">PROMPT</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                &ldquo;Find sustainability-focused sponsor leads for a college technology
                festival in Pune. Include company name, website, industry, location and
                contact information.&rdquo;
              </p>

              <div className="mt-6 space-y-3">
                {[
                  { label: "Interpret", state: "done" },
                  { label: "Plan", state: "done" },
                  { label: "Collect", state: "active" },
                  { label: "Validate", state: "pending" },
                  { label: "Deduplicate", state: "pending" },
                  { label: "Deliver", state: "pending" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5 text-sm">
                    {s.state === "done" && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {s.state === "active" && <Loader2 className="h-4 w-4 animate-spin text-secondary" />}
                    {s.state === "pending" && <span className="h-4 w-4 rounded-full border border-border-strong" />}
                    <span className={s.state === "pending" ? "text-muted-2" : "text-foreground"}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 p-6">
              <p className="text-[11px] font-medium tracking-wide text-muted-2">LIVE RESULTS</p>
              <div className="mt-3 overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-surface-2/60 text-muted-2">
                    <tr>
                      <th className="px-3 py-2 font-medium">Company</th>
                      <th className="px-3 py-2 font-medium">Industry</th>
                      <th className="px-3 py-2 font-medium">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      ["Verdant Ventures", "Renewable Energy", 94],
                      ["Terra Collective", "CSR", 88],
                      ["Bluepeak Labs", "Sustainable Packaging", 91],
                      ["Cedar Holdings", "Environmental Services", 76],
                    ].map((row) => (
                      <tr key={row[0] as string}>
                        <td className="px-3 py-2 text-foreground">{row[0]}</td>
                        <td className="px-3 py-2 text-muted">{row[1]}</td>
                        <td className="px-3 py-2">
                          <span className="mono-tabular text-success">{row[2]}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 font-mono text-[11px] text-muted-2">
                31 records found · 4 duplicates removed · 5 sources queried
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
