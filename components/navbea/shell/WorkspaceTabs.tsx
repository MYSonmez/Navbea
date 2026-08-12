"use client";

import { Pin, Plus, X, type LucideIcon } from "lucide-react";

export type WorkspaceTabItem = { id: string; label: string; icon: LucideIcon; pinned: boolean; active: boolean };

type WorkspaceTabsProps = {
  items: WorkspaceTabItem[];
  onOpen: (id: string) => void;
  onPin: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
};

function WorkspaceTab({ item, onOpen, onPin, onClose }: { item: WorkspaceTabItem } & Pick<WorkspaceTabsProps, "onOpen" | "onPin" | "onClose">) {
  const Icon = item.icon;
  return <div className={`workspace-tab${item.active ? " active" : ""}${item.pinned ? " pinned" : ""}`}><button className="tab-main" role="tab" aria-selected={item.active} onClick={() => onOpen(item.id)}><Icon size={15} /><span>{item.label}</span></button>{item.id !== "home" ? <><button className="tab-pin" aria-label={item.pinned ? `${item.label} sekmesinin sabitlemesini kaldır` : `${item.label} sekmesini sabitle`} aria-pressed={item.pinned} title={item.pinned ? "Sabitlemeyi kaldır" : "Sekmeyi sabitle"} onClick={() => onPin(item.id)}><Pin size={12} /></button><button className="tab-close" aria-label={`${item.label} sekmesini kapat`} onClick={() => onClose(item.id)}><X size={13} /></button></> : null}</div>;
}

export function WorkspaceTabs({ items, onOpen, onPin, onClose, onNew }: WorkspaceTabsProps) {
  return <div className="workspace-tabs" role="tablist" aria-label="Açık çalışma sekmeleri">{items.map((item) => <WorkspaceTab key={item.id} item={item} onOpen={onOpen} onPin={onPin} onClose={onClose} />)}<button className="new-tab" aria-label="Modül dizinini aç" onClick={onNew}><Plus size={15} /></button></div>;
}
