"use client";

import { Search } from "lucide-react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

type SearchFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  compact?: boolean;
};

export function SearchField({ label, compact = false, className = "", ...props }: SearchFieldProps) {
  return <label className={`ui-search-field${compact ? " compact" : ""} ${className}`.trim()}><Search size={15} aria-hidden="true" /><span className="sr-only">{label}</span><input aria-label={label} {...props} /></label>;
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function SelectField({ label, className = "", children, ...props }: SelectFieldProps) {
  return <label className={`ui-select-field ${className}`.trim()}><span className="sr-only">{label}</span><select aria-label={label} {...props}>{children}</select></label>;
}
