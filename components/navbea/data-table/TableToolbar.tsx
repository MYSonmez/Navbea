"use client";

import { Download, ListFilter } from "lucide-react";
import { Button, SearchField } from "../Ui";
import { TablePagination } from "./TablePagination";

type TableToolbarProps = {
  title: string;
  query: string;
  searchLabel: string;
  page: number;
  pageCount: number;
  showExport: boolean;
  onQuery: (query: string) => void;
  onPage: (page: number) => void;
  onColumns?: () => void;
  onExport?: () => void;
};

export function TableToolbar({ title, query, searchLabel, page, pageCount, showExport, onQuery, onPage, onColumns, onExport }: TableToolbarProps) {
  return <header className="data-toolbar"><div className="data-toolbar-title"><p className="eyebrow">KAYITLAR</p><h2>{title}</h2></div><div className="data-toolbar-actions"><TablePagination page={page} pageCount={pageCount} onPage={onPage} /><SearchField compact label="Tabloda ara" placeholder={`${searchLabel}…`} value={query} onChange={(event) => onQuery(event.target.value)} /><Button size="sm" onClick={onColumns}><ListFilter size={15} /> Sütunlar</Button>{showExport ? <Button size="sm" onClick={onExport}><Download size={15} /> İndir</Button> : null}</div></header>;
}
