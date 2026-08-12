import type { LucideIcon } from "lucide-react";

export type MonitoringTone = "blue" | "teal" | "amber" | "coral" | "violet" | "slate";

export function MonitoringMetric({ label, value, detail, icon: Icon, tone = "blue", onClick, active }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: MonitoringTone; onClick?: () => void; active?: boolean }) {
  const content = <><span className={`monitor-metric-icon ${tone}`}><Icon size={19} /></span><span><small>{label}</small><strong>{value}</strong><em>{detail}</em></span></>;
  return onClick ? <button className={`monitor-metric-card${active ? " active" : ""}`} onClick={onClick}>{content}</button> : <article className="monitor-metric-card">{content}</article>;
}

export function SimpleBars({ items, tone = "blue" }: { items: { name: string; value: number }[]; tone?: MonitoringTone }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return <div className="monitor-simple-bars">{items.map((item) => <div key={item.name}><span><strong>{item.name}</strong><em>{item.value}</em></span><i><b className={tone} style={{ width: `${item.value / max * 100}%` }} /></i></div>)}</div>;
}
