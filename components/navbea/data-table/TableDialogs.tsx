"use client";

import { Trash2, X } from "lucide-react";
import { Button, IconButton } from "../Ui";

export function EditRowDialog({ columns, values, onChange, onCancel, onSave }: { columns: string[]; values: string[]; onChange: (index: number, value: string) => void; onCancel: () => void; onSave: () => void }) {
  return <div className="ui-dialog-layer" role="presentation"><section role="dialog" aria-modal="true" aria-label="Kaydı düzenle" className="ui-dialog edit-row-dialog"><header className="ui-dialog-header"><div><p className="eyebrow">KAYIT</p><h2>Düzenle</h2></div><IconButton label="Düzenlemeyi kapat" onClick={onCancel}><X size={17} /></IconButton></header><div className="edit-row-fields">{columns.filter((column) => column !== "Eylemler").map((column, index) => <label key={column} className="ui-field"><span>{column}</span><input value={values[index] ?? ""} onChange={(event) => onChange(index, event.target.value)} /></label>)}</div><footer className="ui-dialog-footer"><Button onClick={onCancel}>Vazgeç</Button><Button variant="primary" onClick={onSave}>Değişiklikleri Kaydet</Button></footer></section></div>;
}

export function DeleteRowDialog({ onCancel, onDelete }: { onCancel: () => void; onDelete: () => void }) {
  return <div className="ui-dialog-layer"><section role="alertdialog" aria-modal="true" aria-label="Kaydı sil" className="ui-dialog delete-row-dialog"><span className="delete-dialog-icon"><Trash2 size={19} /></span><h2>Kayıt silinsin mi?</h2><p>Bu kayıt mevcut tablodan kaldırılacak. Bu işlem geri alınamaz.</p><footer className="ui-dialog-footer"><Button onClick={onCancel}>Vazgeç</Button><Button variant="danger" onClick={onDelete}>Sil</Button></footer></section></div>;
}
