"use client";

import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { Button } from "../Ui";

export function MonitoringFilter({ kind = "general" }: { kind?: "general" | "alarm" | "tasks" }) {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  return <div className="monitor-filter-wrap"><Button className={`monitor-button${applied ? " is-active" : ""}`} onClick={() => setOpen((value) => !value)} aria-expanded={open}><Filter size={15} /> Filtrele <ChevronDown size={14} /></Button>{open ? <div className="monitor-filter-popover"><label><span>Konum</span><select><option>Tüm konumlar</option><option>Merkez Kampüs</option><option>Teknopol</option></select></label>{kind === "alarm" ? <label><span>Öncelik</span><select><option>Tüm öncelikler</option><option>Kritik</option><option>Uyarı</option></select></label> : null}{kind === "tasks" ? <label><span>Ekip</span><select><option>Tüm ekipler</option><option>Teknik</option><option>Güvenlik</option><option>İSG</option></select></label> : null}<label><span>Zaman</span><select><option>Şu an</option><option>Son 24 saat</option><option>Son 7 gün</option></select></label><div><Button size="sm" onClick={() => { setApplied(false); setOpen(false); }}>Temizle</Button><Button size="sm" variant="primary" onClick={() => { setApplied(true); setOpen(false); }}>Uygula</Button></div></div> : null}</div>;
}
