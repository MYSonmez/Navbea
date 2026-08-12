"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "../Ui";

export function TablePagination({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (page: number) => void }) {
  return <nav className="ui-pagination" aria-label="Tablo sayfaları"><IconButton size="sm" label="Önceki sayfa" disabled={page === 1} onClick={() => onPage(Math.max(1, page - 1))}><ChevronLeft size={15} /></IconButton><span>{page} / {pageCount}</span><IconButton size="sm" label="Sonraki sayfa" disabled={page === pageCount} onClick={() => onPage(Math.min(pageCount, page + 1))}><ChevronRight size={15} /></IconButton></nav>;
}
