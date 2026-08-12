"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DeleteRowDialog, EditRowDialog } from "./data-table/TableDialogs";
import { RowActions } from "./data-table/RowActions";
import { SortIndicator, type SortDirection } from "./data-table/SortIndicator";
import { TableToolbar } from "./data-table/TableToolbar";

export type TableModel = {
  columns: string[];
  rows: string[][];
  total: number;
  title: string;
  searchLabel: string;
};

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
      <TableToolbar title={model.title} query={query} searchLabel={model.searchLabel} page={safePage} pageCount={pageCount} showExport={showExport} onQuery={(value) => { setQuery(value); setPage(1); }} onPage={setPage} onColumns={onColumns} onExport={onExport} />

      <div className="overflow-x-auto border-t border-[var(--line)]">
        <table className="w-full min-w-max border-collapse text-left">
          <thead>
            <tr className="bg-[var(--surface-soft)]">
              {model.columns.map((column, columnIndex) => column === "Eylemler" ? (
                <th key={column} className="px-4 py-3 text-[10px] font-bold tracking-wide text-[var(--text-faint)]">{column}</th>
              ) : (
                <th key={column} className="p-0 text-[10px] font-bold tracking-wide text-[var(--text-faint)]">
                  <button type="button" onClick={() => cycleSort(columnIndex)} className="flex w-full items-center gap-1.5 px-4 py-3 text-left transition hover:bg-[var(--blue-soft)] hover:text-[var(--blue)]" aria-label={`${column} sütununu sırala`}>
                    {column}<SortIndicator active={sort?.columnIndex === columnIndex} direction={sort?.direction} />
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
                <td className="relative px-4 py-2 text-right"><RowActions open={openMenu === originalIndex} onToggle={() => setOpenMenu((current) => current === originalIndex ? null : originalIndex)} onEdit={() => openEditor(originalIndex)} onDelete={() => { setDeleteIndex(originalIndex); setOpenMenu(null); }} /></td>
              </tr>
            )) : <tr><td colSpan={model.columns.length} className="px-5 py-12 text-center text-xs text-[var(--text-faint)]">Arama kriterine uygun kayıt bulunamadı.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex min-h-12 items-center border-t border-[var(--line)] px-5 text-[11px] text-[var(--text-faint)]">{sortedRows.length} / {model.total.toLocaleString("tr-TR")} kayıt</div>

      {editor ? <EditRowDialog columns={model.columns} values={editor.values} onChange={(index, value) => setEditor((current) => current ? { ...current, values: current.values.map((item, itemIndex) => itemIndex === index ? value : item) } : current)} onCancel={() => setEditor(null)} onSave={saveEditor} /> : null}
      {deleteIndex !== null ? <DeleteRowDialog onCancel={() => setDeleteIndex(null)} onDelete={deleteRow} /> : null}
    </section>
  );
}
