"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Layers3, LocateFixed, MapPin, Plus, RefreshCw, Search, X } from "lucide-react";
import { SectionHeader } from "./Ui";

type Location = {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  x: number;
  y: number;
  tone: string;
};

const INITIAL_LOCATIONS: Location[] = [
  { id: "LOC-001", name: "Merkez Kampüs", city: "İstanbul", district: "Şişli", address: "Büyükdere Cad. No: 127", x: 42, y: 43, tone: "#315fdf" },
  { id: "LOC-014", name: "Ana Bina", city: "İstanbul", district: "Şişli", address: "Merkez Kampüs · A Blok", x: 55, y: 32, tone: "#14a38b" },
  { id: "LOC-021", name: "B Blok", city: "İstanbul", district: "Şişli", address: "Merkez Kampüs · Kuzey Yerleşke", x: 65, y: 57, tone: "#8b6ee8" },
  { id: "LOC-028", name: "Depo", city: "İstanbul", district: "Kağıthane", address: "Sanayi Mah. Lojistik Sok.", x: 27, y: 66, tone: "#e39b28" },
];

export function MapManagementView() {
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [selectedId, setSelectedId] = useState(INITIAL_LOCATIONS[0].id);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [layersVisible, setLayersVisible] = useState(true);

  const visibleLocations = useMemo(() => locations.filter((location) =>
    `${location.name} ${location.city} ${location.district} ${location.address}`.toLocaleLowerCase("tr")
      .includes(query.toLocaleLowerCase("tr"))), [locations, query]);
  const selected = locations.find((location) => location.id === selectedId) ?? locations[0];

  const addLocation = () => {
    const name = newName.trim();
    if (!name) return;
    if (editId) {
      setLocations((current) => current.map((location) => location.id === editId ? { ...location, name } : location));
      setNewName("");
      setEditId(null);
      setShowCreate(false);
      return;
    }
    const next: Location = {
      id: `LOC-${String(locations.length + 30).padStart(3, "0")}`,
      name,
      city: "İstanbul",
      district: "Şişli",
      address: "Adres bilgisi bekleniyor",
      x: 48 + locations.length * 3,
      y: 51 - locations.length * 2,
      tone: "#e75f72",
    };
    setLocations((current) => [...current, next]);
    setSelectedId(next.id);
    setNewName("");
    setShowCreate(false);
  };

  return (
    <div className="self-managed-view view-stack">
      <SectionHeader
        eyebrow="YÖNETİM"
        title="Harita Yönetimi"
        actions={<button type="button" className="primary-button" onClick={() => { setEditId(null); setNewName(""); setShowCreate(true); }}><Plus size={16} /> Konum Ekle</button>}
      />

      <section className="grid min-h-[650px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative min-h-[520px] overflow-hidden bg-[#e9eef1] dark:bg-[#18232b]">
          <div className="absolute inset-0 opacity-75 transition-transform" style={{ transform: `scale(${zoom})`, backgroundImage: "linear-gradient(28deg, transparent 47%, rgba(255,255,255,.88) 48%, rgba(255,255,255,.88) 51%, transparent 52%), linear-gradient(118deg, transparent 45%, rgba(255,255,255,.7) 46%, rgba(255,255,255,.7) 49%, transparent 50%), repeating-linear-gradient(0deg, transparent 0 47px, rgba(101,119,130,.08) 48px 49px), repeating-linear-gradient(90deg, transparent 0 47px, rgba(101,119,130,.08) 48px 49px)" }} />
          {layersVisible ? <><div className="absolute left-[13%] top-[17%] h-24 w-40 rotate-[-7deg] rounded-3xl bg-emerald-200/45 dark:bg-emerald-800/25" /><div className="absolute bottom-[12%] right-[13%] h-28 w-52 rotate-[8deg] rounded-3xl bg-sky-200/45 dark:bg-sky-800/20" /></> : null}

          <div className="absolute left-4 top-4 z-10 grid overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] shadow-lg">
            <button type="button" className="grid size-10 place-items-center border-b border-[var(--line)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]" aria-label="Yakınlaştır" onClick={() => setZoom((value) => Math.min(1.4, value + .1))}>+</button>
            <button type="button" className="grid size-10 place-items-center border-b border-[var(--line)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]" aria-label="Uzaklaştır" onClick={() => setZoom((value) => Math.max(.8, value - .1))}>−</button>
            <button type="button" className="grid size-10 place-items-center text-[var(--text-soft)] hover:bg-[var(--surface-soft)]" aria-label="Haritayı ortala" onClick={() => setZoom(1)}><LocateFixed size={16} /></button>
          </div>

          {locations.map((location) => (
            <button
              type="button"
              key={location.id}
              aria-label={`${location.name} konumunu seç`}
              aria-pressed={selectedId === location.id}
              onClick={() => setSelectedId(location.id)}
              className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-lg transition hover:scale-110 ${selectedId === location.id ? "size-7 ring-4 ring-blue-500/20" : "size-5"}`}
              style={{ left: `${location.x}%`, top: `${location.y}%`, background: location.tone }}
            />
          ))}

          <article className="absolute bottom-5 left-5 z-10 w-[min(390px,calc(100%-40px))] rounded-2xl border border-white/65 bg-white/90 p-4 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/82 dark:text-white">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"><Building2 size={19} /></span>
              <div className="min-w-0 flex-1"><p className="text-[10px] font-bold tracking-[.14em] text-slate-500 dark:text-slate-400">SEÇİLİ KONUM · {selected.id}</p><h2 className="mt-1 text-base font-semibold">{selected.name}</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{selected.city} / {selected.district} · {selected.address}</p></div>
              <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => { setEditId(selected.id); setNewName(selected.name); setShowCreate(true); }}>Düzenle</button>
            </div>
          </article>
        </div>

        <aside className="flex min-h-0 flex-col border-t border-[var(--line)] bg-[var(--surface-raised)] xl:border-l xl:border-t-0">
          <div className="border-b border-[var(--line)] p-4">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-[var(--text-soft)] focus-within:border-[var(--blue)] focus-within:ring-2 focus-within:ring-[var(--blue-soft)]">
              <Search size={16} aria-hidden />
              <input className="min-w-0 flex-1 border-0 bg-transparent text-xs text-[var(--text)] outline-none" placeholder="Konum adı veya adres ara" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[.14em] text-[var(--text-faint)]">KONUMLAR · {visibleLocations.length}</p>
              <div className="flex gap-1"><button type="button" className={`grid size-8 place-items-center rounded-lg text-[var(--text-soft)] hover:bg-[var(--surface-soft)]${layersVisible ? " bg-[var(--blue-soft)] text-[var(--blue)]" : ""}`} aria-label="Katmanlar" aria-pressed={layersVisible} onClick={() => setLayersVisible((value) => !value)}><Layers3 size={16} /></button><button type="button" className="grid size-8 place-items-center rounded-lg text-[var(--text-soft)] hover:bg-[var(--surface-soft)]" aria-label="Yenile" onClick={() => { setQuery(""); setSelectedId(locations[0]?.id ?? ""); }}><RefreshCw size={16} /></button></div>
            </div>
          </div>
          <div className="grid gap-2 overflow-y-auto p-3">
            {visibleLocations.map((location) => <button type="button" key={location.id} onClick={() => setSelectedId(location.id)} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${selectedId === location.id ? "border-blue-500/35 bg-[var(--blue-soft)]" : "border-transparent hover:border-[var(--line)] hover:bg-[var(--surface-soft)]"}`}>
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg" style={{ color: location.tone, background: `color-mix(in srgb, ${location.tone} 12%, transparent)` }}><MapPin size={16} /></span>
              <span className="min-w-0"><strong className="block truncate text-xs font-semibold text-[var(--text)]">{location.name}</strong><small className="mt-1 block truncate text-[10px] text-[var(--text-soft)]">{location.city} / {location.district}</small><small className="mt-1 block truncate text-[10px] text-[var(--text-faint)]">{location.address}</small></span>
            </button>)}
          </div>
        </aside>
      </section>

      {showCreate ? <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
        <section role="dialog" aria-modal="true" aria-label="Konum ekle" className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] shadow-2xl">
          <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4"><div><p className="text-[10px] font-bold tracking-[.14em] text-[var(--text-faint)]">HARİTA YÖNETİMİ</p><h2 className="mt-1 text-base font-semibold text-[var(--text)]">{editId ? "Konumu Düzenle" : "Konum Ekle"}</h2></div><button type="button" className="grid size-8 place-items-center rounded-lg hover:bg-[var(--surface-soft)]" onClick={() => { setShowCreate(false); setEditId(null); }} aria-label="Pencereyi kapat"><X size={17} /></button></header>
          <div className="grid gap-2 p-5"><label className="text-xs font-semibold text-[var(--text-soft)]" htmlFor="new-location">Konum adı</label><input id="new-location" className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs text-[var(--text)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)]" placeholder="Örn. Teknik Merkez" value={newName} onChange={(event) => setNewName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addLocation(); }} /></div>
          <footer className="flex justify-end gap-2 border-t border-[var(--line)] px-5 py-4"><button type="button" className="secondary-button" onClick={() => { setShowCreate(false); setEditId(null); }}>Vazgeç</button><button type="button" className="primary-button" onClick={addLocation} disabled={!newName.trim()}><Check size={16} /> Kaydet</button></footer>
        </section>
      </div> : null}
    </div>
  );
}
