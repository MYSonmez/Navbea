"use client";

import type { LucideIcon } from "lucide-react";

export function ViewSwitch({ value, setValue, options }: { value: string; setValue: (value: string) => void; options: { id: string; label: string; icon?: LucideIcon }[] }) {
  return <div className="monitor-view-switch">{options.map(({ id, label, icon: Icon }) => <button key={id} className={value === id ? "active" : ""} onClick={() => setValue(id)}>{Icon ? <Icon size={15} /> : null}{label}</button>)}</div>;
}
