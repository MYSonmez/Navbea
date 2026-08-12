"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button, IconButton } from "../Ui";

export function RowActions({ open, onToggle, onEdit, onDelete }: { open: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  return <div className="row-action-wrap"><IconButton label="Satır eylemleri" aria-expanded={open} onClick={onToggle}><MoreHorizontal size={17} /></IconButton>{open ? <div className="row-action-menu"><Button variant="quiet" onClick={onEdit}><Pencil size={14} /> Düzenle</Button><Button variant="quiet" className="danger" onClick={onDelete}><Trash2 size={14} /> Sil</Button></div> : null}</div>;
}
