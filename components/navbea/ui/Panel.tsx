import type { HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: "section" | "article";
};

export function Panel({ children, className = "", as: Element = "section", ...props }: PanelProps) {
  return <Element className={`panel ui-panel ${className}`.trim()} {...props}>{children}</Element>;
}

export function PanelHeader({ eyebrow, title, meta, actions }: { eyebrow?: string; title: string; meta?: ReactNode; actions?: ReactNode }) {
  return <header className="ui-panel-header"><div>{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h2>{title}</h2>{meta ? <span>{meta}</span> : null}</div>{actions ? <div className="ui-panel-actions">{actions}</div> : null}</header>;
}
