import type { ReactNode } from "react";

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  return <span className={`status-pill ui-status-pill ${tone}`}><span className="status-dot" />{children}</span>;
}

export function DataValue({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`ui-data-value ${className}`.trim()}>{children}</span>;
}
