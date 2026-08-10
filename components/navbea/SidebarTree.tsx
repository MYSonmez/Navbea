"use client";

import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";

export type SidebarNode = {
  id: string;
  label: string;
  icon: LucideIcon;
  serviceId?: string;
  children?: SidebarNode[];
};

function containsService(node: SidebarNode, serviceId: string): boolean {
  return node.serviceId === serviceId || Boolean(node.children?.some((child) => containsService(child, serviceId)));
}

type SidebarTreeItemProps = {
  node: SidebarNode;
  level: number;
  activeId: string;
  expandedNodes: string[];
  toggleNode: (id: string) => void;
  openService: (id: string) => void;
};

export function SidebarTreeItem({ node, level, activeId, expandedNodes, toggleNode, openService }: SidebarTreeItemProps) {
  const Icon = node.icon;
  const hasChildren = Boolean(node.children?.length);
  const expanded = expandedNodes.includes(node.id);
  const active = node.serviceId === activeId;
  const branchActive = containsService(node, activeId);
  const levelClass = `level-${Math.min(level, 2)}`;

  if (!hasChildren) {
    return (
      <button type="button" className={`nav-tree-link ${levelClass} ${active ? "active" : ""}`} onClick={() => node.serviceId && openService(node.serviceId)} title={node.label}>
        <Icon size={level > 0 ? 15 : 18} />
        <span>{node.label}</span>
        {node.serviceId === "live" ? <i className="live-nav-dot" /> : null}
      </button>
    );
  }

  return (
    <div className={`nav-tree-node ${levelClass} ${branchActive ? "branch-active" : ""}`}>
      <button type="button" className="nav-tree-toggle" aria-expanded={expanded} onClick={() => toggleNode(node.id)} title={node.label}>
        <Icon size={level > 0 ? 15 : 18} />
        <span>{node.label}</span>
        {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
      </button>
      {expanded ? <div className="nav-tree-children">{node.children?.map((child) => <SidebarTreeItem key={child.id} node={child} level={level + 1} activeId={activeId} expandedNodes={expandedNodes} toggleNode={toggleNode} openService={openService} />)}</div> : null}
    </div>
  );
}
