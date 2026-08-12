import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return <header className="section-header ui-page-header"><div>{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h1>{title}</h1>{description ? <p className="section-description">{description}</p> : null}</div>{actions ? <div className="header-actions">{actions}</div> : null}</header>;
}

export const SectionHeader = PageHeader;
