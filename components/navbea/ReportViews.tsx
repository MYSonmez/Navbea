"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Clock3,
  Download,
  Eye,
  FileBarChart,
  Gauge,
  MapPin,
  MapPinned,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  UserRoundPlus,
  Wrench,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "./Ui";

type ReportCallbacks = {
  onExport?: () => void;
  onNotice?: (message: string) => void;
};

type FilterField = {
  label: string;
  options?: string[];
  value?: string;
  kind?: "date" | "month" | "time";
};

type FilterValues = Record<string, string>;
type FilterRules = Record<string, (row: string[], value: string) => boolean>;

type ReportTableModel = {
  title: string;
  columns: string[];
  rows: string[][];
  exportable?: boolean;
  action?: "map" | "view" | "menu";
};

type SortState = { column: number; direction: "desc" | "asc" } | null;

const COLORS = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b"];
const collator = new Intl.Collator("tr", { numeric: true, sensitivity: "base" });
const ALL_FILTER_VALUES = new Set(["Tümü", "Tümünü Seç", "Tüm"]);

function getFilterDefaults(fields: FilterField[]): FilterValues {
  return Object.fromEntries(fields.map((field) => [field.label, field.value ?? field.options?.[0] ?? "Tümünü Seç"]));
}

function isInactiveFilter(value: string) {
  return !value || ALL_FILTER_VALUES.has(value);
}

function normalize(value: string) {
  return value.toLocaleLowerCase("tr").replaceAll("ı", "i");
}

function parseRange(value: string): [string, string] {
  if (value.includes("|")) return value.split("|").slice(0, 2) as [string, string];
  const dates = [...value.matchAll(/(\d{2})\.(\d{2})\.(\d{4})/g)].map((match) => `${match[3]}-${match[2]}-${match[1]}`);
  return [dates[0] ?? "2026-08-05", dates[1] ?? dates[0] ?? "2026-08-05"];
}

function rowDate(row: string[]) {
  for (const cell of row) {
    const tr = cell.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (tr) return `${tr[3]}-${tr[2]}-${tr[1]}`;
    const iso = cell.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }
  return "";
}

function filterRows(rows: string[][], values: FilterValues, rules: FilterRules) {
  return rows.filter((row) => Object.entries(values).every(([label, value]) => {
    if (isInactiveFilter(value) || label === "Ay" || label === "Minimum Süre") return true;
    if (label === "Tarih Aralığı") {
      const date = rowDate(row);
      const [start, end] = parseRange(value);
      return !date || (date >= start && date <= end);
    }
    return rules[label]?.(row, value) ?? true;
  }));
}

function useReportFilters(fields: FilterField[], model: ReportTableModel, rules: FilterRules) {
  const [filters, setFilters] = useState<FilterValues>(() => getFilterDefaults(fields));
  const filteredModel = useMemo(() => ({ ...model, rows: filterRows(model.rows, filters, rules) }), [filters, model, rules]);
  return { filters, setFilters, filteredModel };
}

const PERSONNEL_ALARMS: ReportTableModel = {
  title: "Alarmlar",
  columns: ["#", "Tarih", "Alarm", "Ad Soyad", "Bölge", "Kat"],
  rows: [
    ["1", "05.08.2026 14:38", "Yetkisiz alan girişi", "Mustafa Aydın", "Teknik Alan", "2. Kat"],
    ["2", "05.08.2026 11:22", "Hareketsizlik", "Merve Kaya", "Ofis 10", "2. Kat"],
    ["3", "05.08.2026 09:06", "Bölge dışı hareket", "Ahmet Demir", "Kuzey Kapı", "Zemin"],
  ],
  exportable: true,
};

const PERSONNEL_MOVEMENTS: ReportTableModel = {
  title: "Hareketler",
  columns: ["#", "Giriş", "Çıkış", "Ad Soyad", "Bölge", "Kat", "Süre"],
  rows: [
    ["1", "05.08.2026 08:04", "05.08.2026 10:42", "Mustafa Aydın", "Ofis 10", "2. Kat", "02:38:00"],
    ["2", "05.08.2026 09:12", "05.08.2026 11:34", "Merve Kaya", "Toplantı Odası", "1. Kat", "02:22:00"],
    ["3", "05.08.2026 10:01", "05.08.2026 12:18", "Ahmet Demir", "Teknik Alan", "2. Kat", "02:17:00"],
  ],
  exportable: true,
};

const AREA_DURATION: ReportTableModel = {
  title: "Bölgede Geçirilen Süreler",
  columns: ["#", "Bölge", "Kat", "Ad Soyad", "Süre"],
  rows: [
    ["1", "Ofis 10", "2. Kat", "Mustafa Aydın", "05:42:18"],
    ["2", "Teknik Alan", "2. Kat", "Ahmet Demir", "04:18:42"],
    ["3", "Toplantı Odası", "1. Kat", "Merve Kaya", "03:56:11"],
  ],
  exportable: true,
};

const PERSON_DURATION: ReportTableModel = {
  title: "Kişi/Cihaza Göre Geçirilen Zaman",
  columns: ["#", "Ad Soyad", "Süre"],
  rows: [
    ["1", "Mustafa Aydın", "08:12:32"],
    ["2", "Merve Kaya", "07:48:19"],
    ["3", "Ahmet Demir", "07:36:44"],
  ],
};

const INACTIVE_PERSONNEL: ReportTableModel = {
  title: "Hareketsiz Personel (Kart Kullanmayan)",
  columns: ["#", "Ad Soyad", "Bölge", "Kat", "Harita", "Giriş", "Hareketsiz (saat)"],
  rows: [
    ["1", "Selin Yılmaz", "Depo", "Zemin", "Merkez Kampüs", "05.08.2026 08:16", "03:24"],
    ["2", "Can Öz", "Teknik Alan", "2. Kat", "Merkez Kampüs", "05.08.2026 09:02", "02:11"],
  ],
};

const INACTIVITY: ReportTableModel = {
  title: "Hareketsizlik Süreleri",
  columns: ["#", "Ad Soyad", "Süre", "Alarm Sayısı", "Bölge", "Kat", "Harita"],
  rows: [
    ["1", "Merve Kaya", "01:24:16", "2", "Ofis 10", "2. Kat", "Merkez Kampüs"],
    ["2", "Ahmet Demir", "00:48:32", "1", "Teknik Alan", "2. Kat", "Merkez Kampüs"],
  ],
};

const ANALYTICS_CHART = [
  { name: "Ofis 10", value: 42 },
  { name: "Teknik", value: 34 },
  { name: "Toplantı", value: 26 },
  { name: "Depo", value: 18 },
];

const ENTITY_VISUALS: Record<string, {
  areas: { name: string; value: number }[];
  floors: { name: string; value: number }[];
  trend: { name: string; value: number }[];
  names: string[];
}> = {
  Personel: {
    areas: [{ name: "Ofis 10", value: 42 }, { name: "Teknik Alan", value: 34 }, { name: "Toplantı Odası", value: 26 }, { name: "Depo", value: 18 }],
    floors: [{ name: "Zemin", value: 38 }, { name: "1. Kat", value: 31 }, { name: "2. Kat", value: 47 }, { name: "3. Kat", value: 19 }],
    trend: [{ name: "08:00", value: 28 }, { name: "10:00", value: 62 }, { name: "12:00", value: 78 }, { name: "14:00", value: 71 }, { name: "16:00", value: 54 }, { name: "18:00", value: 22 }],
    names: ["Mustafa Aydın", "Merve Kaya", "Ahmet Demir", "Selin Yılmaz"],
  },
  Misafir: {
    areas: [{ name: "Ana Giriş", value: 19 }, { name: "Toplantı Odası", value: 14 }, { name: "Lobi", value: 11 }, { name: "Teknik Alan", value: 6 }],
    floors: [{ name: "Zemin", value: 24 }, { name: "1. Kat", value: 15 }, { name: "2. Kat", value: 8 }, { name: "3. Kat", value: 3 }],
    trend: [{ name: "08:00", value: 3 }, { name: "10:00", value: 12 }, { name: "12:00", value: 18 }, { name: "14:00", value: 15 }, { name: "16:00", value: 9 }, { name: "18:00", value: 2 }],
    names: ["Deniz Akın", "Zeynep Erol", "Can Öz", "Elif Koç"],
  },
  Ekipman: {
    areas: [{ name: "Üretim Hattı", value: 52 }, { name: "Depo", value: 41 }, { name: "Teknik Alan", value: 29 }, { name: "Bakım Alanı", value: 17 }],
    floors: [{ name: "Zemin", value: 74 }, { name: "1. Kat", value: 32 }, { name: "2. Kat", value: 21 }, { name: "3. Kat", value: 12 }],
    trend: [{ name: "08:00", value: 34 }, { name: "10:00", value: 57 }, { name: "12:00", value: 69 }, { name: "14:00", value: 63 }, { name: "16:00", value: 48 }, { name: "18:00", value: 27 }],
    names: ["Forklift 07", "Termal Kamera 03", "Jeneratör 02", "Ölçüm Cihazı 11"],
  },
};

function PageTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return <PageHeader eyebrow="RAPORLAR · MERKEZ KAMPÜS" title={title} actions={action} />;
}

function FilterDock({ fields, onApply, resultCount }: { fields: FilterField[]; onApply?: (values: FilterValues) => void; resultCount?: number }) {
  const [open, setOpen] = useState(true);
  const defaults = useMemo(() => getFilterDefaults(fields), [fields]);
  const [values, setValues] = useState<FilterValues>(() => defaults);
  const [applied, setApplied] = useState(false);
  const activeFilters = Object.entries(values).filter(([label, value]) => !isInactiveFilter(value) && !["Tarih Aralığı", "Ay", "Minimum Süre"].includes(label));
  const changeValue = (label: string, value: string) => setValues((current) => ({ ...current, [label]: value }));
  const apply = () => { onApply?.(values); setApplied(true); };
  const reset = () => { setValues(defaults); onApply?.(defaults); setApplied(false); };
  return <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--panel-shadow)]">
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <button type="button" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text)]" onClick={() => setOpen((current) => !current)} aria-expanded={open}><SlidersHorizontal size={15} className="text-[var(--blue)]" /> Filtreler <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} /></button>
      <span className="text-[10px] text-[var(--text-faint)]">{applied ? `${resultCount ?? 0} sonuç` : `${fields.length} ölçüt`}</span>
    </div>
    {open ? <div className="grid gap-3 border-t border-[var(--line)] p-4 sm:grid-cols-2 xl:grid-cols-4">
      {fields.map((field, index) => <label key={`${field.label}-${index}`} className={`${field.kind === "date" ? "xl:col-span-2" : ""} grid gap-1.5 text-[10px] font-bold tracking-wide text-[var(--text-soft)]`}><span>{field.label}</span>
        {field.kind === "date" ? <span className="grid h-10 grid-cols-[18px_1fr_auto_1fr] items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 focus-within:border-[var(--blue)]"><CalendarDays size={14} className="text-[var(--text-faint)]" /><input aria-label={`${field.label} başlangıç`} type="date" value={parseRange(values[field.label])[0]} onChange={(event) => changeValue(field.label, `${event.target.value}|${parseRange(values[field.label])[1]}`)} className="min-w-0 bg-transparent text-[11px] font-medium text-[var(--text)] outline-none" /><i className="not-italic text-[var(--text-faint)]">–</i><input aria-label={`${field.label} bitiş`} type="date" value={parseRange(values[field.label])[1]} onChange={(event) => changeValue(field.label, `${parseRange(values[field.label])[0]}|${event.target.value}`)} className="min-w-0 bg-transparent text-[11px] font-medium text-[var(--text)] outline-none" /></span> : field.kind === "month" ? <input type="month" value={values[field.label]} onChange={(event) => changeValue(field.label, event.target.value)} className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-xs font-medium normal-case tracking-normal text-[var(--text)] outline-none focus:border-[var(--blue)]" /> : field.kind === "time" ? <input type="time" value={values[field.label]} onChange={(event) => changeValue(field.label, event.target.value)} className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-xs font-medium normal-case tracking-normal text-[var(--text)] outline-none focus:border-[var(--blue)]" /> : <select aria-label={field.label} value={values[field.label]} onChange={(event) => changeValue(field.label, event.target.value)} className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-xs font-medium normal-case tracking-normal text-[var(--text)] outline-none focus:border-[var(--blue)]">{(field.options ?? ["Tümünü Seç"]).map((option) => <option key={option}>{option}</option>)}</select>}
      </label>)}
      <div className="flex items-end gap-2"><button type="button" onClick={apply} className="h-10 rounded-xl bg-[var(--blue)] px-4 text-xs font-semibold text-white shadow-sm transition hover:brightness-105">Filtrele</button><button type="button" onClick={reset} className="h-10 rounded-xl px-3 text-xs font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)]">Temizle</button></div>
      {applied ? <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3 sm:col-span-2 xl:col-span-4"><span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600"><CheckCircle2 size={13} /> Sonuçlar güncellendi</span>{activeFilters.map(([label, value]) => <span key={label} className="rounded-full bg-[var(--blue-soft)] px-2.5 py-1 text-[9px] font-semibold text-[var(--blue)]">{label}: {value}</span>)}</div> : null}
    </div> : null}
  </section>;
}

function SortIcon({ active, direction }: { active: boolean; direction?: "desc" | "asc" }) {
  if (!active) return <ChevronsUpDown size={12} className="opacity-30" />;
  return direction === "desc" ? <ChevronDown size={13} /> : <ChevronUp size={13} />;
}

function ReportTable({ model, onNotice, onRowAction }: { model: ReportTableModel; onRowAction?: (row: string[]) => void } & ReportCallbacks) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<string[] | null>(null);
  const pageSize = 5;
  const rows = useMemo(() => {
    const filtered = model.rows.filter((row) => row.join(" ").toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")));
    if (!sort) return filtered;
    return [...filtered].sort((left, right) => {
      const result = collator.compare(left[sort.column] ?? "", right[sort.column] ?? "");
      return sort.direction === "desc" ? -result : result;
    });
  }, [model.rows, query, sort]);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);
  const cycleSort = (column: number) => {
    setSort((current) => !current || current.column !== column ? { column, direction: "desc" } : current.direction === "desc" ? { column, direction: "asc" } : null);
    setPage(1);
  };
  const exportRows = () => {
    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = [model.columns, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${normalize(model.title).replace(/[^a-z0-9]+/g, "-")}-raporu.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    onNotice?.(`${rows.length} kayıt CSV olarak indirildi`);
  };
  const runRowAction = (row: string[]) => {
    setSelectedRow(row);
    onRowAction?.(row);
    onNotice?.(model.action === "map" ? "Seçili konum rota görünümünde açıldı" : model.action === "view" ? "Sensör ayrıntısı açıldı" : "Kayıt ayrıntısı açıldı");
  };
  return <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--panel-shadow)]">
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"><div><p className="text-[9px] font-bold tracking-[0.16em] text-[var(--text-faint)]">KAYITLAR</p><h2 className="mt-1 text-sm font-semibold text-[var(--text)]">{model.title}</h2></div><div className="flex flex-wrap items-center gap-2"><nav className="flex h-9 items-center rounded-lg border border-[var(--line)] bg-[var(--surface-soft)]" aria-label={`${model.title} sayfaları`}><button type="button" aria-label="Önceki sayfa" className="grid size-8 place-items-center disabled:opacity-30" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={14} /></button><span className="min-w-12 text-center text-[10px] font-semibold text-[var(--text-soft)]">{safePage} / {pageCount}</span><button type="button" aria-label="Sonraki sayfa" className="grid size-8 place-items-center disabled:opacity-30" disabled={safePage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronRight size={14} /></button></nav><label className="flex h-9 min-w-44 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-3 focus-within:border-[var(--blue)]"><Search size={14} className="text-[var(--text-faint)]" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Ara…" aria-label={`${model.title} içinde ara`} className="w-full bg-transparent text-xs text-[var(--text)] outline-none" /></label>{model.exportable ? <button type="button" onClick={exportRows} disabled={rows.length === 0} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--line)] px-3 text-xs font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"><Download size={14} /> İndir</button> : null}</div></div>
    <div className="overflow-x-auto border-t border-[var(--line)]"><table className="w-full min-w-max border-collapse text-left"><thead><tr className="bg-[var(--surface-soft)]">{model.columns.map((column, index) => <th key={column} className="p-0"><button type="button" onClick={() => cycleSort(index)} className="flex w-full items-center gap-1.5 px-4 py-3 text-[10px] font-bold tracking-wide text-[var(--text-faint)] hover:text-[var(--blue)]">{column}<SortIcon active={sort?.column === index} direction={sort?.direction} /></button></th>)}{model.action ? <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-faint)]">Eylemler</th> : null}</tr></thead><tbody>{visibleRows.map((row, rowIndex) => <tr key={`${model.title}-${rowIndex}-${row[0]}`} className="border-t border-[var(--line)] hover:bg-[var(--blue-soft)]/35">{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`} className={`px-4 py-3 text-[11px] text-[var(--text-soft)] ${cellIndex === 1 ? "font-semibold text-[var(--text)]" : ""}`}>{cell}</td>)}{model.action ? <td className="px-4 py-2"><button type="button" onClick={() => runRowAction(row)} className="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-[var(--blue)] hover:bg-[var(--blue-soft)]">{model.action === "map" ? <><MapPin size={14} /> Rotayı Aç</> : model.action === "view" ? <><Eye size={14} /> Görüntüle</> : <><MoreHorizontal size={15} /> Ayrıntı</>}</button></td> : null}</tr>)}{visibleRows.length === 0 ? <tr><td colSpan={model.columns.length + (model.action ? 1 : 0)} className="px-6 py-12 text-center"><Search size={22} className="mx-auto text-[var(--text-faint)]" /><strong className="mt-2 block text-xs text-[var(--text)]">Kayıt bulunamadı</strong><span className="mt-1 block text-[10px] text-[var(--text-faint)]">Filtreleri temizleyin veya farklı bir arama yapın.</span></td></tr> : null}</tbody></table></div>
    <div className="flex min-h-11 items-center border-t border-[var(--line)] px-4 text-[10px] text-[var(--text-faint)]">{rows.length} kayıt</div>
    {selectedRow ? <aside className="border-t border-[var(--line)] bg-[var(--surface-soft)] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-bold tracking-[0.15em] text-[var(--text-faint)]">SEÇİLİ KAYIT</p><h3 className="mt-1 text-xs font-semibold text-[var(--text)]">{selectedRow[1] ?? selectedRow[0]}</h3></div><button type="button" aria-label="Kayıt ayrıntısını kapat" onClick={() => setSelectedRow(null)} className="grid size-8 place-items-center rounded-lg hover:bg-[var(--surface)]"><X size={14} /></button></div><dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{model.columns.map((column, index) => <div key={column} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2"><dt className="text-[8px] font-bold tracking-wide text-[var(--text-faint)]">{column}</dt><dd className="mt-1 truncate text-[10px] font-medium text-[var(--text)]">{selectedRow[index] ?? "—"}</dd></div>)}</dl></aside> : null}
  </section>;
}

function HorizontalBarChartCard({ title, data, unit = "saat" }: { title: string; data: { name: string; value: number }[]; unit?: string }) {
  return <section className="min-h-72 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--panel-shadow)]"><div><p className="text-[9px] font-bold tracking-[0.15em] text-[var(--text-faint)]">SIRALAMA</p><h3 className="mt-1 text-xs font-semibold text-[var(--text)]">{title}</h3></div><div className="mt-4 h-52"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={data} margin={{ top: 0, right: 28, left: 8, bottom: 0 }}><CartesianGrid horizontal={false} stroke="var(--chart-grid)" strokeDasharray="4 5" /><XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--text-faint)", fontSize: 9 }} /><YAxis type="category" dataKey="name" width={88} axisLine={false} tickLine={false} tick={{ fill: "var(--text-soft)", fontSize: 9 }} /><Tooltip cursor={{ fill: "var(--blue-soft)" }} formatter={(value) => [`${value} ${unit}`, "Toplam"]} contentStyle={{ border: "1px solid var(--line)", borderRadius: 12, background: "var(--surface-raised)", color: "var(--text)", fontSize: 11 }} /><Bar dataKey="value" radius={[0, 6, 6, 0]} fill="var(--chart-blue)" maxBarSize={22} /></BarChart></ResponsiveContainer></div></section>;
}

function DonutBreakdownCard({ title, data, centerLabel }: { title: string; data: { name: string; value: number }[]; centerLabel: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return <section className="min-h-72 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--panel-shadow)]"><div><p className="text-[9px] font-bold tracking-[0.15em] text-[var(--text-faint)]">DAĞILIM</p><h3 className="mt-1 text-xs font-semibold text-[var(--text)]">{title}</h3></div><div className="mt-2 grid grid-cols-[150px_1fr] items-center gap-2"><div className="relative h-44"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={66} paddingAngle={3} stroke="none">{data.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ border: "1px solid var(--line)", borderRadius: 12, background: "var(--surface-raised)", color: "var(--text)", fontSize: 11 }} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-content-center text-center"><strong className="text-lg font-semibold text-[var(--text)]">{total}</strong><span className="text-[9px] text-[var(--text-faint)]">{centerLabel}</span></div></div><div className="grid gap-2">{data.map((item, index) => <div key={item.name} className="flex items-center justify-between gap-2 text-[10px]"><span className="flex items-center gap-2 text-[var(--text-soft)]"><i className="size-2 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />{item.name}</span><strong className="text-[var(--text)]">%{Math.round((item.value / total) * 100)}</strong></div>)}</div></div></section>;
}

function TrendAreaChartCard({ title, data, valueLabel = "Varlık" }: { title: string; data: { name: string; value: number }[]; valueLabel?: string }) {
  return <section className="min-h-64 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--panel-shadow)]"><div><p className="text-[9px] font-bold tracking-[0.15em] text-[var(--text-faint)]">ZAMAN SERİSİ</p><h3 className="mt-1 text-xs font-semibold text-[var(--text)]">{title}</h3></div><div className="mt-4 h-44"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 6, right: 8, left: -28, bottom: 0 }}><defs><linearGradient id={`report-trend-${title.replace(/\s/g, "-")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-teal)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-teal)" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="4 5" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-faint)", fontSize: 9 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-faint)", fontSize: 9 }} /><Tooltip contentStyle={{ border: "1px solid var(--line)", borderRadius: 12, background: "var(--surface-raised)", color: "var(--text)", fontSize: 11 }} /><Area type="monotone" dataKey="value" name={valueLabel} stroke="var(--chart-teal)" strokeWidth={2.5} fill={`url(#report-trend-${title.replace(/\s/g, "-")})`} /></AreaChart></ResponsiveContainer></div></section>;
}

function SummaryCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Users; tone: string }) {
  return <article className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--panel-shadow)]"><div><strong className="block text-xl font-semibold tracking-[-0.03em] text-[var(--text)]">{value}</strong><span className="mt-1 block text-[10px] font-medium text-[var(--text-soft)]">{label}</span></div><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span></article>;
}

function EntityAnalyticsReport({ title, entityLabel, icon, onExport, onNotice }: { title: string; entityLabel: string; icon: typeof Users } & ReportCallbacks) {
  const [section, setSection] = useState("overview");
  const visual = ENTITY_VISUALS[entityLabel];
  const entityFilters = useMemo<FilterField[]>(() => [
    { label: "Konum", options: ["Merkez Kampüs", "B Blok", "C Blok"] },
    { label: "Grup", options: ["Tümünü Seç", "Operasyon", "Teknik"] },
    ...(entityLabel === "Personel" ? [{ label: "Bölge Etiketleri", options: ["Tümünü Seç", "Ofis 10", "Teknik Alan", "Toplantı Odası", "Depo"] }] : []),
    { label: entityLabel, options: ["Tümünü Seç", ...visual.names] },
    { label: "Tarih Aralığı", value: "05.08.2026 00:00 – 05.08.2026 23:59", kind: "date" },
  ], [entityLabel, visual.names]);
  const [filters, setFilters] = useState<FilterValues>(() => getFilterDefaults(entityFilters));
  const sections = [
    { id: "overview", label: "Genel görünüm" },
    { id: "alarms", label: "Alarmlar" },
    { id: "movements", label: "Hareketler" },
    { id: "durations", label: "Süreler" },
    ...(entityLabel === "Personel" ? [{ id: "inactivity", label: "Hareketsizlik" }] : []),
  ];
  const adaptModel = (model: ReportTableModel): ReportTableModel => ({
    ...model,
    columns: model.columns.map((column) => column === "Ad Soyad" ? entityLabel : column),
    rows: model.rows.map((row, rowIndex) => row.map((cell) => ["Mustafa Aydın", "Merve Kaya", "Ahmet Demir", "Selin Yılmaz", "Can Öz"].includes(cell) ? visual.names[rowIndex % visual.names.length] : cell)),
  });
  const filterEntityModel = (model: ReportTableModel) => {
    const adapted = adaptModel(model);
    const selectedEntity = filters[entityLabel];
    const groupNames = filters.Grup === "Operasyon" ? visual.names.slice(0, 2) : filters.Grup === "Teknik" ? visual.names.slice(2) : visual.names;
    const locationNames = filters.Konum === "B Blok" ? visual.names.slice(2, 3) : filters.Konum === "C Blok" ? visual.names.slice(3) : visual.names;
    return {
      ...adapted,
      rows: filterRows(adapted.rows, filters, {
        [entityLabel]: (row, value) => row.includes(value),
        Grup: (row) => row.some((cell) => groupNames.includes(cell)),
        Konum: (row) => row.some((cell) => locationNames.includes(cell)),
        "Bölge Etiketleri": (row, value) => row.includes(value),
      }).filter((row) => isInactiveFilter(selectedEntity) || row.includes(selectedEntity)),
    };
  };
  const filteredAlarms = filterEntityModel(PERSONNEL_ALARMS);
  const filteredMovements = filterEntityModel(PERSONNEL_MOVEMENTS);
  const filteredAreaDuration = filterEntityModel(AREA_DURATION);
  const filteredPersonDuration = filterEntityModel(PERSON_DURATION);
  const filteredInactive = filterEntityModel(INACTIVE_PERSONNEL);
  const filteredInactivity = filterEntityModel(INACTIVITY);
  const hasSpecificEntity = !isInactiveFilter(filters[entityLabel]);
  const narrowed = hasSpecificEntity || !isInactiveFilter(filters.Grup) || filters.Konum !== "Merkez Kampüs";
  const scale = hasSpecificEntity ? 0.08 : narrowed ? 0.42 : 1;
  const areaFilter = filters["Bölge Etiketleri"];
  const filteredVisual = {
    areas: visual.areas.filter((item) => isInactiveFilter(areaFilter) || item.name === areaFilter).map((item) => ({ ...item, value: Math.max(1, Math.round(item.value * scale)) })),
    floors: visual.floors.map((item) => ({ ...item, value: Math.max(1, Math.round(item.value * scale)) })),
    trend: visual.trend.map((item) => ({ ...item, value: Math.max(0, Math.round(item.value * scale)) })),
  };
  const visibleCount = section === "alarms" ? filteredAlarms.rows.length : section === "movements" ? filteredMovements.rows.length : section === "inactivity" ? filteredInactive.rows.length + filteredInactivity.rows.length : filteredAreaDuration.rows.length;
  const EntityIcon = icon;
  return <div className="grid gap-4"><PageTitle title={title} /><FilterDock onApply={(values) => { setFilters(values); onNotice?.(`${title} filtreleri uygulandı`); }} fields={entityFilters} resultCount={visibleCount} />
    <section className="grid gap-3 sm:grid-cols-3"><SummaryCard label={`Toplam ${entityLabel}`} value={hasSpecificEntity ? "1" : narrowed ? String(filteredVisual.areas.reduce((sum, item) => sum + item.value, 0)) : entityLabel === "Ekipman" ? "296" : entityLabel === "Misafir" ? "38" : "2.084"} icon={EntityIcon} tone="bg-blue-500/10 text-blue-600" /><SummaryCard label="Toplam Zaman" value={hasSpecificEntity ? "08:12:32" : narrowed ? "71:18:24" : "168:42:16"} icon={Clock3} tone="bg-violet-500/10 text-violet-600" /><SummaryCard label="Toplam Alarm" value={narrowed ? String(filteredAlarms.rows.length) : "32"} icon={AlertTriangle} tone="bg-rose-500/10 text-rose-600" /></section>
    <div className="flex overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1">{sections.map((item) => <button type="button" key={item.id} onClick={() => setSection(item.id)} className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[11px] font-semibold transition ${section === item.id ? "bg-[var(--blue)] text-white shadow-sm" : "text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"}`}>{item.label}</button>)}</div>
    {section === "overview" ? <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><HorizontalBarChartCard title="Bölgelere Göre Geçirilen Zaman" data={filteredVisual.areas} /><DonutBreakdownCard title="Katlara Göre Geçirilen Zaman" data={filteredVisual.floors} centerLabel="saat" /><div className="lg:col-span-2"><TrendAreaChartCard title={`Gün İçindeki ${entityLabel} Hareketi`} data={filteredVisual.trend} valueLabel={entityLabel} /></div></div> : null}
    {section === "alarms" ? <ReportTable model={filteredAlarms} onExport={onExport} onNotice={onNotice} /> : null}
    {section === "movements" ? <ReportTable model={filteredMovements} onExport={onExport} onNotice={onNotice} /> : null}
    {section === "durations" ? <div className="grid gap-4"><ReportTable model={filteredAreaDuration} onExport={onExport} onNotice={onNotice} /><ReportTable model={filteredPersonDuration} onExport={onExport} onNotice={onNotice} /></div> : null}
    {section === "inactivity" ? <div className="grid gap-4"><ReportTable model={filteredInactive} onExport={onExport} onNotice={onNotice} /><ReportTable model={filteredInactivity} onExport={onExport} onNotice={onNotice} /></div> : null}
  </div>;
}

const SIMPLE_REPORTS: Record<string, { fields: FilterField[]; table: ReportTableModel }> = {
  "report-alarms": {
    fields: [{ label: "Konum", options: ["Merkez Kampüs", "B Blok"] }, { label: "Öncelik", options: ["Tümü", "Yüksek", "Orta", "Düşük"] }, { label: "Alarm Adı", options: ["Tümü", "Yetkisiz alan girişi", "Hareketsizlik"] }, { label: "Tarih Aralığı", value: "05.08.2026 00:00 – 05.08.2026 23:59", kind: "date" }],
    table: { title: "Alarm Kayıtları", columns: ["ID", "Tarih", "Ad Soyad", "Alarm Adı", "Bölge", "Kat", "Kapatma Etiketi", "Kapatma Açıklaması", "Kapatma Tarihi", "Öncelik"], rows: [["AL-2048", "05.08.2026 14:38", "Mustafa Aydın", "Yetkisiz alan girişi", "Teknik Alan", "2. Kat", "İncelendi", "Yetki güncellendi", "05.08.2026 14:44", "Yüksek"], ["AL-2047", "05.08.2026 11:22", "Merve Kaya", "Hareketsizlik", "Ofis 10", "2. Kat", "Saha kontrolü", "Personel doğrulandı", "05.08.2026 11:31", "Orta"]], exportable: true, action: "menu" },
  },
  "report-equipment-usage": {
    fields: [{ label: "Konum", options: ["Merkez Kampüs", "B Blok"] }, { label: "Ekipmanlar", options: ["Tümünü Seç", "Forklift 07", "Termal Kamera 03"] }, { label: "Personeller", options: ["Tümünü Seç", "Mustafa Aydın", "Merve Kaya"] }, { label: "Tarih Aralığı", value: "04.08.2026 00:00 – 05.08.2026 23:59", kind: "date" }],
    table: { title: "Ekipman Kullanım Kayıtları", columns: ["#", "Ekipman", "Ad Soyad", "Başlangıç Tarihi", "Bitiş Tarihi", "Süre"], rows: [["1", "Forklift 07", "Mustafa Aydın", "05.08.2026 08:12", "05.08.2026 10:46", "02:34:00"], ["2", "Termal Kamera 03", "Merve Kaya", "05.08.2026 09:20", "05.08.2026 10:08", "00:48:00"], ["3", "Ölçüm Cihazı 11", "Ahmet Demir", "04.08.2026 15:02", "04.08.2026 16:41", "01:39:00"]], exportable: true },
  },
  "report-gps": {
    fields: [{ label: "İstemci Tipi", options: ["Tümünü Seç", "Personel", "Ekipman"] }, { label: "Konum", options: ["TEKNOPOL", "Merkez Kampüs"] }, { label: "İstemci", options: ["Tümünü Seç", "F00E76B921C9 TEST", "MUSTAFA AYDIN"] }, { label: "Tarih Aralığı", value: "05.08.2026 00:00 – 05.08.2026 23:59", kind: "date" }],
    table: { title: "GPS Raporları", columns: ["İsim", "Grup", "Konum", "Tarih", "Boylam", "Enlem"], rows: [["F00E76B921C9 TEST", "kuyumcular", "TEKNOPOL", "05.08.2026 17:38:36", "3262775.850566076", "4993772.816060602"], ["F8099982A345 TEST", "kuyumcular", "TEKNOPOL", "05.08.2026 15:31:22", "3262775.850566076", "4993772.816060602"], ["MUSTAFA AYDIN", "OFİSYENİ", "TEKNOPOL", "05.08.2026 10:27:21", "3262775.850566076", "4993772.816060602"], ["F00E76B921C9 TEST", "kuyumcular", "TEKNOPOL", "05.08.2026 10:01:52", "3262775.850566076", "4993772.816060602"], ["F8099982A345 TEST", "kuyumcular", "TEKNOPOL", "05.08.2026 09:56:29", "3262775.850566076", "4993772.816060602"], ["MUSTAFA AYDIN", "OFİSYENİ", "TEKNOPOL", "05.08.2026 07:36:33", "3262775.850566076", "4993772.816060602"]], exportable: true, action: "map" },
  },
  "report-sensors": {
    fields: [{ label: "Konum", options: ["Merkez Kampüs", "B Blok"] }, { label: "Kat", options: ["Tümünü Seç", "Zemin", "2. Kat"] }, { label: "Bölge", options: ["Tümünü Seç", "Ofis 10", "Depo"] }, { label: "Tarih Aralığı", value: "05.08.2026 00:00 – 05.08.2026 23:59", kind: "date" }],
    table: { title: "Özet", columns: ["#", "Tarih", "Ad", "Sıcaklık (°C)", "Nem (%)", "Mesafe", "Bölge", "Kat"], rows: [["1", "05.08.2026 15:40", "Sıcaklık Sensörü 08", "24,8", "48", "12 m", "Ofis 10", "2. Kat"], ["2", "05.08.2026 15:35", "Nem Sensörü 12", "23,9", "54", "8 m", "Depo", "Zemin"], ["3", "05.08.2026 15:30", "ToF Sensörü 03", "25,2", "46", "4 m", "Teknik Alan", "3. Kat"]], exportable: true, action: "view" },
  },
  "attendance-daily": {
    fields: [{ label: "Konum", options: ["Tümünü Seç", "Merkez Kampüs"] }, { label: "Personel", options: ["Tümünü Seç", "Mustafa Aydın", "Merve Kaya"] }, { label: "Grup", options: ["Tümünü Seç", "Operasyon", "Teknik"] }, { label: "Alan Etiketleri", options: ["Tümünü Seç", "Ofis", "Teknik Alan"] }, { label: "Tarih Aralığı", value: "05.08.2026 00:00 – 05.08.2026 23:59", kind: "date" }],
    table: { title: "Günlük Giriş", columns: ["#", "Sicil No", "Mesai Saati", "Ad", "Soyad", "Grup", "Giriş Tarihi", "Giriş Saati", "Çıkış Tarihi", "Çıkış Saati", "Toplam Çalışma Süresi"], rows: [["1", "NV-2048", "08:00–17:00", "Mustafa", "Aydın", "Operasyon", "05.08.2026", "08:04", "05.08.2026", "17:12", "09:08"], ["2", "NV-2046", "08:00–17:00", "Merve", "Kaya", "Güvenlik", "05.08.2026", "07:58", "05.08.2026", "17:04", "09:06"]], exportable: true },
  },
  "attendance-monthly": {
    fields: [{ label: "Konum", options: ["Tümünü Seç", "Merkez Kampüs"] }, { label: "Personel", options: ["Tümünü Seç", "Mustafa Aydın", "Merve Kaya"] }, { label: "Grup", options: ["Tümünü Seç", "Operasyon", "Teknik"] }, { label: "Ay", value: "2026-08", kind: "month" }],
    table: { title: "Aylık Giriş", columns: ["#", "Ad", "Soyad", "Kimlik No", "Sicil No", "Grup"], rows: [["1", "Mustafa", "Aydın", "10000000432", "NV-2048", "Operasyon"], ["2", "Merve", "Kaya", "10000000964", "NV-2046", "Güvenlik"], ["3", "Ahmet", "Demir", "10000000718", "NV-2047", "Teknik"]], exportable: true },
  },
  "report-entrances": {
    fields: [{ label: "Konum", options: ["Tümünü Seç", "TEKNOPOL"] }, { label: "Grup", options: ["Tümünü Seç", "kuyumcular", "OFİSYENİ"] }, { label: "Personel", options: ["Tümünü Seç", "F00E76B921C9 TEST", "MUSTAFA AYDIN"] }, { label: "İşlem Tipi", options: ["Tümünü Seç", "Giriş", "Çıkış"] }, { label: "Tarih Aralığı", value: "05.08.2026 00:00 – 05.08.2026 23:59", kind: "date" }],
    table: { title: "Geçiş Kontrol Kayıtları", columns: ["Date", "Personnel", "Group", "Location", "Area", "Phone", "Action"], rows: [["2026-08-05 17:38:37", "F00E76B921C9 TEST", "kuyumcular", "TEKNOPOL", "OFİS", "—", "Giriş"], ["2026-08-05 17:38:02", "F00E76B921C9 TEST", "kuyumcular", "TEKNOPOL", "OFİS", "—", "Çıkış"], ["2026-08-05 15:31:23", "F8099982A345 TEST", "kuyumcular", "TEKNOPOL", "OFİS", "—", "Giriş"], ["2026-08-05 10:27:22", "MUSTAFA AYDIN", "OFİSYENİ", "TEKNOPOL", "OFİS", "—", "Giriş"], ["2026-08-05 10:25:51", "MUSTAFA AYDIN", "OFİSYENİ", "TEKNOPOL", "OFİS", "—", "Çıkış"], ["2026-08-05 09:56:29", "F8099982A345 TEST", "kuyumcular", "TEKNOPOL", "OFİS", "—", "Giriş"]], exportable: true, action: "menu" },
  },
};

function ChartPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--panel-shadow)]"><p className="text-[9px] font-bold tracking-[0.15em] text-[var(--text-faint)]">{eyebrow}</p><h3 className="mt-1 text-xs font-semibold text-[var(--text)]">{title}</h3><div className="mt-4 h-52">{children}</div></section>;
}

function GroupedBarChart({ data, keys, horizontal = false }: { data: Record<string, string | number>[]; keys: { key: string; label: string; color: string }[]; horizontal?: boolean }) {
  return <ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={horizontal ? { left: 8, right: 20 } : { left: -25, right: 8 }}><CartesianGrid vertical={!horizontal} horizontal={horizontal} stroke="var(--chart-grid)" strokeDasharray="4 5" />{horizontal ? <><XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--text-faint)", fontSize: 9 }} /><YAxis type="category" dataKey="name" width={82} axisLine={false} tickLine={false} tick={{ fill: "var(--text-soft)", fontSize: 9 }} /></> : <><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-faint)", fontSize: 9 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-faint)", fontSize: 9 }} /></>}<Tooltip cursor={{ fill: "var(--blue-soft)" }} contentStyle={{ border: "1px solid var(--line)", borderRadius: 12, background: "var(--surface-raised)", color: "var(--text)", fontSize: 11 }} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 9, color: "var(--text-soft)" }} />{keys.map((item) => <Bar key={item.key} dataKey={item.key} name={item.label} fill={item.color} radius={horizontal ? [0, 5, 5, 0] : [5, 5, 1, 1]} maxBarSize={22} />)}</BarChart></ResponsiveContainer>;
}

function AlarmReport({ onExport, onNotice }: ReportCallbacks) {
  const report = SIMPLE_REPORTS["report-alarms"];
  const { setFilters, filteredModel } = useReportFilters(report.fields, report.table, {
    Konum: (_row, value) => value === "Merkez Kampüs",
    Öncelik: (row, value) => row[9] === value,
    "Alarm Adı": (row, value) => row[3] === value,
  });
  const highCount = filteredModel.rows.filter((row) => row[9] === "Yüksek").length;
  const data = [{ name: "08:00", yüksek: highCount, orta: Math.max(0, filteredModel.rows.length - highCount) }, { name: "10:00", yüksek: 0, orta: filteredModel.rows.length }, { name: "12:00", yüksek: highCount, orta: 0 }, { name: "14:00", yüksek: highCount, orta: Math.max(0, filteredModel.rows.length - highCount) }];
  return <div className="grid gap-4"><PageTitle title="Alarm Raporları" /><FilterDock fields={report.fields} resultCount={filteredModel.rows.length} onApply={(values) => { setFilters(values); onNotice?.("Alarm raporu filtreleri uygulandı"); }} /><section className="grid gap-3 sm:grid-cols-3"><SummaryCard label="Toplam Alarm" value={String(filteredModel.rows.length)} icon={AlertTriangle} tone="bg-rose-500/10 text-rose-600" /><SummaryCard label="Yüksek Öncelik" value={String(highCount)} icon={Activity} tone="bg-amber-500/10 text-amber-600" /><SummaryCard label="Kapatılan" value={String(filteredModel.rows.filter((row) => row[8] !== "—").length)} icon={Archive} tone="bg-emerald-500/10 text-emerald-600" /></section><ChartPanel eyebrow="ZAMAN DAĞILIMI" title="Saatlere Göre Alarm Yoğunluğu"><GroupedBarChart data={data} keys={[{ key: "yüksek", label: "Yüksek", color: "#f43f5e" }, { key: "orta", label: "Orta", color: "#f59e0b" }]} /></ChartPanel><ReportTable model={filteredModel} onExport={onExport} onNotice={onNotice} /></div>;
}

function EquipmentUsageReport({ onExport, onNotice }: ReportCallbacks) {
  const report = SIMPLE_REPORTS["report-equipment-usage"];
  const { setFilters, filteredModel } = useReportFilters(report.fields, report.table, {
    Konum: (_row, value) => value === "Merkez Kampüs",
    Ekipmanlar: (row, value) => row[1] === value,
    Personeller: (row, value) => row[2] === value,
  });
  const usageData = filteredModel.rows.map((row) => ({ name: row[1], value: Number(row[5].slice(0, 2)) + Number(row[5].slice(3, 5)) / 60 }));
  const totalMinutes = filteredModel.rows.reduce((sum, row) => sum + Number(row[5].slice(0, 2)) * 60 + Number(row[5].slice(3, 5)), 0);
  return <div className="grid gap-4"><PageTitle title="Ekipman Kullanım Raporları" /><FilterDock fields={report.fields} resultCount={filteredModel.rows.length} onApply={(values) => { setFilters(values); onNotice?.("Ekipman kullanım filtreleri uygulandı"); }} /><section className="grid gap-3 sm:grid-cols-3"><SummaryCard label="Kullanılan Ekipman" value={String(new Set(filteredModel.rows.map((row) => row[1])).size)} icon={Wrench} tone="bg-blue-500/10 text-blue-600" /><SummaryCard label="Toplam Kullanım" value={`${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`} icon={Clock3} tone="bg-violet-500/10 text-violet-600" /><SummaryCard label="Aktif Personel" value={String(new Set(filteredModel.rows.map((row) => row[2])).size)} icon={Users} tone="bg-emerald-500/10 text-emerald-600" /></section><HorizontalBarChartCard title="Ekipmana Göre Kullanım Süresi" unit="saat" data={usageData} /><ReportTable model={filteredModel} onExport={onExport} onNotice={onNotice} /></div>;
}

function GpsReport({ onExport, onNotice }: ReportCallbacks) {
  const report = SIMPLE_REPORTS["report-gps"];
  const { setFilters, filteredModel } = useReportFilters(report.fields, report.table, {
    "İstemci Tipi": (row, value) => value === "Personel" ? !row[0].includes("TEST") : row[0].includes("TEST"),
    Konum: (row, value) => row[2] === value,
    İstemci: (row, value) => row[0] === value,
  });
  const [selectedGps, setSelectedGps] = useState<string[] | null>(null);
  const points = [{ x: 80, y: 168 }, { x: 235, y: 112 }, { x: 390, y: 134 }, { x: 560, y: 70 }, { x: 740, y: 56 }];
  const routePoints = points.slice(0, Math.max(1, Math.min(points.length, filteredModel.rows.length)));
  return <div className="grid gap-4"><PageTitle title="GPS Raporları" /><FilterDock fields={report.fields} resultCount={filteredModel.rows.length} onApply={(values) => { setFilters(values); setSelectedGps(null); onNotice?.("GPS raporu filtreleri uygulandı"); }} /><section className="grid gap-3 sm:grid-cols-3"><SummaryCard label="Kayıt" value={String(filteredModel.rows.length)} icon={MapPin} tone="bg-blue-500/10 text-blue-600" /><SummaryCard label="İstemci" value={String(new Set(filteredModel.rows.map((row) => row[0])).size)} icon={Users} tone="bg-violet-500/10 text-violet-600" /><SummaryCard label="Son Konum" value={(selectedGps?.[3] ?? filteredModel.rows[0]?.[3] ?? "—").slice(11, 16)} icon={Clock3} tone="bg-emerald-500/10 text-emerald-600" /></section><ChartPanel eyebrow="ROTA GÖRÜNÜMÜ" title={selectedGps ? `${selectedGps[0]} · ${selectedGps[3]}` : "Seçili İstemcinin Günlük Rotası"}><div className="relative h-full overflow-hidden rounded-xl border border-[var(--line)] bg-[linear-gradient(35deg,transparent_24%,var(--line)_25%,transparent_26%),linear-gradient(-35deg,transparent_24%,var(--line)_25%,transparent_26%),var(--surface-soft)] bg-[length:80px_60px]"><svg viewBox="0 0 820 210" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label={`${routePoints.length} konum noktasından oluşan günlük rota`}><path d="M80 168 C145 150 178 120 235 112 S325 154 390 134 S486 82 560 70 S675 76 740 56" fill="none" stroke="var(--chart-blue)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity=".55" strokeDasharray="7 7" />{routePoints.map((point, index) => <g key={index}><circle cx={point.x} cy={point.y} r="13" fill="var(--surface)" /><circle cx={point.x} cy={point.y} r="9" fill="var(--chart-blue)" /><text x={point.x} y={point.y + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="700">{index + 1}</text></g>)}</svg><span className="absolute bottom-3 left-3 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)]/90 px-2.5 py-1.5 text-[9px] font-semibold text-[var(--text-soft)]">{selectedGps ? `${selectedGps[4]} · ${selectedGps[5]}` : `${filteredModel.rows.at(-1)?.[3]?.slice(11, 16) ?? "—"} → ${filteredModel.rows[0]?.[3]?.slice(11, 16) ?? "—"}`}</span></div></ChartPanel><ReportTable model={filteredModel} onExport={onExport} onNotice={onNotice} onRowAction={setSelectedGps} /></div>;
}

function SensorReport({ onExport, onNotice }: ReportCallbacks) {
  const report = SIMPLE_REPORTS["report-sensors"];
  const { setFilters, filteredModel } = useReportFilters(report.fields, report.table, {
    Konum: (_row, value) => value === "Merkez Kampüs",
    Kat: (row, value) => row[7] === value,
    Bölge: (row, value) => row[6] === value,
  });
  const temperature = [{ name: "08:00", value: 22.8 }, { name: "10:00", value: 23.6 }, { name: "12:00", value: 24.3 }, { name: "14:00", value: 25.2 }, { name: "16:00", value: 24.8 }];
  const humidity = [{ name: "08:00", value: 55 }, { name: "10:00", value: 52 }, { name: "12:00", value: 49 }, { name: "14:00", value: 46 }, { name: "16:00", value: 48 }];
  const average = (index: number) => filteredModel.rows.length ? filteredModel.rows.reduce((sum, row) => sum + Number(row[index].replace(",", ".")), 0) / filteredModel.rows.length : 0;
  const scale = filteredModel.rows.length / report.table.rows.length;
  return <div className="grid gap-4"><PageTitle title="Sıcaklık & Nem Raporları" /><FilterDock fields={report.fields} resultCount={filteredModel.rows.length} onApply={(values) => { setFilters(values); onNotice?.("Sensör raporu filtreleri uygulandı"); }} /><section className="grid gap-3 sm:grid-cols-3"><SummaryCard label="Ortalama Sıcaklık" value={`${average(3).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} °C`} icon={Gauge} tone="bg-amber-500/10 text-amber-600" /><SummaryCard label="Ortalama Nem" value={`%${average(4).toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`} icon={Activity} tone="bg-blue-500/10 text-blue-600" /><SummaryCard label="Eşik İhlali" value="0" icon={AlertTriangle} tone="bg-emerald-500/10 text-emerald-600" /></section><div className="grid gap-4 lg:grid-cols-2"><TrendAreaChartCard title="Sıcaklık Değişimi" data={temperature.map((item) => ({ ...item, value: Number((item.value * scale).toFixed(1)) }))} valueLabel="°C" /><TrendAreaChartCard title="Nem Değişimi" data={humidity.map((item) => ({ ...item, value: Math.round(item.value * scale) }))} valueLabel="%" /></div><ReportTable model={filteredModel} onExport={onExport} onNotice={onNotice} /></div>;
}

function AttendanceReport({ mode, onExport, onNotice }: { mode: "daily" | "monthly" } & ReportCallbacks) {
  const report = SIMPLE_REPORTS[mode === "daily" ? "attendance-daily" : "attendance-monthly"];
  const { setFilters, filteredModel } = useReportFilters(report.fields, report.table, {
    Konum: (_row, value) => value === "Merkez Kampüs",
    Personel: (row, value) => `${row[mode === "daily" ? 3 : 1]} ${row[mode === "daily" ? 4 : 2]}` === value,
    Grup: (row, value) => row[mode === "daily" ? 5 : 5] === value,
    "Alan Etiketleri": (row, value) => value === "Ofis" ? row[5] !== "Teknik" : row[5] === "Teknik",
  });
  const daily = [{ name: "07:30", zamanında: 18, geç: 1 }, { name: "08:00", zamanında: 46, geç: 4 }, { name: "08:30", zamanında: 13, geç: 7 }, { name: "09:00", zamanında: 4, geç: 5 }];
  const monthly = [{ name: "1. Hafta", mevcut: 92, geç: 6, devamsız: 2 }, { name: "2. Hafta", mevcut: 89, geç: 8, devamsız: 3 }, { name: "3. Hafta", mevcut: 94, geç: 4, devamsız: 2 }, { name: "4. Hafta", mevcut: 91, geç: 5, devamsız: 4 }];
  const data = mode === "daily" ? daily : monthly;
  const keys = mode === "daily" ? [{ key: "zamanında", label: "Zamanında", color: "#10b981" }, { key: "geç", label: "Geç", color: "#f59e0b" }] : [{ key: "mevcut", label: "Mevcut", color: "#2563eb" }, { key: "geç", label: "Geç", color: "#f59e0b" }, { key: "devamsız", label: "Devamsız", color: "#f43f5e" }];
  const pageTitle = mode === "daily" ? "Günlük Giriş" : "Aylık Giriş";
  const chartScale = filteredModel.rows.length / report.table.rows.length;
  const filteredChart = data.map((item) => Object.fromEntries(Object.entries(item).map(([key, value]) => [key, typeof value === "number" ? Math.round(value * chartScale) : value])) as Record<string, string | number>);
  return <div className="grid gap-4"><PageTitle title={pageTitle} /><FilterDock fields={report.fields} resultCount={filteredModel.rows.length} onApply={(values) => { setFilters(values); onNotice?.(`${pageTitle} filtreleri uygulandı`); }} /><section className="grid gap-3 sm:grid-cols-3"><SummaryCard label={mode === "daily" ? "Giriş Yapan" : "Listelenen Personel"} value={String(filteredModel.rows.length)} icon={Users} tone="bg-blue-500/10 text-blue-600" /><SummaryCard label="Geç Giriş" value={mode === "daily" ? String(filteredModel.rows.filter((row) => row[7] > "08:00").length) : `%${Math.round(6 * chartScale)}`} icon={Clock3} tone="bg-amber-500/10 text-amber-600" /><SummaryCard label="Devamsız" value={mode === "daily" ? String(Math.max(0, 4 - filteredModel.rows.length)) : `%${Math.round(3 * chartScale)}`} icon={AlertTriangle} tone="bg-rose-500/10 text-rose-600" /></section><ChartPanel eyebrow={mode === "daily" ? "GİRİŞ SAATLERİ" : "AYLIK EĞİLİM"} title={mode === "daily" ? "Giriş Saatlerine Göre Personel" : "Haftalara Göre Devam Durumu"}><GroupedBarChart data={filteredChart} keys={keys} /></ChartPanel><ReportTable model={filteredModel} onExport={onExport} onNotice={onNotice} /></div>;
}

function EntranceReport({ onExport, onNotice }: ReportCallbacks) {
  const report = SIMPLE_REPORTS["report-entrances"];
  const { setFilters, filteredModel } = useReportFilters(report.fields, report.table, {
    Konum: (row, value) => row[3] === value,
    Grup: (row, value) => row[2] === value,
    Personel: (row, value) => row[1] === value,
    "İşlem Tipi": (row, value) => row[6] === value,
  });
  const data = [{ name: "08:00", giriş: 31, çıkış: 2 }, { name: "10:00", giriş: 14, çıkış: 9 }, { name: "12:00", giriş: 12, çıkış: 15 }, { name: "14:00", giriş: 17, çıkış: 11 }, { name: "17:00", giriş: 4, çıkış: 39 }];
  const entries = filteredModel.rows.filter((row) => row[6] === "Giriş").length;
  const exits = filteredModel.rows.filter((row) => row[6] === "Çıkış").length;
  const scale = filteredModel.rows.length / report.table.rows.length;
  return <div className="grid gap-4"><PageTitle title="Geçiş Kontrol Raporları" /><FilterDock fields={report.fields} resultCount={filteredModel.rows.length} onApply={(values) => { setFilters(values); onNotice?.("Geçiş kontrol filtreleri uygulandı"); }} /><section className="grid gap-3 sm:grid-cols-3"><SummaryCard label="Toplam Geçiş" value={String(filteredModel.rows.length)} icon={Activity} tone="bg-blue-500/10 text-blue-600" /><SummaryCard label="Giriş" value={String(entries)} icon={UserRoundPlus} tone="bg-emerald-500/10 text-emerald-600" /><SummaryCard label="Çıkış" value={String(exits)} icon={Archive} tone="bg-violet-500/10 text-violet-600" /></section><ChartPanel eyebrow="SAATLİK AKIŞ" title="Giriş ve Çıkış Yoğunluğu"><GroupedBarChart data={data.map((item) => ({ ...item, giriş: Math.round(item.giriş * scale), çıkış: Math.round(item.çıkış * scale) }))} keys={[{ key: "giriş", label: "Giriş", color: "#10b981" }, { key: "çıkış", label: "Çıkış", color: "#8b5cf6" }]} /></ChartPanel><ReportTable model={filteredModel} onExport={onExport} onNotice={onNotice} /></div>;
}

function AreaReport({ title, kind, onExport, onNotice }: { title: string; kind: "area" | "floor" } & ReportCallbacks) {
  const [detail, setDetail] = useState("alarms");
  const fields = useMemo<FilterField[]>(() => [{ label: "Konum", options: ["Merkez Kampüs", "B Blok"] }, { label: "Kat", options: ["Tümünü Seç", "Zemin", "1. Kat", "2. Kat"] }, { label: "Bölge", options: ["Tümünü Seç", "Ofis 10", "Teknik Alan", "Toplantı Odası"] }, { label: "Tarih Aralığı", value: "05.08.2026 00:00 – 05.08.2026 23:59", kind: "date" }], []);
  const [filters, setFilters] = useState<FilterValues>(() => getFilterDefaults(fields));
  const areaData = [{ name: "Ofis 10", personel: 42, misafir: 7, ekipman: 12 }, { name: "Teknik", personel: 34, misafir: 3, ekipman: 21 }, { name: "Toplantı", personel: 26, misafir: 14, ekipman: 4 }, { name: "Depo", personel: 18, misafir: 2, ekipman: 28 }];
  const floorData = [{ name: "Zemin", personel: 38, misafir: 18, ekipman: 31 }, { name: "1. Kat", personel: 31, misafir: 12, ekipman: 16 }, { name: "2. Kat", personel: 47, misafir: 6, ekipman: 22 }, { name: "3. Kat", personel: 19, misafir: 2, ekipman: 9 }];
  const detailModel = detail === "alarms" ? PERSONNEL_ALARMS : detail === "movements" ? PERSONNEL_MOVEMENTS : AREA_DURATION;
  const areaRules = { Konum: (_row: string[], value: string) => value === "Merkez Kampüs", Kat: (row: string[], value: string) => row.includes(value), Bölge: (row: string[], value: string) => row.includes(value) };
  const filteredDetail = { ...detailModel, rows: filterRows(detailModel.rows, filters, areaRules) };
  const filteredAlarms = filterRows(PERSONNEL_ALARMS.rows, filters, areaRules);
  const selectedArea = filters.Bölge;
  const selectedFloor = filters.Kat;
  const scopeScale = filters.Konum === "B Blok" ? 0.4 : !isInactiveFilter(selectedFloor) || !isInactiveFilter(selectedArea) ? 0.65 : 1;
  const visibleAreaData = areaData.filter((item) => isInactiveFilter(selectedArea) || normalize(item.name).startsWith(normalize(selectedArea).split(" ")[0])).map((item) => ({ ...item, personel: Math.round(item.personel * scopeScale), misafir: Math.round(item.misafir * scopeScale), ekipman: Math.round(item.ekipman * scopeScale) }));
  const visibleFloorData = floorData.filter((item) => isInactiveFilter(selectedFloor) || item.name === selectedFloor).map((item) => ({ ...item, personel: Math.round(item.personel * scopeScale), misafir: Math.round(item.misafir * scopeScale), ekipman: Math.round(item.ekipman * scopeScale) }));
  const totals = (kind === "area" ? visibleAreaData : visibleFloorData).reduce((acc, item) => ({ personel: acc.personel + item.personel, misafir: acc.misafir + item.misafir, ekipman: acc.ekipman + item.ekipman }), { personel: 0, misafir: 0, ekipman: 0 });
  return <div className="grid gap-4"><PageTitle title={title} /><FilterDock fields={fields} resultCount={filteredDetail.rows.length} onApply={(values) => { setFilters(values); onNotice?.(`${title} filtreleri uygulandı`); }} /><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Toplam Personel" value={String(totals.personel)} icon={Users} tone="bg-blue-500/10 text-blue-600" /><SummaryCard label="Toplam Misafir" value={String(totals.misafir)} icon={UserRoundPlus} tone="bg-violet-500/10 text-violet-600" /><SummaryCard label="Toplam Ekipman" value={String(totals.ekipman)} icon={Wrench} tone="bg-emerald-500/10 text-emerald-600" /><SummaryCard label="Toplam Alarm" value={String(filteredAlarms.length)} icon={AlertTriangle} tone="bg-rose-500/10 text-rose-600" /></section><div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]"><ChartPanel eyebrow={kind === "area" ? "BÖLGE KARŞILAŞTIRMASI" : "KAT KARŞILAŞTIRMASI"} title={kind === "area" ? "Bölgelere Göre Varlık Dağılımı" : "Katlara Göre Varlık Dağılımı"}><GroupedBarChart data={kind === "area" ? visibleAreaData : visibleFloorData} horizontal keys={[{ key: "personel", label: "Personel", color: "#2563eb" }, { key: "misafir", label: "Misafir", color: "#8b5cf6" }, { key: "ekipman", label: "Ekipman", color: "#10b981" }]} /></ChartPanel>{kind === "area" ? <HorizontalBarChartCard title="Bölgelerde Geçirilen Süre" data={ANALYTICS_CHART.filter((item) => isInactiveFilter(selectedArea) || normalize(item.name).startsWith(normalize(selectedArea).split(" ")[0])).map((item) => ({ ...item, value: Math.round(item.value * scopeScale) }))} /> : <DonutBreakdownCard title="Katlara Göre Toplam Süre" data={ENTITY_VISUALS.Personel.floors.filter((item) => isInactiveFilter(selectedFloor) || item.name === selectedFloor).map((item) => ({ ...item, value: Math.max(1, Math.round(item.value * scopeScale)) }))} centerLabel="saat" />}</div><div className="flex w-fit rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1">{[{ id: "alarms", label: "Alarmlar" }, { id: "movements", label: "Hareketler" }, { id: "durations", label: "Süreler" }].map((item) => <button type="button" key={item.id} onClick={() => setDetail(item.id)} className={`rounded-lg px-3.5 py-2 text-[11px] font-semibold ${detail === item.id ? "bg-[var(--blue)] text-white" : "text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"}`}>{item.label}</button>)}</div><ReportTable key={filteredDetail.title} model={filteredDetail} onExport={onExport} onNotice={onNotice} /></div>;
}

function TagReport({ onExport, onNotice }: ReportCallbacks) {
  const [detail, setDetail] = useState("time");
  const fields = useMemo<FilterField[]>(() => [{ label: "Konum", options: ["Merkez Kampüs", "map 2"] }, { label: "Bölge Etiketleri", options: ["Tümünü Seç", "Ofis", "Teknik Alan"] }, { label: "Grup", options: ["Tümünü Seç", "Operasyon"] }, { label: "Personel", options: ["Tümünü Seç", "Mustafa Aydın", "Merve Kaya"] }, { label: "Minimum Süre", value: "00:00", kind: "time" }, { label: "Tarih Aralığı", value: "05.08.2026 00:00 – 05.08.2026 23:59", kind: "date" }], []);
  const [filters, setFilters] = useState<FilterValues>(() => getFilterDefaults(fields));
  const tagTime: ReportTableModel = { title: "Bölge Etiketlerine Göre Geçirilen Zaman", columns: ["#", "Personel", "Etiket", "Toplam Süre"], rows: [["1", "Mustafa Aydın", "Teknik Alan", "04:18:42"], ["2", "Merve Kaya", "Ofis", "03:56:11"]], exportable: true };
  const entryExit: ReportTableModel = { title: "Giriş–Çıkış Raporu", columns: ["Tarih Aralığı", "Sicil No", "Ad Soyad", "Giriş", "Çıkış", "Tesis İçi Süre", "Tesis Dışı Süre", "Genel Toplam"], rows: [["05.08.2026", "NV-2048", "Mustafa Aydın", "08:04", "17:12", "09:08", "14:52", "24:00"], ["05.08.2026", "NV-2046", "Merve Kaya", "07:58", "17:04", "09:06", "14:54", "24:00"]], exportable: true };
  const tagRules = { Konum: (_row: string[], value: string) => value === "Merkez Kampüs", "Bölge Etiketleri": (row: string[], value: string) => row.includes(value), Grup: (_row: string[], value: string) => value === "Operasyon", Personel: (row: string[], value: string) => row.includes(value) };
  const currentModel = detail === "time" ? tagTime : entryExit;
  const filteredRows = filterRows(currentModel.rows, filters, tagRules).filter((row) => {
    if (detail !== "time" || !filters["Minimum Süre"] || filters["Minimum Süre"] === "00:00") return true;
    const [hours, minutes] = row[3].split(":").map(Number);
    const [minHours, minMinutes] = filters["Minimum Süre"].split(":").map(Number);
    return hours * 60 + minutes >= minHours * 60 + minMinutes;
  });
  const filteredModel = { ...currentModel, rows: filteredRows };
  const filteredTagRows = filterRows(tagTime.rows, filters, tagRules);
  const chartData = filteredTagRows.map((row) => ({ name: row[2], value: Number(row[3].slice(0, 2)) + Number(row[3].slice(3, 5)) / 60 }));
  return <div className="grid gap-4"><PageTitle title="Etiket Raporları" /><FilterDock fields={fields} resultCount={filteredRows.length} onApply={(values) => { setFilters(values); onNotice?.("Etiket raporu filtreleri uygulandı"); }} /><section className="grid gap-3 sm:grid-cols-2"><SummaryCard label="Listelenen Personel" value={String(new Set(filteredRows.map((row) => detail === "time" ? row[1] : row[2])).size)} icon={Users} tone="bg-blue-500/10 text-blue-600" /><SummaryCard label="Etiket Kaydı" value={String(filteredRows.length)} icon={Clock3} tone="bg-violet-500/10 text-violet-600" /></section><HorizontalBarChartCard title="Etiketlere Göre Toplam Süre" data={chartData} /><div className="flex w-fit rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1"><button type="button" onClick={() => setDetail("time")} className={`rounded-lg px-3.5 py-2 text-[11px] font-semibold ${detail === "time" ? "bg-[var(--blue)] text-white" : "text-[var(--text-soft)]"}`}>Etiket Süreleri</button><button type="button" onClick={() => setDetail("entry")} className={`rounded-lg px-3.5 py-2 text-[11px] font-semibold ${detail === "entry" ? "bg-[var(--blue)] text-white" : "text-[var(--text-soft)]"}`}>Giriş–Çıkış</button></div><ReportTable key={filteredModel.title} model={filteredModel} onExport={onExport} onNotice={onNotice} /></div>;
}

function PirReport({ onNotice }: ReportCallbacks) {
  const fields = useMemo<FilterField[]>(() => [{ label: "Konum", options: ["Merkez Kampüs", "B Blok"] }, { label: "Kat", options: ["Tümünü Seç", "Zemin", "2. Kat"] }, { label: "Bölge", options: ["Tümünü Seç", "Doğu Koridor", "Depo"] }, { label: "Tarih Aralığı", value: "05.08.2026 00:00 – 05.08.2026 23:59", kind: "date" }], []);
  const [filters, setFilters] = useState<FilterValues>(() => getFilterDefaults(fields));
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(2);
  const days = ["Pzt 03", "Sal 04", "Çar 05", "Per 06", "Cum 07", "Cts 08", "Paz 09"];
  const hourly = [{ name: "06", value: 2 }, { name: "08", value: 18 }, { name: "10", value: 12 }, { name: "12", value: 8 }, { name: "14", value: 15 }, { name: "16", value: 11 }, { name: "18", value: 4 }];
  const filterScale = filters.Konum === "B Blok" ? 0.45 : !isInactiveFilter(filters.Kat) || !isInactiveFilter(filters.Bölge) ? 0.65 : 1;
  const selectedHourly = hourly.map((item) => ({ ...item, value: Math.round(item.value * filterScale * (selectedDay === 2 ? 1 : 0.55 + selectedDay * 0.05)) }));
  const monthLabel = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date(2026, 7 + monthOffset, 1));
  return <div className="grid gap-4"><PageTitle title="PIR Sensör Raporları" /><FilterDock fields={fields} resultCount={selectedHourly.reduce((sum, item) => sum + item.value, 0)} onApply={(values) => { setFilters(values); onNotice?.("PIR sensör filtreleri uygulandı"); }} /><div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]"><section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--panel-shadow)]"><div className="flex items-center justify-between"><div><p className="text-[9px] font-bold tracking-[0.16em] text-[var(--text-faint)]">HAREKET TAKVİMİ</p><h2 className="mt-1 text-sm font-semibold capitalize text-[var(--text)]">{monthLabel}</h2></div><div className="flex gap-1"><button type="button" aria-label="Önceki ay" onClick={() => setMonthOffset((value) => value - 1)} className="grid size-8 place-items-center rounded-lg border border-[var(--line)] hover:bg-[var(--surface-soft)]"><ChevronLeft size={14} /></button><button type="button" aria-label="Sonraki ay" onClick={() => setMonthOffset((value) => value + 1)} className="grid size-8 place-items-center rounded-lg border border-[var(--line)] hover:bg-[var(--surface-soft)]"><ChevronRight size={14} /></button></div></div><div className="mt-4 overflow-x-auto"><div className="grid min-w-[720px] grid-cols-7 overflow-hidden rounded-xl border border-[var(--line)]">{days.map((day, index) => <button type="button" key={day} onClick={() => { setSelectedDay(index); onNotice?.(`${day} hareket kayıtları açıldı`); }} className={`min-h-44 border-r border-[var(--line)] p-3 text-left last:border-r-0 hover:bg-[var(--blue-soft)]/35 ${index === selectedDay ? "bg-[var(--blue-soft)]/50" : ""}`}><span className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-soft)]">{day}<em className="rounded bg-blue-500/10 px-1.5 py-0.5 not-italic text-blue-600">{Math.round((index === 2 ? 18 : index % 3) * filterScale)}</em></span><span className={`mt-4 block h-1.5 rounded-full ${index === selectedDay ? "bg-blue-500" : "bg-[var(--line)]"}`} /></button>)}</div></div></section><ChartPanel eyebrow="SAATLİK DAĞILIM" title={`${days[selectedDay]} Hareket Yoğunluğu`}><GroupedBarChart data={selectedHourly} keys={[{ key: "value", label: "Hareket", color: "#2563eb" }]} /></ChartPanel></div></div>;
}

function HeatmapReport({ onNotice }: ReportCallbacks) {
  const fields = useMemo<FilterField[]>(() => [{ label: "Konum", options: ["map 2", "Merkez Kampüs"] }, { label: "Hedef", options: ["Personel", "Ekipman"] }, { label: "Bileşen", options: ["Tümünü Seç", "Operasyon", "Teknik"] }, { label: "Kat", options: ["1", "2", "3"] }, { label: "Tarih Aralığı", value: "05.08.2026 00:00 – 05.08.2026 23:59", kind: "date" }], []);
  const [filters, setFilters] = useState<FilterValues>(() => getFilterDefaults(fields));
  const [zoom, setZoom] = useState(1);
  const [satellite, setSatellite] = useState(false);
  const baseDensity = filters.Hedef === "Ekipman" ? 296 : filters.Bileşen === "Teknik" ? 438 : 2_084;
  const densityCount = Math.round(baseDensity * (filters.Konum === "map 2" ? 0.58 : 1) * (filters.Kat === "1" ? 1 : filters.Kat === "2" ? 0.72 : 0.46));
  return <div className="grid gap-4"><PageTitle title="Yoğunluk Haritası" /><FilterDock fields={fields} resultCount={densityCount} onApply={(values) => { setFilters(values); onNotice?.("Yoğunluk haritası güncellendi"); }} /><section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--panel-shadow)]"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-bold tracking-[0.16em] text-[var(--text-faint)]">ALAN İSTATİSTİKLERİ</p><h2 className="mt-1 text-sm font-semibold text-[var(--text)]">{filters.Konum} · {filters.Hedef} · {filters.Kat}. kat</h2></div><div className="flex items-center gap-3 text-[10px] text-[var(--text-soft)]"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-blue-400" />Düşük</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-400" />Orta</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-rose-500" />Yüksek</span></div></div><div className={`relative mt-4 min-h-[520px] overflow-hidden rounded-xl border border-[var(--line)] ${satellite ? "bg-slate-700" : "bg-[linear-gradient(35deg,transparent_24%,var(--line)_25%,transparent_26%),linear-gradient(-35deg,transparent_24%,var(--line)_25%,transparent_26%),var(--surface-soft)] bg-[length:90px_70px]"}`}><div className="absolute inset-0 transition-transform duration-300" style={{ transform: `scale(${zoom})` }}><div className="absolute left-[12%] top-[18%] h-40 w-60 rotate-[-5deg] rounded-[45%] bg-blue-500/15 blur-2xl" /><div className="absolute left-[42%] top-[28%] h-48 w-72 rounded-[48%] bg-amber-400/20 blur-2xl" /><div className="absolute right-[13%] top-[42%] h-56 w-64 rotate-12 rounded-[48%] bg-rose-500/20 blur-2xl" /><div className="absolute left-[49%] top-[45%] size-24 rounded-full bg-rose-500/30 blur-xl" /></div><div className="absolute bottom-4 left-4 flex overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface-raised)]"><button type="button" aria-label="Haritayı yakınlaştır" onClick={() => setZoom((value) => Math.min(1.6, value + 0.2))} className="grid size-9 place-items-center border-r border-[var(--line)] hover:bg-[var(--surface-soft)]">+</button><button type="button" aria-label="Haritayı uzaklaştır" onClick={() => setZoom((value) => Math.max(0.8, value - 0.2))} className="grid size-9 place-items-center hover:bg-[var(--surface-soft)]">−</button></div><button type="button" onClick={() => { setSatellite((value) => !value); onNotice?.(satellite ? "Standart harita görünümü açıldı" : "Uydu görünümü açıldı"); }} className="absolute bottom-4 right-4 inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] px-3 text-xs font-semibold text-[var(--text-soft)]"><MapPinned size={15} /> {satellite ? "Standart" : "Uydu"}</button><span className="absolute right-4 top-4 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)]/90 px-2.5 py-1.5 text-[9px] font-semibold text-[var(--text-soft)]">%{Math.round(zoom * 100)} · {densityCount} varlık</span></div></section></div>;
}

function DynamicReport({ onNotice }: ReportCallbacks) {
  const [dashboards, setDashboards] = useState(["Araç Gösterge Paneli", "Alarmlar", "RFID", "MasterTablo"]);
  const [active, setActive] = useState(dashboards[0]);
  const [widgets, setWidgets] = useState(["Motor Yağı Seviyesi", "Hız - km", "Yakıt", "Kontak Durumu"]);
  const fields = useMemo<FilterField[]>(() => [{ label: "Tarih Aralığı", value: "05.08.2026 00:00 – 05.08.2026 23:59", kind: "date" }], []);
  const [filters, setFilters] = useState<FilterValues>(() => getFilterDefaults(fields));
  const [openWidget, setOpenWidget] = useState<number | null>(null);
  const dateLabel = parseRange(filters["Tarih Aralığı"]).map((value) => value.split("-").reverse().join(".")).join(" – ");
  return <div className="grid gap-4"><PageTitle title="Dinamik Raporlar" action={<button type="button" onClick={() => { const name = `Yeni Dashboard ${dashboards.length + 1}`; setDashboards((items) => [...items, name]); setActive(name); onNotice?.("Yeni dashboard oluşturuldu"); }} className="inline-flex h-9 items-center gap-2 rounded-xl bg-[var(--blue)] px-3.5 text-xs font-semibold text-white shadow-sm"><Plus size={15} /> Dashboard Ekle</button>} /><FilterDock fields={fields} resultCount={widgets.length} onApply={(values) => { setFilters(values); onNotice?.("Dinamik rapor tarihi güncellendi"); }} /><section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--panel-shadow)]"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{dashboards.map((dashboard) => <button type="button" key={dashboard} onClick={() => setActive(dashboard)} className={`rounded-xl px-3 py-2 text-[11px] font-semibold ${active === dashboard ? "bg-[var(--blue)] text-white" : "border border-[var(--line)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"}`}>{dashboard}</button>)}</div><span className="text-[9px] font-semibold text-[var(--text-faint)]">{dateLabel}</span></div><div className="mt-4 grid gap-4 md:grid-cols-2">{widgets.map((widget, index) => <article key={`${widget}-${index}`} className="relative min-h-56 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-[var(--text)]">{widget}</h3><button type="button" aria-label={`${widget} seçenekleri`} onClick={() => setOpenWidget((current) => current === index ? null : index)} className="grid size-8 place-items-center rounded-lg hover:bg-[var(--surface)]"><MoreHorizontal size={16} /></button></div>{openWidget === index ? <div className="absolute right-4 top-12 z-10 grid min-w-32 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] p-1 shadow-xl"><button type="button" onClick={() => { setOpenWidget(null); onNotice?.(`${widget} verisi yenilendi`); }} className="rounded-lg px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)]">Veriyi yenile</button><button type="button" onClick={() => { setWidgets((items) => items.filter((_, itemIndex) => itemIndex !== index)); setOpenWidget(null); onNotice?.(`${widget} kaldırıldı`); }} className="rounded-lg px-3 py-2 text-left text-[10px] font-semibold text-rose-600 hover:bg-rose-500/10">Kartı kaldır</button></div> : null}{index === 1 ? <div className="mt-5 h-36"><ResponsiveContainer width="100%" height="100%"><BarChart data={ANALYTICS_CHART}><Bar dataKey="value" fill="var(--chart-blue)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div> : index === 2 ? <div className="mt-5 h-36"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={ANALYTICS_CHART} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62}>{ANALYTICS_CHART.map((item, itemIndex) => <Cell key={item.name} fill={COLORS[itemIndex]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div> : <div className="mt-8 flex items-end justify-between"><div><strong className="text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">{index === 0 ? "72%" : "Aktif"}</strong><span className="mt-2 block text-[10px] text-[var(--text-soft)]">Son veri · 15:42</span></div><span className="grid size-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-600">{index === 0 ? <Gauge size={22} /> : <Activity size={22} />}</span></div>}</article>)}<button type="button" onClick={() => { setWidgets((items) => [...items, `Yeni Gösterge ${items.length + 1}`]); onNotice?.("Widget eklendi"); }} className="grid min-h-40 place-items-center rounded-xl border border-dashed border-[var(--line-strong)] text-xs font-semibold text-[var(--text-soft)] hover:border-[var(--blue)] hover:text-[var(--blue)]"><span className="grid justify-items-center gap-2"><Plus size={20} /> Widget Ekle</span></button></div></section></div>;
}

export function NavbeaReportView({ id, title, onExport, onNotice }: { id: string; title: string } & ReportCallbacks) {
  let content: React.ReactNode;
  if (id === "report-personnels") content = <EntityAnalyticsReport title={title} entityLabel="Personel" icon={Users} onExport={onExport} onNotice={onNotice} />;
  else if (id === "report-visitors") content = <EntityAnalyticsReport title={title} entityLabel="Misafir" icon={UserRoundPlus} onExport={onExport} onNotice={onNotice} />;
  else if (id === "report-equipment") content = <EntityAnalyticsReport title={title} entityLabel="Ekipman" icon={Archive} onExport={onExport} onNotice={onNotice} />;
  else if (id === "report-alarms") content = <AlarmReport onExport={onExport} onNotice={onNotice} />;
  else if (id === "report-equipment-usage") content = <EquipmentUsageReport onExport={onExport} onNotice={onNotice} />;
  else if (id === "report-area") content = <AreaReport title={title} kind="area" onExport={onExport} onNotice={onNotice} />;
  else if (id === "report-floor") content = <AreaReport title={title} kind="floor" onExport={onExport} onNotice={onNotice} />;
  else if (id === "report-tags") content = <TagReport onExport={onExport} onNotice={onNotice} />;
  else if (id === "report-gps") content = <GpsReport onExport={onExport} onNotice={onNotice} />;
  else if (id === "report-pir") content = <PirReport onNotice={onNotice} />;
  else if (id === "report-sensors") content = <SensorReport onExport={onExport} onNotice={onNotice} />;
  else if (id === "report-heatmap") content = <HeatmapReport onNotice={onNotice} />;
  else if (id === "report-dynamic") content = <DynamicReport onNotice={onNotice} />;
  else if (id === "attendance-daily") content = <AttendanceReport mode="daily" onExport={onExport} onNotice={onNotice} />;
  else if (id === "attendance-monthly") content = <AttendanceReport mode="monthly" onExport={onExport} onNotice={onNotice} />;
  else if (id === "report-entrances") content = <EntranceReport onExport={onExport} onNotice={onNotice} />;
  else content = <div className="grid gap-4"><PageTitle title={title} /><section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center"><FileBarChart className="mx-auto text-[var(--blue)]" /><h2 className="mt-3 text-sm font-semibold text-[var(--text)]">Rapor hazırlanıyor</h2></section></div>;
  return <div className="self-managed-view">{content}</div>;
}
