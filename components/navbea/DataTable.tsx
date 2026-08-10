"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Download,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";

export type TableModel = {
  columns: string[];
  rows: string[][];
  total: number;
  title: string;
  searchLabel: string;
};

type SortDirection = "desc" | "asc";
type SortState = { columnIndex: number; direction: SortDirection } | null;
type RowEditorState = { index: number; values: string[] } | null;

type DataTableProps = {
  model: TableModel;
  showExport?: boolean;
  onColumns?: () => void;
  onExport?: () => void;
  onNotice?: (message: string) => void;
};

const PAGE_SIZE = 3;
const collator = new Intl.Collator("tr", { numeric: true, sensitivity: "base" });

function statusTone(value: string) {
  if (["Aktif", "Etkin", "Dolu", "İçeride", "Devam ediyor", "Kaydedildi", "İyi"].includes(value)) return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (["Dikkat", "Orta", "Onay bekliyor", "Planlandı"].includes(value)) return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (["Kritik", "Boş", "Düşük", "Gecikti", "Kilitli", "Pasif", "Zayıf"].includes(value)) return "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300";
  return null;
}

function SortIcon({ active, direction }: { active: boolean; direction?: SortDirection }) {
  if (!active) return <ChevronsUpDown aria-hidden size={13} className="opacity-35" />;
  return direction === "desc" ? <ChevronDown aria-hidden size={14} /> : <ChevronUp aria-hidden size={14} />;
}

export function DataTable({ model, showExport = false, onColumns, onExport, onNotice }: DataTableProps) {
  const [rows, setRows] = useState(model.rows);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editor, setEditor] = useState<RowEditorState>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const menuRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!menuRoot.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const filteredRows = useMemo(() => rows
    .map((row, originalIndex) => ({ row, originalIndex }))
    .filter(({ row }) => row.join(" ").toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))), [query, rows]);

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows;
    return [...filteredRows].sort((left, right) => {
      const result = collator.compare(left.row[sort.columnIndex] ?? "", right.row[sort.columnIndex] ?? "");
      return sort.direction === "desc" ? -result : result;
    });
  }, [filteredRows, sort]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleRows = sortedRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const cycleSort = (columnIndex: number) => {
    setPage(1);
    setSort((current) => {
      if (!current || current.columnIndex !== columnIndex) return { columnIndex, direction: "desc" };
      if (current.direction === "desc") return { columnIndex, direction: "asc" };
      return null;
    });
  };

  const openEditor = (originalIndex: number) => {
    setEditor({ index: originalIndex, values: [...rows[originalIndex]] });
    setOpenMenu(null);
  };

  const saveEditor = () => {
    if (!editor) return;
    setRows((current) => current.map((row, index) => index === editor.index ? editor.values : row));
    setEditor(null);
    onNotice?.("Kayıt güncellendi");
  };

  const deleteRow = () => {
    if (deleteIndex === null) return;
    setRows((current) => current.filter((_, index) => index !== deleteIndex));
    setDeleteIndex(null);
    setOpenMenu(null);
    onNotice?.("Kayıt silindi");
  };

  return (
    <section className="panel data-panel overflow-visible" ref={menuRoot}>
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--text-faint)]">KAYITLAR</p>
          <h2 className="mt-1 text-sm font-semibold text-[var(--text)]">{model.title}</h2>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <nav className="flex h-9 items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-1" aria-label="Tablo sayfaları">
            <button type="button" className="grid size-7 place-items-center rounded-md text-[var(--text-soft)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-35" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Önceki sayfa"><ChevronLeft size={15} /></button>
            <span className="min-w-12 text-center text-[11px] font-semibold tabular-nums text-[var(--text-soft)]">{safePage} / {pageCount}</span>
            <button type="button" className="grid size-7 place-items-center rounded-md text-[var(--text-soft)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-35" disabled={safePage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Sonraki sayfa"><ChevronRight size={15} /></button>
          </nav>

          <label className="flex h-9 min-w-48 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-[var(--text-soft)] focus-within:border-[var(--blue)] focus-within:ring-2 focus-within:ring-[var(--blue-soft)]">
            <Search aria-hidden size={15} />
            <input className="w-full border-0 bg-transparent text-xs text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]" aria-label="Tabloda ara" placeholder={`${model.searchLabel}…`} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
          </label>

          <button type="button" onClick={onColumns} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-soft)] transition hover:bg-[var(--surface-soft)]"><ListFilter size={15} /> Sütunlar</button>
          {showExport ? <button type="button" onClick={onExport} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-soft)] transition hover:bg-[var(--surface-soft)]"><Download size={15} /> İndir</button> : null}
        </div>
      </div>

      <div className="overflow-x-auto border-t border-[var(--line)]">
        <table className="w-full min-w-max border-collapse text-left">
          <thead>
            <tr className="bg-[var(--surface-soft)]">
              {model.columns.map((column, columnIndex) => column === "Eylemler" ? (
                <th key={column} className="px-4 py-3 text-[10px] font-bold tracking-wide text-[var(--text-faint)]">{column}</th>
              ) : (
                <th key={column} className="p-0 text-[10px] font-bold tracking-wide text-[var(--text-faint)]">
                  <button type="button" onClick={() => cycleSort(columnIndex)} className="flex w-full items-center gap-1.5 px-4 py-3 text-left transition hover:bg-[var(--blue-soft)] hover:text-[var(--blue)]" aria-label={`${column} sütununu sırala`}>
                    {column}<SortIcon active={sort?.columnIndex === columnIndex} direction={sort?.direction} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length ? visibleRows.map(({ row, originalIndex }) => (
              <tr key={`${originalIndex}-${row[0]}`} className="border-t border-[var(--line)] transition hover:bg-[var(--blue-soft)]/35">
                {row.map((cell, cellIndex) => {
                  const tone = statusTone(cell);
                  const column = model.columns[cellIndex] ?? "";
                  const isIdentifier = column === "ID" || column === "#" || /Kimlik|Sicil|Cihaz ID/.test(column);
                  return <td key={`${originalIndex}-${cellIndex}`} className={`px-4 py-3 text-[11px] text-[var(--text-soft)] ${isIdentifier ? "font-mono tabular-nums" : ""} ${cellIndex === 1 ? "font-semibold text-[var(--text)]" : ""}`}>{tone ? <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${tone}`}>{cell}</span> : cell}</td>;
                })}
                <td className="relative px-4 py-2 text-right">
                  <button type="button" className="grid size-8 place-items-center rounded-lg text-[var(--text-soft)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)]" onClick={(event) => { event.stopPropagation(); setOpenMenu((current) => current === originalIndex ? null : originalIndex); }} aria-label="Satır eylemleri" aria-expanded={openMenu === originalIndex}><MoreHorizontal size={17} /></button>
                  {openMenu === originalIndex ? <div className="absolute right-4 top-10 z-30 w-36 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] p-1.5 shadow-xl">
                    <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-soft)]" onClick={() => openEditor(originalIndex)}><Pencil size={14} /> Düzenle</button>
                    <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-500/10" onClick={() => { setDeleteIndex(originalIndex); setOpenMenu(null); }}><Trash2 size={14} /> Sil</button>
                  </div> : null}
                </td>
              </tr>
            )) : <tr><td colSpan={model.columns.length} className="px-5 py-12 text-center text-xs text-[var(--text-faint)]">Arama kriterine uygun kayıt bulunamadı.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex min-h-12 items-center border-t border-[var(--line)] px-5 text-[11px] text-[var(--text-faint)]">{sortedRows.length} / {model.total.toLocaleString("tr-TR")} kayıt</div>

      {editor ? <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" role="presentation">
        <section role="dialog" aria-modal="true" aria-label="Kaydı düzenle" className="max-h-[85vh] w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4"><div><p className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-faint)]">KAYIT</p><h2 className="mt-1 text-base font-semibold text-[var(--text)]">Düzenle</h2></div><button type="button" onClick={() => setEditor(null)} className="grid size-8 place-items-center rounded-lg text-[var(--text-soft)] hover:bg-[var(--surface-soft)]" aria-label="Düzenlemeyi kapat"><X size={17} /></button></div>
          <div className="grid max-h-[60vh] gap-3 overflow-y-auto p-5 sm:grid-cols-2">{model.columns.filter((column) => column !== "Eylemler").map((column, index) => <label key={column} className="grid gap-1.5 text-xs font-semibold text-[var(--text-soft)]"><span>{column}</span><input className="h-10 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-normal text-[var(--text)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)]" value={editor.values[index] ?? ""} onChange={(event) => setEditor((current) => current ? { ...current, values: current.values.map((value, valueIndex) => valueIndex === index ? event.target.value : value) } : current)} /></label>)}</div>
          <div className="flex justify-end gap-2 border-t border-[var(--line)] px-5 py-4"><button type="button" className="h-9 rounded-lg border border-[var(--line)] px-4 text-xs font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)]" onClick={() => setEditor(null)}>Vazgeç</button><button type="button" className="h-9 rounded-lg bg-[var(--blue)] px-4 text-xs font-semibold text-white hover:brightness-105" onClick={saveEditor}>Değişiklikleri Kaydet</button></div>
        </section>
      </div> : null}

      {deleteIndex !== null ? <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
        <section role="alertdialog" aria-modal="true" aria-label="Kaydı sil" className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] p-5 shadow-2xl">
          <span className="grid size-10 place-items-center rounded-xl bg-rose-500/10 text-rose-600"><Trash2 size={19} /></span>
          <h2 className="mt-4 text-base font-semibold text-[var(--text)]">Kayıt silinsin mi?</h2>
          <p className="mt-2 text-xs leading-5 text-[var(--text-soft)]">Bu kayıt mevcut tablodan kaldırılacak. Bu işlem geri alınamaz.</p>
          <div className="mt-5 flex justify-end gap-2"><button type="button" className="h-9 rounded-lg border border-[var(--line)] px-4 text-xs font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)]" onClick={() => setDeleteIndex(null)}>Vazgeç</button><button type="button" className="h-9 rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-700" onClick={deleteRow}>Sil</button></div>
        </section>
      </div> : null}
    </section>
  );
}
