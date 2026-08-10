"use client";

import { CheckCircle2, Filter, RotateCcw, Search, TimerReset } from "lucide-react";
import { useState } from "react";
import { DataTable, type TableModel } from "./DataTable";
import { SectionHeader } from "./Ui";

type TableCallbacks = {
  onColumns?: () => void;
  onExport?: () => void;
  onNotice?: (message: string) => void;
};

const REPORT_MODEL: TableModel = {
  title: "Süre dağılımı kayıtları",
  searchLabel: "Personel, sicil veya görev kodu ara",
  total: 0,
  columns: ["Personel", "Personel Adı", "Personel Soyadı", "Sicil", "Pozisyon", "Firma", "Departman / Kısım", "Grup", "Personel Tipi", "Grup Yöneticisi", "Tarih", "Bölge", "Görev Kodu", "Onay Durumu", "Eylemler"],
  rows: [],
};

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid min-w-0 gap-1.5 text-[11px] font-semibold text-[var(--text-soft)]"><span>{label}</span>{children}</label>;
}

function SelectField({ label, options = ["Hepsi"] }: { label: string; options?: string[] }) {
  return <FilterField label={label}><select className="h-10 min-w-0 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--blue)]">{options.map((option) => <option key={option}>{option}</option>)}</select></FilterField>;
}

function FilterPanel({ mode }: { mode: "matching" | "report" }) {
  return <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] p-4 shadow-[var(--ring)]">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {mode === "matching" ? <>
        <FilterField label="Tarih"><input type="date" defaultValue="2026-08-05" className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] outline-none focus:border-[var(--blue)]" /></FilterField>
        <SelectField label="Konum / Harita" options={["Merkez Kampüs", "Ana Bina", "B Blok"]} />
        <FilterField label="Min. Bölge Süresi (dk)"><input type="time" defaultValue="00:30" className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] outline-none focus:border-[var(--blue)]" /></FilterField>
        <SelectField label="Firma" />
        <SelectField label="Departman / Kısım" />
        <SelectField label="Grup" />
        <SelectField label="Personel Ad Soyad" />
        <SelectField label="Personel Tipi" />
        <SelectField label="Pozisyon" />
        <SelectField label="Grup Yöneticisi" />
        <SelectField label="Görev Kodu (İş Kodu)" />
        <SelectField label="Tip (Direkt/Endirekt)" />
        <SelectField label="SAP Alan Kodu" />
        <SelectField label="Görev Adı" />
        <SelectField label="Disiplin" />
      </> : <>
        <SelectField label="Konum" options={["Tümü", "Merkez Kampüs", "Ana Bina"]} />
        <SelectField label="Bölge" options={["Tümü", "A Blok", "B Blok"]} />
        <SelectField label="Personel" options={["Tümü"]} />
        <SelectField label="Firma / Grup" />
        <SelectField label="Onay Durumu" />
        <SelectField label="Görev Etiketi (Direkt/Endirekt)" />
        <SelectField label="Disiplin" />
        <FilterField label="Tarih Aralığı"><input defaultValue="05.08.2026 00:00 – 05.08.2026 23:59" className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] outline-none focus:border-[var(--blue)]" /></FilterField>
      </>}
    </div>
    <div className="mt-4 flex justify-end gap-2"><button type="button" className="secondary-button"><RotateCcw size={15} /> Sıfırla</button><button type="button" className="primary-button"><Search size={15} /> Filtrele</button></div>
  </section>;
}

export function TimeMatchingView() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  return <div className="self-managed-view view-stack">
    <SectionHeader eyebrow="YÖNETİM · SÜRE DAĞITIMI" title="Süre Eşleştirme" actions={<button type="button" className="secondary-button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((value) => !value)}><Filter size={16} /> Filtrele</button>} />
    {filtersOpen ? <FilterPanel mode="matching" /> : null}
    <section className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-8 text-center">
      <div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600"><TimerReset size={22} /></span><h2 className="mt-4 text-sm font-semibold text-[var(--text)]">Filtre kriterlerine uygun personel bulunamadı</h2><p className="mt-2 text-xs text-[var(--text-soft)]">Tarih, konum veya görev filtrelerini değiştirerek tekrar deneyin.</p></div>
    </section>
  </div>;
}

export function TimeApprovalView() {
  return <div className="self-managed-view view-stack">
    <SectionHeader eyebrow="YÖNETİM · SÜRE DAĞITIMI" title="Onay Ekranı" />
    <section className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-8 text-center">
      <div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600"><CheckCircle2 size={24} /></span><h2 className="mt-4 text-sm font-semibold text-[var(--text)]">Onay bekleyen talep yok</h2><p className="mt-2 text-xs text-[var(--text-soft)]">Kendinize atanmış bekleyen tüm talepleri incelediniz.</p></div>
    </section>
  </div>;
}

export function TimeReportView({ onColumns, onExport, onNotice }: TableCallbacks) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  return <div className="self-managed-view view-stack">
    <SectionHeader eyebrow="YÖNETİM · SÜRE DAĞITIMI" title="Dağılım Raporu" actions={<button type="button" className="secondary-button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((value) => !value)}><Filter size={16} /> Filtrele</button>} />
    {filtersOpen ? <FilterPanel mode="report" /> : null}
    <DataTable model={REPORT_MODEL} showExport onColumns={onColumns} onExport={onExport} onNotice={onNotice} />
  </div>;
}
