"use client";

import Image from "next/image";
import { ChevronRight, Grid2X2, Home, Sparkles, Store, X } from "lucide-react";
import { SidebarTreeItem, type SidebarNode } from "../SidebarTree";
import { IconButton } from "../Ui";

type NavigationShellProps = {
  nodes: SidebarNode[];
  activeId: string;
  activeRootId?: string;
  flyoutId: string | null;
  flyoutNode?: SidebarNode;
  flyoutTone: string;
  expandedNodes: string[];
  onFlyout: (id: string | null) => void;
  onToggleNode: (id: string) => void;
  onOpenService: (id: string) => void;
  onOpenCatalog: () => void;
  onProfile: () => void;
  onCloseMobile: () => void;
};

function RailLink({ node, index, active, open, onOpen }: { node: SidebarNode; index: number; active: boolean; open: boolean; onOpen: () => void }) {
  const Icon = node.icon;
  return <button className={`rail-link rail-tone-${index % 6}${active ? " active" : ""}${open ? " open" : ""}`} aria-expanded={open} aria-controls="navigation-flyout" onMouseEnter={onOpen} onClick={onOpen} title={node.label}><Icon size={20} /><span className="rail-tooltip">{node.label}</span>{node.id === "monitoring" ? <i className="rail-live-dot" /> : null}</button>;
}

function NavigationFlyout({ node, tone, activeId, expandedNodes, onClose, onToggleNode, onOpenService, onOpenCatalog }: { node: SidebarNode; tone: string } & Pick<NavigationShellProps, "activeId" | "expandedNodes" | "onToggleNode" | "onOpenService" | "onOpenCatalog"> & { onClose: () => void }) {
  const Icon = node.icon;
  return <section className="nav-flyout" id="navigation-flyout" aria-label={`${node.label} menüsü`}><div className="flyout-heading"><span className={`flyout-group-icon ${tone}`}><Icon size={20} /></span><div><small>ÇALIŞMA ALANI</small><h2>{node.label}</h2></div><IconButton label="Menüyü kapat" onClick={onClose}><X size={16} /></IconButton></div><div className="flyout-tree">{node.children?.map((child) => <SidebarTreeItem key={child.id} node={child} level={0} activeId={activeId} expandedNodes={expandedNodes} toggleNode={onToggleNode} openService={onOpenService} />)}</div><button className="flyout-directory" onClick={onOpenCatalog}><Grid2X2 size={16} /> Tüm modülleri görüntüle <ChevronRight size={15} /></button></section>;
}

export function NavigationShell({ nodes, activeId, activeRootId, flyoutId, flyoutNode, flyoutTone, expandedNodes, onFlyout, onToggleNode, onOpenService, onOpenCatalog, onProfile, onCloseMobile }: NavigationShellProps) {
  return <><aside className="navigation-shell" onMouseLeave={() => onFlyout(null)}><div className="sidebar"><button className="brand" aria-label="Ana sayfaya git" onClick={() => onOpenService("home")}><Image className="brand-logo brand-logo-light" src="/logo-icon-light.svg" alt="Navbea" width={26} height={42} priority /><Image className="brand-logo brand-logo-dark" src="/logo-icon-dark.svg" alt="" aria-hidden="true" width={26} height={42} priority /></button><nav className="rail-nav" aria-label="Ana navigasyon"><button className={`rail-link${activeId === "home" ? " active" : ""}`} onClick={() => onOpenService("home")} title="Ana Sayfa"><Home size={20} /><span className="rail-tooltip">Ana Sayfa</span></button><span className="rail-divider" />{nodes.map((node, index) => <RailLink key={node.id} node={node} index={index} active={activeRootId === node.id} open={flyoutId === node.id} onOpen={() => onFlyout(node.id)} />)}</nav><div className="rail-bottom"><button className={`rail-link rail-marketplace${activeId === "marketplace" ? " active" : ""}`} onClick={() => onOpenService("marketplace")} title="Marketplace"><Store size={20} /><span className="rail-tooltip">Marketplace</span><i className="marketplace-dot" /></button><button className={`rail-link${activeId === "wizard" ? " active" : ""}`} onClick={() => onOpenService("wizard")} title="Kurulum Sihirbazı"><Sparkles size={20} /><span className="rail-tooltip">Kurulum Sihirbazı</span></button><button className="rail-avatar" aria-label="Hesap ayarları" title="Admin hesabı" onClick={onProfile}>AS</button></div></div>{flyoutNode ? <NavigationFlyout node={flyoutNode} tone={flyoutTone} activeId={activeId} expandedNodes={expandedNodes} onClose={() => onFlyout(null)} onToggleNode={onToggleNode} onOpenService={onOpenService} onOpenCatalog={onOpenCatalog} /> : null}</aside><button className="sidebar-backdrop" aria-label="Menüyü kapat" onClick={onCloseMobile} /></>;
}
