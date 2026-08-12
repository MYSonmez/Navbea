import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export type SortDirection = "desc" | "asc";

export function SortIndicator({ active, direction }: { active: boolean; direction?: SortDirection }) {
  if (!active) return <ChevronsUpDown aria-hidden size={13} className="sort-muted" />;
  return direction === "desc" ? <ChevronDown aria-hidden size={14} /> : <ChevronUp aria-hidden size={14} />;
}
