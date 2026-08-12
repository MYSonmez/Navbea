import type { ReactNode } from "react";

export function MonitoringHeader({ title, eyebrow, status, children }: { title: string; eyebrow: string; status?: string; children?: ReactNode }) {
  return <header className="monitor-page-header"><div><p className="eyebrow">{eyebrow}</p><div className="monitor-title-line"><h1>{title}</h1>{status ? <span className="monitor-live-pill"><span />{status}</span> : null}</div><small>Son veri 15:42:18</small></div><div className="monitor-header-actions">{children}</div></header>;
}
