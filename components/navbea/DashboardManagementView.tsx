"use client";

import { useMemo, useState } from "react";
import { BarChart3, Database, Eye, Filter, Gauge, Grid2X2, Info, LineChart, Menu, Plus, Save, Search, Settings, Table2, Trash2 } from "lucide-react";
import { SectionHeader } from "./Ui";

const WIDGET_LIBRARY = [
  { name: "Gösterge", icon: Gauge, tone: "#315fdf" },
  { name: "Çizgi Grafik", icon: LineChart, tone: "#8b6ee8" },
  { name: "Sütun Grafik", icon: BarChart3, tone: "#14a38b" },
  { name: "Veri Tablosu", icon: Table2, tone: "#e39b28" },
  { name: "Filtre", icon: Filter, tone: "#e75f72" },
];

export function DashboardManagementView() {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [widgets, setWidgets] = useState(["Personel Sayısı", "Alarm Dağılımı", "Son Olaylar"]);
  const [selectedWidget, setSelectedWidget] = useState("Personel Sayısı");
  const [title, setTitle] = useState("Operasyon Panosu");
  const [menuTitle, setMenuTitle] = useState("Operasyon");
  const [showInMenu, setShowInMenu] = useState(true);
  const [preview, setPreview] = useState(false);
  const [savedAt, setSavedAt] = useState("Otomatik kaydedildi");

  const library = useMemo(() => WIDGET_LIBRARY.filter((widget) => widget.name.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))), [query]);
  const addWidget = (name: string) => {
    const nextName = widgets.includes(name) ? `${name} ${widgets.length + 1}` : name;
    setWidgets((current) => [...current, nextName]);
    setSelectedWidget(nextName);
    setSavedAt("Kaydedilmemiş değişiklikler");
  };
  const removeWidget = () => {
    setWidgets((current) => current.filter((widget) => widget !== selectedWidget));
    setSelectedWidget(widgets.find((widget) => widget !== selectedWidget) ?? "");
    setSavedAt("Kaydedilmemiş değişiklikler");
  };

  return (
    <div className="self-managed-view view-stack">
      <SectionHeader eyebrow="YÖNETİM" title="Pano Yönetimi" actions={<><select aria-label="Pano seç" className="h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text)] outline-none"><option>Operasyon Panosu</option><option>Shell Operasyon Panosu</option></select><button type="button" className="primary-button" onClick={() => setTitle("Yeni Pano")}><Plus size={16} /> Pano Ekle</button></>} />

      <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
        <nav className="flex flex-wrap items-center gap-1 border-b border-[var(--line)] bg-[var(--surface-raised)] px-4 py-2" aria-label="Pano düzenleme bölümleri">
          {[{ name: "Dashboard", icon: Grid2X2 }, { name: "Widget'lar", icon: Gauge }, { name: "Kaynaklar", icon: Database }, { name: "Clicky AI", icon: Info }].map((item) => { const Icon = item.icon; return <button type="button" key={item.name} onClick={() => setActiveSection(item.name)} className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${activeSection === item.name ? "bg-[var(--blue-soft)] text-[var(--blue)]" : "text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"}`}><Icon size={15} /> {item.name}</button>; })}
          <span className="ml-auto text-[10px] font-medium text-[var(--text-faint)]">{savedAt}</span>
        </nav>

        <div className="grid min-h-[660px] xl:grid-cols-[240px_minmax(420px,1fr)_280px]">
          <aside className="border-b border-[var(--line)] bg-[var(--surface-raised)] p-4 xl:border-b-0 xl:border-r">
            <p className="text-[10px] font-bold tracking-[.14em] text-[var(--text-faint)]">WIDGET KÜTÜPHANESİ</p>
            <label className="mt-3 flex h-9 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-[var(--text-soft)] focus-within:border-[var(--blue)] focus-within:ring-2 focus-within:ring-[var(--blue-soft)]"><Search size={15} /><input className="min-w-0 flex-1 border-0 bg-transparent text-xs text-[var(--text)] outline-none" placeholder="Widget ara" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <div className="mt-4 grid gap-2">{library.map((widget) => { const Icon = widget.icon; return <button type="button" key={widget.name} onClick={() => addWidget(widget.name)} className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-md"><span className="grid size-9 place-items-center rounded-xl" style={{ color: widget.tone, background: `color-mix(in srgb, ${widget.tone} 12%, transparent)` }}><Icon size={17} /></span><span className="flex-1 text-xs font-semibold text-[var(--text)]">{widget.name}</span><Plus size={14} className="text-[var(--text-faint)]" /></button>; })}</div>
          </aside>

          <main className="min-w-0 bg-[var(--surface-soft)] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.14em] text-[var(--text-faint)]">DÜZENLEME ALANI</p><h2 className="mt-1 text-sm font-semibold text-[var(--text)]">{title}</h2></div><div className="flex gap-2"><button type="button" className="secondary-button" onClick={() => setPreview((value) => !value)}><Eye size={15} /> {preview ? "Düzenlemeye Dön" : "Önizle"}</button><button type="button" className="primary-button" onClick={() => setSavedAt(`Kaydedildi · ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`)}><Save size={15} /> Kaydet</button></div></div>
            <div className="mb-3 flex flex-wrap gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2"><button type="button" className="inline-flex h-8 items-center gap-2 rounded-lg bg-[var(--blue-soft)] px-3 text-[11px] font-semibold text-[var(--blue)]"><Filter size={14} /> Konum: Merkez Kampüs</button><button type="button" className="inline-flex h-8 items-center gap-2 rounded-lg border border-[var(--line)] px-3 text-[11px] font-semibold text-[var(--text-soft)]">Tarih: Bugün</button><button type="button" className="ml-auto grid size-8 place-items-center rounded-lg text-[var(--text-soft)] hover:bg-[var(--surface-soft)]" aria-label="Pano menüsü"><Menu size={16} /></button></div>

            <div className={`grid gap-3 ${preview ? "pointer-events-none" : ""}`}>
              {widgets.map((widget, index) => <button type="button" key={widget} onClick={() => setSelectedWidget(widget)} className={`min-h-36 rounded-2xl border bg-[var(--surface)] p-4 text-left transition ${selectedWidget === widget && !preview ? "border-blue-500/45 ring-2 ring-blue-500/10" : "border-[var(--line)] hover:border-blue-500/25"}`}>
                <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold tracking-[.12em] text-[var(--text-faint)]">{index === 0 ? "GÖSTERGE" : index === 1 ? "GRAFİK" : "TABLO"}</p><h3 className="mt-1 text-sm font-semibold text-[var(--text)]">{widget}</h3></div><Grid2X2 size={16} className="text-[var(--text-faint)]" /></div>
                {index % 3 === 0 ? <div className="mt-5 flex items-end gap-2"><strong className="text-3xl font-semibold tracking-tight text-[var(--text)]">2.084</strong><span className="mb-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">+%4,8</span></div> : index % 3 === 1 ? <div className="mt-6 flex h-14 items-end gap-1.5">{[34,55,42,68,47,76,63,84,59,72].map((height, barIndex) => <span key={barIndex} className="flex-1 rounded-t bg-blue-500/75" style={{ height: `${height}%`, opacity: .45 + barIndex * .05 }} />)}</div> : <div className="mt-4 grid gap-2">{["Kritik alarm · C Blok", "Bakım süresi · B Blok", "Yetkisiz giriş · Kuzey kapı"].map((row) => <span key={row} className="flex items-center justify-between border-b border-[var(--line)] pb-2 text-[10px] text-[var(--text-soft)]"><span>{row}</span><strong>Şimdi</strong></span>)}</div>}
              </button>)}
            </div>
          </main>

          <aside className="border-t border-[var(--line)] bg-[var(--surface-raised)] p-4 xl:border-l xl:border-t-0">
            <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[var(--blue-soft)] text-[var(--blue)]"><Settings size={16} /></span><div><p className="text-[10px] font-bold tracking-[.12em] text-[var(--text-faint)]">AYARLAR</p><h2 className="text-sm font-semibold text-[var(--text)]">Dashboard Ayarları</h2></div></div>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-soft)]"><span>Başlık</span><input className="h-10 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 font-normal text-[var(--text)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)]" value={title} onChange={(event) => { setTitle(event.target.value); setSavedAt("Kaydedilmemiş değişiklikler"); }} /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-soft)]"><span>Menü Başlığı</span><input className="h-10 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 font-normal text-[var(--text)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)]" value={menuTitle} onChange={(event) => setMenuTitle(event.target.value)} /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-soft)]"><span>Slug</span><input className="h-10 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-3 font-mono text-[11px] text-[var(--text-soft)] outline-none" value="operasyon-panosu" readOnly /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-[var(--text-soft)]"><span>Varsayılan Yenileme</span><select className="h-10 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 font-normal text-[var(--text)] outline-none"><option>30 saniye</option><option>1 dakika</option><option>5 dakika</option></select></label>
              <button type="button" onClick={() => setShowInMenu((value) => !value)} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-left"><span><strong className="block text-xs font-semibold text-[var(--text)]">Menüde göster</strong><small className="mt-1 block text-[10px] text-[var(--text-soft)]">Panoyu sol menüde erişilebilir yapar.</small></span><span className={`relative h-6 w-11 rounded-full transition ${showInMenu ? "bg-[var(--blue)]" : "bg-slate-300 dark:bg-slate-700"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${showInMenu ? "left-6" : "left-1"}`} /></span></button>
            </div>
            <div className="mt-6 border-t border-[var(--line)] pt-4"><p className="text-[10px] font-bold tracking-[.12em] text-[var(--text-faint)]">SEÇİLİ WIDGET</p><div className="mt-2 flex items-center justify-between rounded-xl bg-[var(--surface-soft)] p-3"><span className="truncate text-xs font-semibold text-[var(--text)]">{selectedWidget || "Seçim yok"}</span><button type="button" disabled={!selectedWidget} onClick={removeWidget} className="grid size-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-500/10 disabled:opacity-30" aria-label="Seçili widget'ı sil"><Trash2 size={15} /></button></div></div>
          </aside>
        </div>
      </section>
    </div>
  );
}
