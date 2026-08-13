"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Filter,
  RotateCcw,
  Save,
  Search,
  Send,
  SlidersHorizontal,
  Undo2,
  UserPlus,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { DataTable, type TableModel } from "./DataTable";
import { SectionHeader } from "./Ui";

type TableCallbacks = {
  onColumns?: () => void;
  onExport?: () => void;
  onNotice?: (message: string) => void;
};

type PersonRecord = {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  group: string;
  totalMinutes: number;
  assignedMinutes: number;
  areaIds: string[];
};

type AreaRecord = {
  id: string;
  name: string;
  peopleCount: number;
  totalMinutes: number;
  assignedMinutes: number;
};

type AssignmentRecord = {
  id: string;
  areaId: string;
  taskCode: string;
  taskLabel: string;
  peopleCount: number;
  minutes: number;
  timestamp: string;
  personDeltas: Record<string, number>;
  areaDelta: number;
};

const REPORT_MODEL: TableModel = {
  title: "Süre dağılımı kayıtları",
  searchLabel: "Personel, sicil veya görev kodu ara",
  total: 0,
  columns: ["Personel", "Personel Adı", "Personel Soyadı", "Sicil", "Pozisyon", "Firma", "Departman / Kısım", "Grup", "Personel Tipi", "Grup Yöneticisi", "Tarih", "Bölge", "Görev Kodu", "Onay Durumu", "Eylemler"],
  rows: [],
};

const INITIAL_PEOPLE: PersonRecord[] = [
  { id: "p1", name: "Ahmet Demir", initials: "AD", role: "Elektrik Teknisyeni", company: "Navbea Operasyon", group: "Elektrik", totalMinutes: 495, assignedMinutes: 420, areaIds: ["a", "b"] },
  { id: "p2", name: "Merve Kaya", initials: "MK", role: "Mekanik Teknisyeni", company: "Navbea Operasyon", group: "Mekanik", totalMinutes: 480, assignedMinutes: 480, areaIds: ["b", "d"] },
  { id: "p3", name: "Cemal Yıldız", initials: "CY", role: "Elektrik Taşeronu", company: "Atlas Teknik", group: "Elektrik", totalMinutes: 510, assignedMinutes: 455, areaIds: ["a", "c"] },
  { id: "p4", name: "Ali Yıldız", initials: "AY", role: "Saha Teknisyeni", company: "Atlas Teknik", group: "Saha", totalMinutes: 450, assignedMinutes: 360, areaIds: ["a", "kazi"] },
  { id: "p5", name: "Hasan Şahin", initials: "HŞ", role: "Elektrik Taşeronu", company: "Atlas Teknik", group: "Elektrik", totalMinutes: 525, assignedMinutes: 525, areaIds: ["c", "d"] },
  { id: "p6", name: "Selin Aksoy", initials: "SA", role: "İSG Uzmanı", company: "Navbea Operasyon", group: "İSG", totalMinutes: 480, assignedMinutes: 430, areaIds: ["kazi", "giris"] },
  { id: "p7", name: "Burak Koç", initials: "BK", role: "Depo Sorumlusu", company: "Navbea Operasyon", group: "Lojistik", totalMinutes: 465, assignedMinutes: 465, areaIds: ["malzeme"] },
  { id: "p8", name: "Zeynep Acar", initials: "ZA", role: "Saha Mühendisi", company: "Proline Yapı", group: "Saha", totalMinutes: 500, assignedMinutes: 410, areaIds: ["d", "giris"] },
];

const INITIAL_AREAS: AreaRecord[] = [
  { id: "a", name: "A BLOK", peopleCount: 32, totalMinutes: 720, assignedMinutes: 680 },
  { id: "b", name: "B BLOK", peopleCount: 28, totalMinutes: 650, assignedMinutes: 610 },
  { id: "c", name: "C BLOK", peopleCount: 18, totalMinutes: 590, assignedMinutes: 490 },
  { id: "kazi", name: "KAZI ALANI", peopleCount: 12, totalMinutes: 480, assignedMinutes: 400 },
  { id: "giris", name: "ŞANTİYE GİRİŞİ", peopleCount: 6, totalMinutes: 470, assignedMinutes: 400 },
  { id: "d", name: "D BLOK", peopleCount: 22, totalMinutes: 540, assignedMinutes: 510 },
  { id: "malzeme", name: "MALZEME SAHASI", peopleCount: 10, totalMinutes: 455, assignedMinutes: 455 },
];

const TASK_CODES = [
  { code: "ELK-001", label: "İç Aydınlatma" },
  { code: "ELK-002", label: "Kablo Taşıma" },
  { code: "ELK-003", label: "Pano Montajı" },
  { code: "ELK-004", label: "Priz Montajı" },
  { code: "BAK-005", label: "Topraklama" },
];

function formatMinutes(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const rest = safeMinutes % 60;
  if (!hours) return `${rest}dk`;
  return rest ? `${hours}s ${rest}dk` : `${hours}s`;
}

function completion(assigned: number, total: number) {
  return total ? Math.min(100, Math.round((assigned / total) * 100)) : 0;
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid min-w-0 gap-1.5 text-[11px] font-semibold text-[var(--text-soft)]"><span>{label}</span>{children}</label>;
}

function SelectField({ label, options = ["Hepsi"] }: { label: string; options?: string[] }) {
  return <FilterField label={label}><select className="h-10 min-w-0 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text)] outline-none transition focus:border-[var(--blue)]">{options.map((option) => <option key={option}>{option}</option>)}</select></FilterField>;
}

function ReportFilterPanel() {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState("");
  return <form ref={formRef} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] p-4 shadow-[var(--ring)]" onSubmit={(event) => { event.preventDefault(); setResult("Filtreler uygulandı · 24 kayıt bulundu."); }}>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SelectField label="Konum" options={["Tümü", "Merkez Kampüs", "Ana Bina"]} />
      <SelectField label="Bölge" options={["Tümü", "A Blok", "B Blok"]} />
      <SelectField label="Personel" />
      <SelectField label="Firma / Grup" />
      <SelectField label="Onay Durumu" />
      <SelectField label="Görev Etiketi (Direkt/Endirekt)" />
      <SelectField label="Disiplin" />
      <FilterField label="Tarih Aralığı"><input defaultValue="05.08.2026 00:00 – 05.08.2026 23:59" className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] outline-none transition focus:border-[var(--blue)]" /></FilterField>
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">{result ? <span className="mr-auto text-[11px] font-medium text-emerald-700 dark:text-emerald-300" role="status">{result}</span> : null}<button type="button" className="secondary-button" onClick={() => { formRef.current?.reset(); setResult("Filtreler sıfırlandı."); }}><RotateCcw size={15} /> Sıfırla</button><button type="submit" className="primary-button"><Search size={15} /> Filtrele</button></div>
  </form>;
}

function MatchingFilters({ advancedOpen, onAdvancedChange, onNotice }: { advancedOpen: boolean; onAdvancedChange: () => void; onNotice: (message: string) => void }) {
  return <section className="rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] p-4">
    <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(150px,.75fr)_minmax(190px,1fr)_minmax(150px,.75fr)_auto]">
      <FilterField label="Tarih"><input type="date" defaultValue="2026-08-05" className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] outline-none transition focus:border-[var(--blue)]" /></FilterField>
      <SelectField label="Konum / Harita" options={["Merkez Kampüs / Map 1", "Ana Bina", "B Blok"]} />
      <FilterField label="Min. Bölge Süresi (dk)"><input type="number" min="0" defaultValue="30" className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] outline-none transition focus:border-[var(--blue)]" /></FilterField>
      <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
        <button type="button" className="secondary-button flex-1" aria-expanded={advancedOpen} onClick={onAdvancedChange}><SlidersHorizontal size={15} /> Gelişmiş</button>
        <button type="button" className="primary-button flex-1" onClick={() => onNotice("Filtreler uygulandı · 8 personel, 7 alan bulundu.")}><Search size={15} /> Filtrele</button>
      </div>
    </div>
    {advancedOpen ? <div className="mt-4 border-t border-[var(--line)] pt-4">
      <div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-semibold text-[var(--text)]">Gelişmiş filtreler</p><p className="mt-0.5 text-[11px] text-[var(--text-soft)]">Personel ve görev kapsamını daraltın.</p></div><button type="button" className="secondary-button !h-9" onClick={() => onNotice("Gelişmiş filtreler sıfırlandı.")}><RotateCcw size={14} /> Sıfırla</button></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <SelectField label="Firma" options={["Hepsi", "Navbea Operasyon", "Atlas Teknik", "Proline Yapı"]} />
        <SelectField label="Departman / Kısım" />
        <SelectField label="Grup" options={["Hepsi", "Elektrik", "Mekanik", "Saha", "İSG", "Lojistik"]} />
        <SelectField label="Personel Ad Soyad" />
        <SelectField label="Personel Tipi" options={["Hepsi", "Çalışan", "Taşeron"]} />
        <SelectField label="Pozisyon" />
        <SelectField label="Grup Yöneticisi" />
        <SelectField label="Görev Kodu (İş Kodu)" options={["Hepsi", ...TASK_CODES.map((task) => `${task.code} · ${task.label}`)]} />
        <SelectField label="Tip (Direkt/Endirekt)" options={["Hepsi", "Direkt", "Endirekt"]} />
        <SelectField label="SAP Alan Kodu" />
        <SelectField label="Görev Adı" />
        <SelectField label="Disiplin" options={["Hepsi", "Elektrik", "Mekanik", "İnşaat"]} />
      </div>
    </div> : null}
  </section>;
}

function ProgressBar({ value, tone = "blue" }: { value: number; tone?: "blue" | "emerald" | "amber" | "rose" }) {
  const colors = { blue: "bg-blue-500", emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500" };
  return <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className={`h-full rounded-full transition-[width] ${colors[tone]}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

function SummaryStrip({ completedCount, incompleteCount, totalMinutes, assignedMinutes }: {
  completedCount: number;
  incompleteCount: number;
  totalMinutes: number;
  assignedMinutes: number;
}) {
  const progress = completion(assignedMinutes, totalMinutes);
  const missingMinutes = totalMinutes - assignedMinutes;
  return <section className="border-y border-[var(--line)] bg-[var(--surface-raised)] px-1 py-3">
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
      <div className="min-w-[270px] flex-1">
        <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold text-[var(--text)]">Günlük eşleştirme</p><p className="mt-0.5 text-[11px] text-[var(--text-soft)]">{formatMinutes(assignedMinutes)} / {formatMinutes(totalMinutes)}</p></div><strong className="text-base font-semibold text-[var(--text)]">%{progress}</strong></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full bg-[var(--blue)]" style={{ width: `${progress}%` }} /></div>
      </div>
      <dl className="grid flex-[1.15] grid-cols-3 divide-x divide-[var(--line)]">
        <div className="px-4"><dt className="text-[10px] text-[var(--text-soft)]">Tamamlanan</dt><dd className="mt-1 text-sm font-semibold text-[var(--text)]">{completedCount}</dd></div>
        <div className="px-4"><dt className="text-[10px] text-[var(--text-soft)]">İşlem bekleyen</dt><dd className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">{incompleteCount}</dd></div>
        <div className="px-4"><dt className="text-[10px] text-[var(--text-soft)]">Eksik süre</dt><dd className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">{formatMinutes(missingMinutes)}</dd></div>
      </dl>
    </div>
  </section>;
}

type MatchingStatus = "incomplete" | "completed" | "all";

function MatchingRosterPanel({ people, areas, selectedIds, query, group, areaFilter, statusFilter, counts, onQuery, onGroup, onAreaFilter, onStatusFilter, onToggle, onSelectAll, onDetail }: {
  people: PersonRecord[];
  areas: AreaRecord[];
  selectedIds: string[];
  query: string;
  group: string;
  areaFilter: string;
  statusFilter: MatchingStatus;
  counts: { incomplete: number; completed: number; all: number };
  onQuery: (value: string) => void;
  onGroup: (value: string) => void;
  onAreaFilter: (value: string) => void;
  onStatusFilter: (value: MatchingStatus) => void;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDetail: (id: string) => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const allSelected = people.length > 0 && people.every((person) => selectedIds.includes(person.id));
  const activeFilterCount = Number(group !== "all") + Number(areaFilter !== "all");
  const selectedAreaLabel = areas.find((area) => area.id === areaFilter)?.name;
  const tabItems: Array<{ id: MatchingStatus; label: string; count: number }> = [
    { id: "incomplete", label: "Eksik", count: counts.incomplete },
    { id: "completed", label: "Tamamlanan", count: counts.completed },
    { id: "all", label: "Tümü", count: counts.all },
  ];
  return <section className="min-w-0 rounded-xl border border-[var(--line)] bg-[var(--surface-raised)]">
    <div className="relative flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line)] px-4 pt-3.5">
      <div className="flex items-end gap-1" role="tablist" aria-label="Eşleştirme durumu">
        {tabItems.map((item) => <button key={item.id} type="button" role="tab" aria-selected={statusFilter === item.id} className={`border-b-2 px-3 pb-3 text-[11px] font-semibold transition ${statusFilter === item.id ? "border-[var(--blue)] text-[var(--blue)]" : "border-transparent text-[var(--text-soft)] hover:text-[var(--text)]"}`} onClick={() => onStatusFilter(item.id)}>{item.label} <span className="ml-1 tabular-nums text-[10px] opacity-70">{item.count}</span></button>)}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 pb-3">
        <p className="hidden whitespace-nowrap text-[10px] text-[var(--text-soft)] 2xl:block">{people.length} sonuç · {selectedIds.length} seçili</p>
        <label className="flex h-9 w-full min-w-[170px] max-w-[230px] items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 focus-within:border-[var(--blue)]"><Search size={14} className="shrink-0 text-[var(--text-soft)]" /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Personel ara" className="min-w-0 flex-1 bg-transparent text-[11px] text-[var(--text)] outline-none placeholder:text-[var(--text-soft)]" /></label>
        <div className="relative shrink-0">
          <button type="button" aria-expanded={filterOpen} aria-controls="matching-list-filters" className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-[10px] font-semibold transition ${filterOpen || activeFilterCount ? "border-[var(--blue)] bg-[var(--blue-soft)] text-[var(--blue)]" : "border-[var(--line)] bg-[var(--surface)] text-[var(--text-soft)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"}`} onClick={() => setFilterOpen((value) => !value)}><Filter size={14} /> Filtreler{activeFilterCount ? <span className="grid size-4 place-items-center rounded-full bg-[var(--blue)] text-[9px] text-white">{activeFilterCount}</span> : null}</button>
          {filterOpen ? <div id="matching-list-filters" role="dialog" aria-label="Liste filtreleri" className="absolute right-0 top-[calc(100%+8px)] z-30 w-[280px] rounded-xl border border-[var(--line-strong)] bg-[var(--surface-raised)] shadow-[0_18px_48px_rgba(17,27,43,.16)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3"><div><p className="text-[11px] font-semibold text-[var(--text)]">Liste filtreleri</p><p className="mt-0.5 text-[9px] text-[var(--text-soft)]">Gösterilen personelleri daraltın.</p></div><button type="button" aria-label="Liste filtrelerini kapat" className="grid size-7 place-items-center rounded-md text-[var(--text-soft)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]" onClick={() => setFilterOpen(false)}><X size={14} /></button></div>
            <div className="space-y-3 p-4"><FilterField label="Personel grubu"><select value={group} onChange={(event) => onGroup(event.target.value)} aria-label="Gruba göre filtrele" className="h-10 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-[11px] text-[var(--text)] outline-none focus:border-[var(--blue)]"><option value="all">Tüm gruplar</option><option>Elektrik</option><option>Mekanik</option><option>Saha</option><option>İSG</option><option>Lojistik</option></select></FilterField><FilterField label="Çalışma alanı"><select value={areaFilter} onChange={(event) => onAreaFilter(event.target.value)} aria-label="Alana göre filtrele" className="h-10 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-[11px] text-[var(--text)] outline-none focus:border-[var(--blue)]"><option value="all">Tüm alanlar</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></FilterField></div>
            <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-3"><button type="button" disabled={!activeFilterCount} className="text-[10px] font-semibold text-[var(--text-soft)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40" onClick={() => { onGroup("all"); onAreaFilter("all"); }}>Temizle</button><button type="button" className="h-8 rounded-lg bg-[var(--blue)] px-3 text-[10px] font-semibold text-white" onClick={() => setFilterOpen(false)}>Tamam</button></div>
          </div> : null}
        </div>
      </div>
    </div>
    {activeFilterCount ? <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2"><span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">Aktif filtreler</span>{group !== "all" ? <button type="button" className="inline-flex h-6 items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-[9px] font-medium text-[var(--text)]" onClick={() => onGroup("all")}>{group}<X size={10} /></button> : null}{areaFilter !== "all" ? <button type="button" className="inline-flex h-6 items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-[9px] font-medium text-[var(--text)]" onClick={() => onAreaFilter("all")}>{selectedAreaLabel}<X size={10} /></button> : null}<button type="button" className="ml-auto text-[9px] font-semibold text-[var(--blue)]" onClick={() => { onGroup("all"); onAreaFilter("all"); }}>Tümünü temizle</button></div> : null}
    <div className="max-h-[590px] overflow-auto">
      <table className="w-full min-w-[790px] border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-[var(--surface-soft)] text-[var(--text-soft)]"><tr><th className="w-11 px-4 py-3"><input type="checkbox" aria-label="Görünen personelleri seç" checked={allSelected} onChange={onSelectAll} className="size-4 accent-blue-600" /></th><th className="px-3 py-3 text-[10px] font-semibold">Personel</th><th className="px-3 py-3 text-[10px] font-semibold">Alan</th><th className="px-3 py-3 text-[10px] font-semibold">Planlanan</th><th className="min-w-[135px] px-3 py-3 text-[10px] font-semibold">Eşleştirilen</th><th className="px-3 py-3 text-[10px] font-semibold">Eksik</th><th className="px-4 py-3 text-[10px] font-semibold">Durum</th></tr></thead>
        <tbody>{people.map((person) => {
          const isSelected = selectedIds.includes(person.id);
          const progress = completion(person.assignedMinutes, person.totalMinutes);
          const missing = Math.max(0, person.totalMinutes - person.assignedMinutes);
          const personAreas = person.areaIds.map((id) => areas.find((area) => area.id === id)?.name).filter(Boolean);
          return <tr key={person.id} className={`border-t border-[var(--line)] transition hover:bg-[var(--surface-soft)] ${isSelected ? "bg-blue-500/[0.045] shadow-[inset_2px_0_var(--blue)]" : ""}`}>
            <td className="px-4 py-3.5"><input type="checkbox" aria-label={`${person.name} seç`} checked={isSelected} onChange={() => onToggle(person.id)} className="size-4 accent-blue-600" /></td>
            <td className="px-3 py-3.5"><button type="button" className="group flex items-center gap-2.5 text-left" onClick={() => onDetail(person.id)}><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--surface-muted)] text-[10px] font-semibold text-[var(--text-soft)]">{person.initials}</span><span><span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--text)]">{person.name}<ChevronRight size={12} className="opacity-0 transition group-hover:opacity-60" /></span><span className="mt-0.5 block text-[9px] text-[var(--text-soft)]">{person.role}</span></span></button></td>
            <td className="px-3 py-3.5 text-[10px] text-[var(--text-soft)]"><span className="block font-medium text-[var(--text)]">{personAreas[0]}</span>{personAreas.length > 1 ? <span className="mt-0.5 block">+{personAreas.length - 1} alan</span> : null}</td>
            <td className="px-3 py-3.5 text-[11px] font-medium tabular-nums text-[var(--text)]">{formatMinutes(person.totalMinutes)}</td>
            <td className="px-3 py-3.5"><div className="flex items-center justify-between gap-2 text-[10px]"><span className="font-medium tabular-nums text-[var(--text)]">{formatMinutes(person.assignedMinutes)}</span><span className="text-[var(--text-soft)]">%{progress}</span></div><div className="mt-1.5"><ProgressBar value={progress} tone={missing ? "blue" : "emerald"} /></div></td>
            <td className={`px-3 py-3.5 text-[11px] font-semibold tabular-nums ${missing ? "text-amber-700 dark:text-amber-300" : "text-[var(--text-faint)]"}`}>{missing ? formatMinutes(missing) : "—"}</td>
            <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${missing ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"}`}><span className={`size-1.5 rounded-full ${missing ? "bg-amber-500" : "bg-emerald-500"}`} />{missing ? "Eksik" : "Tamam"}</span></td>
          </tr>;
        })}</tbody>
      </table>
      {!people.length ? <div className="grid min-h-44 place-items-center px-4 text-center text-[11px] text-[var(--text-soft)]">Arama ölçütlerine uygun personel yok.</div> : null}
    </div>
  </section>;
}

function AssignmentWorkflowPanel({ areas, selectedAreaId, selectedPeople, taskCode, duration, recentAssignments, missingMinutes, incompleteCount, approver, notice, onArea, onTask, onDuration, onFillRemaining, onApply, onUndo, onApprover, onDraft, onSubmit, onShowIncomplete }: {
  areas: AreaRecord[];
  selectedAreaId: string;
  selectedPeople: PersonRecord[];
  taskCode: string;
  duration: string;
  recentAssignments: AssignmentRecord[];
  missingMinutes: number;
  incompleteCount: number;
  approver: string;
  notice: string;
  onArea: (value: string) => void;
  onTask: (value: string) => void;
  onDuration: (value: string) => void;
  onFillRemaining: () => void;
  onApply: () => void;
  onUndo: () => void;
  onApprover: (value: string) => void;
  onDraft: () => void;
  onSubmit: () => void;
  onShowIncomplete: () => void;
}) {
  const selectedMissing = selectedPeople.reduce((sum, person) => sum + Math.max(0, person.totalMinutes - person.assignedMinutes), 0);
  return <aside className="space-y-3 xl:sticky xl:top-[128px]">
    <section className="rounded-xl border border-[var(--line)] bg-[var(--surface-raised)]">
      <div className="border-b border-[var(--line)] px-4 py-3.5"><p className="text-xs font-semibold text-[var(--text)]">Atama oluştur</p><p className="mt-0.5 text-[10px] text-[var(--text-soft)]">Seçtiğiniz personele görev süresi ekleyin.</p></div>
      {!selectedPeople.length ? <div className="grid min-h-52 place-items-center p-6 text-center"><div><span className="mx-auto grid size-10 place-items-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-soft)]"><UserPlus size={17} /></span><p className="mt-3 text-[11px] font-semibold text-[var(--text)]">Henüz personel seçilmedi</p><p className="mt-1 max-w-[220px] text-[10px] leading-5 text-[var(--text-soft)]">Atama oluşturmak için çalışma tablosundan bir veya daha fazla personel seçin.</p></div></div> : <>
      <div className="border-b border-[var(--line)] px-4 py-3"><div className="flex items-center justify-between"><span className="text-[10px] text-[var(--text-soft)]">Seçim özeti</span><strong className="text-xs font-semibold text-[var(--text)]">{selectedPeople.length} kişi</strong></div><p className="mt-1.5 truncate text-[10px] text-[var(--text)]">{selectedPeople.slice(0, 2).map((person) => person.name).join(", ")}{selectedPeople.length > 2 ? ` +${selectedPeople.length - 2}` : ""}</p><div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-2 text-[10px]"><span className="text-[var(--text-soft)]">Toplam eksik süre</span><strong className="text-amber-700 dark:text-amber-300">{formatMinutes(selectedMissing)}</strong></div></div>
      <div className="space-y-3 p-4">
        <FilterField label="Alan"><select value={selectedAreaId} onChange={(event) => onArea(event.target.value)} className="h-10 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--blue)]">{areas.map((area) => <option value={area.id} key={area.id}>{area.name}</option>)}</select></FilterField>
        <FilterField label="Görev kodu"><select value={taskCode} onChange={(event) => onTask(event.target.value)} className="h-10 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--blue)]"><option value="">Görev kodu seçin</option>{TASK_CODES.map((task) => <option value={task.code} key={task.code}>{task.code} · {task.label}</option>)}</select></FilterField>
        <FilterField label="Kişi başı süre (dk)"><div className="grid grid-cols-[1fr_auto] gap-2"><input type="number" min="1" value={duration} onChange={(event) => onDuration(event.target.value)} placeholder="Örn. 45" className="h-10 min-w-0 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] outline-none focus:border-[var(--blue)]" /><button type="button" className="rounded-lg border border-[var(--line)] px-2.5 text-[10px] font-medium text-[var(--text-soft)] hover:border-[var(--line-strong)] hover:text-[var(--text)]" onClick={onFillRemaining}>Kalanı kullan</button></div></FilterField>
        {duration ? <div className="rounded-lg bg-[var(--surface-soft)] px-3 py-2.5 text-[10px] leading-5 text-[var(--text-soft)]"><strong className="text-[var(--text)]">Atama önizlemesi:</strong> Her personel için en fazla {formatMinutes(Number(duration) || 0)} atanacak; kişinin kalan süresi aşılmayacak.</div> : null}
        <button type="button" className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--blue)] px-4 text-xs font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40" disabled={!selectedPeople.length || !taskCode || !duration} onClick={onApply}><Check size={14} /> Atamayı uygula</button>
      </div>
      </>}
    </section>

    {recentAssignments.length ? <section className="rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] p-3.5">
      <div className="flex items-center justify-between"><p className="text-xs font-semibold text-[var(--text)]">Son atamalar</p>{recentAssignments.length ? <button type="button" onClick={onUndo} className="flex items-center gap-1 text-[9px] font-semibold text-[var(--blue)]"><Undo2 size={12} /> Sonuncuyu geri al</button> : null}</div>
      <div className="mt-3 space-y-2">{recentAssignments.slice(0, 3).map((assignment) => <div key={assignment.id} className="rounded-lg bg-[var(--surface-muted)] p-2.5"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-[var(--text)]">{areas.find((area) => area.id === assignment.areaId)?.name} → {assignment.taskLabel}</p><p className="mt-0.5 text-[9px] text-[var(--text-soft)]">{assignment.peopleCount} kişi · {formatMinutes(assignment.minutes)} kişi başı</p></div><span className="shrink-0 text-[8px] text-[var(--text-soft)]">{assignment.timestamp}</span></div></div>)}</div>
    </section> : null}

    <section className="rounded-xl border border-[var(--line)] bg-[var(--surface-raised)]">
      <div className="border-b border-[var(--line)] px-4 py-3.5"><p className="text-xs font-semibold text-[var(--text)]">Onay süreci</p><p className="mt-0.5 text-[10px] text-[var(--text-soft)]">{notice}</p></div>
      <div className="space-y-3 p-4"><div className={`flex gap-2.5 rounded-lg px-3 py-2.5 ${missingMinutes ? "bg-amber-500/[0.08]" : "bg-emerald-500/[0.08]"}`}><span className={missingMinutes ? "text-amber-600" : "text-emerald-600"}>{missingMinutes ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}</span><div><p className="text-[10px] font-semibold text-[var(--text)]">{missingMinutes ? `${incompleteCount} personelde eksik süre var` : "Tüm süreler eşleştirildi"}</p><p className="mt-0.5 text-[9px] text-[var(--text-soft)]">{missingMinutes ? `Toplam ${formatMinutes(missingMinutes)} tamamlanmalı.` : "Kayıtlar onaya gönderilmeye hazır."}</p>{missingMinutes ? <button type="button" className="mt-1 text-[9px] font-semibold text-[var(--blue)] hover:underline" onClick={onShowIncomplete}>Eksikleri göster</button> : null}</div></div>
        <select aria-label="Tüm bölgeler için onaylayan" value={approver} onChange={(event) => onApprover(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-[10px] font-medium text-[var(--text)] outline-none focus:border-[var(--blue)]"><option value="">Onaylayan seçin</option><option value="mehmet">Mehmet Yılmaz</option><option value="ayse">Ayşe Kara</option></select>
        <div className="grid grid-cols-2 gap-2"><button type="button" className="flex h-10 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 text-[9.5px] font-medium text-[var(--text)] hover:border-[var(--line-strong)]" onClick={onDraft}><Save size={13} /> Taslağı kaydet</button><button type="button" className="flex h-10 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--blue)] px-2 text-[9.5px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40" disabled={missingMinutes > 0 || !approver} onClick={onSubmit}><Send size={13} /> Onaya gönder</button></div>
      </div>
    </section>
  </aside>;
}

function PersonDetailDrawer({ person, areas, onClose }: { person: PersonRecord | null; areas: AreaRecord[]; onClose: () => void }) {
  if (!person) return null;
  const missing = person.totalMinutes - person.assignedMinutes;
  const progress = completion(person.assignedMinutes, person.totalMinutes);
  return <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label={`${person.name} süre detayları`}>
    <button type="button" aria-label="Detay penceresini kapat" className="absolute inset-0 cursor-default bg-slate-950/30 backdrop-blur-[2px]" onClick={onClose} />
    <aside className="relative h-full w-full max-w-sm overflow-y-auto border-l border-[var(--line)] bg-[var(--surface-raised)] p-5 shadow-2xl"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-blue-600 text-xs font-bold text-white">{person.initials}</span><div><p className="text-sm font-semibold text-[var(--text)]">{person.name}</p><p className="mt-0.5 text-[10px] text-[var(--text-soft)]">{person.role}</p></div></div><button type="button" aria-label="Detayı kapat" className="grid size-9 place-items-center rounded-xl border border-[var(--line)] text-[var(--text-soft)] hover:text-[var(--text)]" onClick={onClose}><X size={16} /></button></div>
      <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><div className="flex items-end justify-between"><div><p className="text-[10px] font-semibold text-[var(--text-soft)]">Eşleştirilen süre</p><p className="mt-1 text-xl font-semibold text-[var(--text)]">{formatMinutes(person.assignedMinutes)}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${missing ? "bg-amber-500/10 text-amber-600 dark:text-amber-300" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"}`}>{missing ? `${formatMinutes(missing)} eksik` : "Tamamlandı"}</span></div><div className="mt-4"><ProgressBar value={progress} tone={missing ? "amber" : "emerald"} /></div><div className="mt-2 flex justify-between text-[9px] text-[var(--text-soft)]"><span>%{progress} tamamlandı</span><span>Toplam {formatMinutes(person.totalMinutes)}</span></div></div>
      <div className="mt-6"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)]">İlgili alanlar</p><div className="mt-2 space-y-2">{person.areaIds.map((areaId) => { const area = areas.find((candidate) => candidate.id === areaId); if (!area) return null; return <div key={area.id} className="rounded-xl border border-[var(--line)] p-3"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-[var(--text)]">{area.name}</span><span className="text-[9px] font-semibold text-[var(--text-soft)]">%{completion(area.assignedMinutes, area.totalMinutes)}</span></div><div className="mt-2"><ProgressBar value={completion(area.assignedMinutes, area.totalMinutes)} /></div></div>; })}</div></div>
      <div className="mt-6 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[var(--surface-muted)] p-3"><p className="text-[9px] text-[var(--text-soft)]">Firma</p><p className="mt-1 text-[10px] font-semibold text-[var(--text)]">{person.company}</p></div><div className="rounded-xl bg-[var(--surface-muted)] p-3"><p className="text-[9px] text-[var(--text-soft)]">Grup</p><p className="mt-1 text-[10px] font-semibold text-[var(--text)]">{person.group}</p></div></div>
    </aside>
  </div>;
}

export function TimeMatchingView() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [areas, setAreas] = useState(INITIAL_AREAS);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState("a");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<MatchingStatus>("incomplete");
  const [taskCode, setTaskCode] = useState("");
  const [duration, setDuration] = useState("");
  const [recentAssignments, setRecentAssignments] = useState<AssignmentRecord[]>([]);
  const [detailPersonId, setDetailPersonId] = useState<string | null>(null);
  const [approver, setApprover] = useState("");
  const [notice, setNotice] = useState("Kayıtlar hazır. Eksik süreleri tamamlayarak onaya gönderebilirsiniz.");

  const filteredPeople = useMemo(() => people.filter((person) => {
    const matchesQuery = `${person.name} ${person.role} ${person.company}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"));
    const matchesGroup = group === "all" || person.group === group;
    const matchesArea = areaFilter === "all" || person.areaIds.includes(areaFilter);
    const isCompleted = person.assignedMinutes >= person.totalMinutes;
    const matchesStatus = statusFilter === "all" || (statusFilter === "completed" ? isCompleted : !isCompleted);
    return matchesQuery && matchesGroup && matchesArea && matchesStatus;
  }), [people, query, group, areaFilter, statusFilter]);

  const selectedPeople = people.filter((person) => selectedPersonIds.includes(person.id));
  const totalMinutes = people.reduce((sum, person) => sum + person.totalMinutes, 0);
  const assignedMinutes = people.reduce((sum, person) => sum + person.assignedMinutes, 0);
  const missingMinutes = totalMinutes - assignedMinutes;
  const completedCount = people.filter((person) => person.assignedMinutes >= person.totalMinutes).length;
  const incompleteCount = people.length - completedCount;
  const detailPerson = people.find((person) => person.id === detailPersonId) ?? null;

  function togglePerson(id: string) {
    if (!selectedPersonIds.includes(id) && selectedPersonIds.length === 0) {
      const firstArea = people.find((person) => person.id === id)?.areaIds[0];
      if (firstArea) setSelectedAreaId(firstArea);
    }
    setSelectedPersonIds((current) => current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id]);
  }

  function toggleAllVisible() {
    const visibleIds = filteredPeople.map((person) => person.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedPersonIds.includes(id));
    setSelectedPersonIds((current) => allSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
  }

  function fillRemaining() {
    const remaining = selectedPeople.map((person) => person.totalMinutes - person.assignedMinutes).filter((value) => value > 0);
    if (!remaining.length) {
      setNotice("Seçili personellerin eksik süresi bulunmuyor.");
      return;
    }
    setDuration(String(Math.max(...remaining)));
    setNotice("Her personelin kendi kalan süresi kullanılacak şekilde süre dolduruldu.");
  }

  function applyAssignment() {
    const requestedMinutes = Number(duration);
    const selectedTask = TASK_CODES.find((task) => task.code === taskCode);
    const selectedArea = areas.find((area) => area.id === selectedAreaId);
    if (!selectedPeople.length || !selectedTask || !selectedArea || !Number.isFinite(requestedMinutes) || requestedMinutes <= 0) {
      setNotice("Atama için alan, personel, görev kodu ve geçerli süre seçin.");
      return;
    }

    let availableAreaMinutes = Math.max(0, selectedArea.totalMinutes - selectedArea.assignedMinutes);
    const personDeltas: Record<string, number> = {};
    for (const person of selectedPeople) {
      const remaining = Math.max(0, person.totalMinutes - person.assignedMinutes);
      const delta = Math.min(requestedMinutes, remaining, availableAreaMinutes);
      if (delta > 0) {
        personDeltas[person.id] = delta;
        availableAreaMinutes -= delta;
      }
    }
    const areaDelta = Object.values(personDeltas).reduce((sum, value) => sum + value, 0);
    if (!areaDelta) {
      setNotice("Seçilen alan veya personeller için atanabilir eksik süre kalmadı.");
      return;
    }

    setPeople((current) => current.map((person) => personDeltas[person.id] ? { ...person, assignedMinutes: person.assignedMinutes + personDeltas[person.id] } : person));
    setAreas((current) => current.map((area) => area.id === selectedAreaId ? { ...area, assignedMinutes: area.assignedMinutes + areaDelta } : area));
    setRecentAssignments((current) => [{ id: `${Date.now()}`, areaId: selectedAreaId, taskCode, taskLabel: selectedTask.label, peopleCount: Object.keys(personDeltas).length, minutes: requestedMinutes, timestamp: new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date()), personDeltas, areaDelta }, ...current]);
    setDuration("");
    setNotice(`${selectedTask.label} görevi ${Object.keys(personDeltas).length} personele atandı.`);
  }

  function undoLastAssignment() {
    const latest = recentAssignments[0];
    if (!latest) return;
    setPeople((current) => current.map((person) => latest.personDeltas[person.id] ? { ...person, assignedMinutes: Math.max(0, person.assignedMinutes - latest.personDeltas[person.id]) } : person));
    setAreas((current) => current.map((area) => area.id === latest.areaId ? { ...area, assignedMinutes: Math.max(0, area.assignedMinutes - latest.areaDelta) } : area));
    setRecentAssignments((current) => current.slice(1));
    setNotice("Son atama geri alındı.");
  }

  const statusCounts = { incomplete: incompleteCount, completed: completedCount, all: people.length };

  return <div className="self-managed-view view-stack" style={{ animation: "none" }}>
    <SectionHeader eyebrow="YÖNETİM · SÜRE DAĞITIMI" title="Süre Eşleştirme" description="05 Ağustos 2026 · Merkez Kampüs / Map 1" actions={<button type="button" className="secondary-button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((value) => !value)}><SlidersHorizontal size={16} /> {filtersOpen ? "Kapsamı gizle" : "Kapsam"}</button>} />
    {filtersOpen ? <MatchingFilters advancedOpen={advancedFiltersOpen} onAdvancedChange={() => setAdvancedFiltersOpen((value) => !value)} onNotice={setNotice} /> : null}

    <SummaryStrip completedCount={completedCount} incompleteCount={incompleteCount} totalMinutes={totalMinutes} assignedMinutes={assignedMinutes} />

    <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
      <MatchingRosterPanel people={filteredPeople} areas={areas} selectedIds={selectedPersonIds} query={query} group={group} areaFilter={areaFilter} statusFilter={statusFilter} counts={statusCounts} onQuery={setQuery} onGroup={setGroup} onAreaFilter={setAreaFilter} onStatusFilter={setStatusFilter} onToggle={togglePerson} onSelectAll={toggleAllVisible} onDetail={setDetailPersonId} />
      <AssignmentWorkflowPanel areas={areas} selectedAreaId={selectedAreaId} selectedPeople={selectedPeople} taskCode={taskCode} duration={duration} recentAssignments={recentAssignments} missingMinutes={missingMinutes} incompleteCount={incompleteCount} approver={approver} notice={notice} onArea={setSelectedAreaId} onTask={setTaskCode} onDuration={setDuration} onFillRemaining={fillRemaining} onApply={applyAssignment} onUndo={undoLastAssignment} onApprover={setApprover} onDraft={() => setNotice("Taslak kaydedildi.")} onSubmit={() => setNotice("Tüm süre dağılımları onaya gönderildi.")} onShowIncomplete={() => { setStatusFilter("incomplete"); setNotice("Eksik süreli personeller listelendi."); }} />
    </div>

    <PersonDetailDrawer person={detailPerson} areas={areas} onClose={() => setDetailPersonId(null)} />
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
    {filtersOpen ? <ReportFilterPanel /> : null}
    <DataTable model={REPORT_MODEL} showExport onColumns={onColumns} onExport={onExport} onNotice={onNotice} />
  </div>;
}
