"use client";

import type { ReactNode } from "react";

type IconButtonProps = {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
};

export function IconButton({ label, children, onClick, active = false }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-button grid size-9 place-items-center rounded-lg border border-transparent text-[var(--text-soft)] transition hover:border-[var(--line)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] ${active ? "active" : ""}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{children}</span>;
}

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function SectionHeader({ eyebrow, title, description, actions }: SectionHeaderProps) {
  return (
    <header className="section-header flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {actions ? <div className="header-actions flex flex-wrap items-center justify-end gap-2">{actions}</div> : null}
    </header>
  );
}
