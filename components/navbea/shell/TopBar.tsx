"use client";

import { AlertTriangle, Bell, ChevronDown, MapPin, Menu, Moon, Search, Sun } from "lucide-react";
import { IconButton } from "../Ui";

type TopBarProps = {
  theme: "light" | "dark";
  workspaceName: string;
  onMobileMenu: () => void;
  onSearch: () => void;
  onScope: () => void;
  onCritical: () => void;
  onTheme: () => void;
};

export function TopBar({ theme, workspaceName, onMobileMenu, onSearch, onScope, onCritical, onTheme }: TopBarProps) {
  return <header className="topbar"><IconButton label="Mobil menü" onClick={onMobileMenu}><Menu size={18} /></IconButton><button className="global-search" type="button" onClick={onSearch}><Search size={17} /><span>Sayfa, kişi, cihaz veya rapor ara…</span><kbd>⌘ K</kbd></button><div className="top-actions"><button className="scope-chip" type="button" onClick={onScope}><MapPin size={15} /><span>{workspaceName}</span><ChevronDown size={14} /></button><button className="critical-queue" type="button" onClick={onCritical}><AlertTriangle size={16} /><span>3 kritik</span></button><IconButton label="Bildirimler"><Bell size={18} /><span className="notification-dot">3</span></IconButton><IconButton label={theme === "light" ? "Koyu moda geç" : "Açık moda geç"} onClick={onTheme}>{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</IconButton><div className="top-user"><span className="avatar">AS</span><span><strong>Admin</strong><small>{workspaceName}</small></span></div></div></header>;
}
