"use client";

import * as React from "react";
import { animate } from "framer-motion";
import { formatNumber } from "@/lib/utils";

export function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const prev = React.useRef(0);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(prev.current, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = formatNumber(Math.round(v));
      },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
