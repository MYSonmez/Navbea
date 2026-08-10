"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Download,
  Filter,
  Focus,
  Gauge,
  Layers3,
  List,
  LocateFixed,
  Map,
  MapPin,
  MoreHorizontal,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  Siren,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  Users,
  UsersRound,
  Wifi,
  WifiOff,
  Wrench,
} from "lucide-react";

const MonitoringMap = dynamic(() => import("./MonitoringMap"), {
  ssr: false,
  loading: () => <div className="monitor-map-loading"><Map size={24} /><span>Harita hazırlanıyor…</span></div>,
});

type MonitoringId = "live" | "emergency" | "summary" | "alarm-dashboard" | "active-tasks";
type Tone = "blue" | "teal" | "amber" | "coral" | "violet" | "slate";

const chartTooltip = {
  borderRadius: 12,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--text)",
  boxShadow: "var(--shadow)",
};

const liveAssets = [
  { id: "NV-2048", name: "Mustafa Aydın", kind: "Personel", area: "A Blok", state: "Hareketli", updated: "12 sn", tone: "blue" as Tone },
  { id: "NV-2014", name: "Merve Kaya", kind: "Personel", area: "B Blok", state: "Sabit", updated: "34 sn", tone: "teal" as Tone },
  { id: "EQ-0296", name: "Termal Kamera 03", kind: "Ekipman", area: "C Blok", state: "Çevrimiçi", updated: "8 sn", tone: "violet" as Tone },
  { id: "VS-0011", name: "Deniz Akın", kind: "Misafir", area: "A Blok", state: "İçeride", updated: "1 dk", tone: "amber" as Tone },
  { id: "EQ-0187", name: "Forklift 07", kind: "Ekipman", area: "D Blok", state: "Düşük pil", updated: "4 dk", tone: "coral" as Tone },
  { id: "NV-1988", name: "Ahmet Demir", kind: "Personel", area: "C Blok", state: "Alarm", updated: "2 dk", tone: "coral" as Tone },
];

const emergencyPeople = [
  { id: "P-1048", name: "Ahmet Demir", team: "Elektrik", area: "C Blok", state: "Doğrulanamadı", lastSeen: "C Blok · 2. Kat", elapsed: "6 dk" },
  { id: "P-1082", name: "Cemal Yıldız", team: "Taşeron", area: "D Blok", state: "Dışarıda", lastSeen: "D Blok · Atölye", elapsed: "4 dk" },
  { id: "P-1096", name: "Hasan Şahin", team: "Bakım", area: "C Blok", state: "Doğrulanamadı", lastSeen: "C Blok · Zemin", elapsed: "8 dk" },
  { id: "P-1114", name: "Merve Kaya", team: "Operasyon", area: "A Blok", state: "Güvende", lastSeen: "Toplanma Alanı 1", elapsed: "1 dk" },
  { id: "P-1120", name: "Deniz Akın", team: "Misafir", area: "B Blok", state: "Dışarıda", lastSeen: "B Blok · Giriş", elapsed: "3 dk" },
];

const locations = [
  { id: "loc-1", name: "Merkez Kampüs", detail: "4 blok · 18 alan", people: 184, registered: 296, capacity: 68, visitors: 11, equipment: 296, alarms: 3, offline: 2, freshness: "12 sn", tone: "coral" as Tone, trend: [48, 52, 55, 61, 68, 64, 68] },
  { id: "loc-2", name: "Teknopol", detail: "3 kat · 12 alan", people: 68, registered: 92, capacity: 74, visitors: 4, equipment: 88, alarms: 0, offline: 1, freshness: "28 sn", tone: "teal" as Tone, trend: [44, 51, 63, 69, 72, 75, 74] },
  { id: "loc-3", name: "Yatağan Tesis", detail: "2 blok · 9 alan", people: 42, registered: 78, capacity: 54, visitors: 2, equipment: 64, alarms: 1, offline: 4, freshness: "2 dk", tone: "amber" as Tone, trend: [62, 59, 57, 55, 51, 56, 54] },
  { id: "loc-4", name: "Amsterdam Ofis", detail: "2 kat · 7 alan", people: 31, registered: 48, capacity: 65, visitors: 6, equipment: 38, alarms: 0, offline: 0, freshness: "18 sn", tone: "teal" as Tone, trend: [35, 42, 48, 58, 63, 66, 65] },
  { id: "loc-5", name: "Etiler Merkez", detail: "1 kat · 5 alan", people: 0, registered: 24, capacity: 0, visitors: 0, equipment: 18, alarms: 0, offline: 6, freshness: "3 sa", tone: "slate" as Tone, trend: [0, 0, 0, 0, 0, 0, 0] },
];

const alarmTrend = [
  { time: "08:00", critical: 1, warning: 2, info: 3 },
  { time: "10:00", critical: 2, warning: 4, info: 5 },
  { time: "12:00", critical: 1, warning: 5, info: 4 },
  { time: "14:00", critical: 4, warning: 3, info: 6 },
  { time: "16:00", critical: 2, warning: 4, info: 3 },
  { time: "18:00", critical: 1, warning: 2, info: 2 },
];

const alarmKinds = [
  { name: "Hareketsizlik", value: 18 },
  { name: "Acil durum butonu", value: 14 },
  { name: "Yetkisiz geçiş", value: 9 },
  { name: "Kapasite aşımı", value: 7 },
  { name: "Düşük pil", value: 5 },
];

const alarmLocations = [
  { name: "Teknopol", value: 19 },
  { name: "Merkez Kampüs", value: 14 },
  { name: "Yatağan", value: 8 },
  { name: "Amsterdam", value: 5 },
];

const initialIncidents = [
  { id: "AL-8421", name: "Kişi hareket etmiyor", source: "Mustafa Aydın", location: "Teknopol · Atölye", priority: "Kritik", age: "3 dk", repeats: 17, status: "Açık" },
  { id: "AL-8418", name: "Acil durum butonu", source: "Test Personeli", location: "Teknopol · Zemin", priority: "Kritik", age: "7 dk", repeats: 3, status: "Onaylandı" },
  { id: "AL-8409", name: "Yetkisiz bölge girişi", source: "Misafir Kartı 18", location: "Merkez · Arşiv", priority: "Uyarı", age: "18 dk", repeats: 1, status: "Atandı" },
];

const alarmHistory = [
  ["AL-8421", "08.08.2026 15:39", "Kişi hareket etmiyor", "Atölye", "Zemin", "Mustafa Aydın", "Teknopol", "Personel", "Kritik", "Açık"],
  ["AL-8418", "08.08.2026 15:35", "Acil durum butonu", "Üretim", "Zemin", "Test Personeli", "Teknopol", "Personel", "Kritik", "Onaylandı"],
  ["AL-8409", "08.08.2026 15:24", "Yetkisiz bölge", "Arşiv", "1. Kat", "Misafir Kartı 18", "Merkez Kampüs", "Geçiş", "Uyarı", "Atandı"],
  ["AL-8388", "08.08.2026 14:51", "Düşük pil", "Depo", "Zemin", "Beacon 122", "Yatağan", "Cihaz", "Bilgi", "Çözüldü"],
];

const initialTasks = [
  { id: "TSK-126", title: "C Blok alarm noktasını kontrol et", owner: "Ahmet Demir", team: "Güvenlik", location: "C Blok", due: "15:20", priority: "Kritik", status: "Gecikti", progress: 35 },
  { id: "TSK-125", title: "Forklift 07 pil değişimi", owner: "Merve Kaya", team: "Teknik", location: "D Blok", due: "16:30", priority: "Yüksek", status: "Devam ediyor", progress: 60 },
  { id: "TSK-124", title: "Toplanma alanı yönlendirmelerini denetle", owner: "Hasan Şahin", team: "İSG", location: "A Blok", due: "17:00", priority: "Orta", status: "Bugün", progress: 20 },
  { id: "TSK-123", title: "Misafir kartlarını teslim al", owner: "Atanmamış", team: "Operasyon", location: "Ana Giriş", due: "18:00", priority: "Orta", status: "Atanmamış", progress: 0 },
  { id: "TSK-122", title: "Gateway bağlantısını doğrula", owner: "Cemal Yıldız", team: "Teknik", location: "B Blok", due: "Yarın 10:00", priority: "Düşük", status: "Planlandı", progress: 0 },
];

function MonitoringHeader({ title, eyebrow, status, children }: { title: string; eyebrow: string; status?: string; children?: React.ReactNode }) {
  return (
    <header className="monitor-page-header">
      <div><p className="eyebrow">{eyebrow}</p><div className="monitor-title-line"><h1>{title}</h1>{status ? <span className="monitor-live-pill"><span />{status}</span> : null}</div><small>Son veri 15:42:18</small></div>
      <div className="monitor-header-actions">{children}</div>
    </header>
  );
}

function FilterPopover({ kind = "general" }: { kind?: "general" | "alarm" | "tasks" }) {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  return (
    <div className="monitor-filter-wrap">
      <button className={`monitor-button ${applied ? "is-active" : ""}`} onClick={() => setOpen((value) => !value)} aria-expanded={open}><Filter size={16} /> Filtrele <ChevronDown size={14} /></button>
      {open ? <div className="monitor-filter-popover">
        <label><span>Konum</span><select><option>Tüm konumlar</option><option>Merkez Kampüs</option><option>Teknopol</option></select></label>
        {kind === "alarm" ? <label><span>Öncelik</span><select><option>Tüm öncelikler</option><option>Kritik</option><option>Uyarı</option></select></label> : null}
        {kind === "tasks" ? <label><span>Ekip</span><select><option>Tüm ekipler</option><option>Teknik</option><option>Güvenlik</option><option>İSG</option></select></label> : null}
        <label><span>Zaman</span><select><option>Şu an</option><option>Son 24 saat</option><option>Son 7 gün</option></select></label>
        <div><button className="monitor-button" onClick={() => { setApplied(false); setOpen(false); }}>Temizle</button><button className="monitor-button primary" onClick={() => { setApplied(true); setOpen(false); }}>Uygula</button></div>
      </div> : null}
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone = "blue", onClick, active }: { label: string; value: string; detail: string; icon: typeof Activity; tone?: Tone; onClick?: () => void; active?: boolean }) {
  const content = <><span className={`monitor-metric-icon ${tone}`}><Icon size={19} /></span><span><small>{label}</small><strong>{value}</strong><em>{detail}</em></span></>;
  return onClick ? <button className={`monitor-metric-card ${active ? "active" : ""}`} onClick={onClick}>{content}</button> : <article className="monitor-metric-card">{content}</article>;
}

function ViewSwitch({ value, setValue, options }: { value: string; setValue: (value: string) => void; options: { id: string; label: string; icon?: typeof List }[] }) {
  return <div className="monitor-view-switch">{options.map(({ id, label, icon: Icon }) => <button key={id} className={value === id ? "active" : ""} onClick={() => setValue(id)}>{Icon ? <Icon size={15} /> : null}{label}</button>)}</div>;
}

function SimpleBars({ items, tone = "blue" }: { items: { name: string; value: number }[]; tone?: Tone }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return <div className="monitor-simple-bars">{items.map((item) => <div key={item.name}><span><strong>{item.name}</strong><em>{item.value}</em></span><i><b className={tone} style={{ width: `${item.value / max * 100}%` }} /></i></div>)}</div>;
}

function LiveMonitoringView() {
  const [kind, setKind] = useState("Tümü");
  const [area, setArea] = useState("Tüm alanlar");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(liveAssets[0].id);
  const filtered = liveAssets.filter((asset) => (kind === "Tümü" || asset.kind === kind) && `${asset.name} ${asset.id} ${asset.area}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")));
  return <div className="monitor-page live-monitor-page">
    <MonitoringHeader eyebrow="İZLEME · MERKEZ KAMPÜS" title="Canlı İzle" status="Canlı"><FilterPopover /><button className="monitor-icon-button" aria-label="Veriyi yenile"><RefreshCw size={17} /></button></MonitoringHeader>
    <section className="monitor-map-toolbar panel">
      <label><MapPin size={15} /><select aria-label="Konum"><option>Merkez Kampüs</option><option>Teknopol</option></select></label>
      <label><Layers3 size={15} /><select aria-label="Kat"><option>Tüm katlar</option><option>Zemin</option><option>1. Kat</option><option>2. Kat</option></select></label>
      <label><Focus size={15} /><select value={area} onChange={(event) => setArea(event.target.value)} aria-label="Alan"><option>Tüm alanlar</option><option>A Blok</option><option>B Blok</option><option>C Blok</option><option>D Blok</option></select></label>
      <span className="monitor-connection"><Wifi size={15} /> 2.386 güncel <i /> 5 gecikmeli</span>
    </section>
    <section className="monitor-live-metrics">
      <MetricCard label="Tüm varlıklar" value="2.391" detail="Kampüs genelinde" icon={LocateFixed} tone="blue" active={kind === "Tümü"} onClick={() => setKind("Tümü")} />
      <MetricCard label="Personel" value="2.084" detail="%87,2" icon={Users} tone="blue" active={kind === "Personel"} onClick={() => setKind("Personel")} />
      <MetricCard label="Ekipman" value="296" detail="5 çevrimdışı" icon={Wrench} tone="violet" active={kind === "Ekipman"} onClick={() => setKind("Ekipman")} />
      <MetricCard label="Misafir" value="11" detail="3 farklı alan" icon={UserCheck} tone="amber" active={kind === "Misafir"} onClick={() => setKind("Misafir")} />
      <MetricCard label="Aktif alarm" value="3" detail="2 kritik" icon={Bell} tone="coral" onClick={() => setKind("Tümü")} />
    </section>
    <div className="monitor-live-layout">
      <section className="monitor-map-shell panel"><MonitoringMap mode="live" filter={kind} selectedArea={area} /><div className="monitor-map-legend"><span><i className="blue" />Personel</span><span><i className="violet" />Ekipman</span><span><i className="amber" />Misafir</span><span><i className="coral" />Aksiyon</span></div></section>
      <aside className="monitor-asset-drawer panel">
        <div className="monitor-panel-title"><div><p className="eyebrow">VARLIKLAR</p><h2>Canlı liste</h2></div><button className="monitor-icon-button" aria-label="Liste ayarları"><SlidersHorizontal size={16} /></button></div>
        <label className="monitor-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kişi, cihaz veya alan ara" /></label>
        <div className="monitor-asset-list">{filtered.map((asset) => <button key={asset.id} className={selected === asset.id ? "selected" : ""} onClick={() => { setSelected(asset.id); setArea(asset.area); }}><i className={asset.tone} /><span><strong>{asset.name}</strong><small>{asset.id} · {asset.kind} · {asset.area}</small></span><em>{asset.updated}</em></button>)}</div>
        <div className="monitor-signal-summary"><span><Wifi size={16} /> Çevrimiçi <strong>99,8%</strong></span><i><b /></i><small>Son 5 dakikada 2.386 varlıktan güncel veri alındı.</small></div>
      </aside>
    </div>
  </div>;
}

function EmergencyView() {
  const [tab, setTab] = useState("Tümü");
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const people = emergencyPeople
    .map((person) => checked.includes(person.id) ? { ...person, state: "Güvende", lastSeen: "Manuel doğrulama" } : person)
    .filter((person) => tab === "Tümü" || person.state === tab)
    .filter((person) => `${person.name} ${person.id} ${person.team} ${person.area}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")));
  const download = () => {
    const rows = ["ID,Ad Soyad,Ekip,Durum,Son Konum", ...people.map((person) => [person.id, person.name, person.team, person.state, person.lastSeen].join(","))];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "acil-durum-yoklama.csv"; anchor.click(); URL.revokeObjectURL(url);
  };
  return <div className="monitor-page emergency-monitor-page">
    <MonitoringHeader eyebrow="İZLEME · ACİL DURUM OPERASYONU" title="Acil Durum" status="Canlı yoklama"><FilterPopover /><button className="monitor-button" onClick={download}><Download size={16} /> Rapor</button></MonitoringHeader>
    <section className="monitor-emergency-status panel">
      <div className="monitor-emergency-metrics"><MetricCard label="Beklenen" value="128" detail="Toplam kişi" icon={UsersRound} tone="blue" /><MetricCard label="Güvende" value={`${104 + checked.length}`} detail="%81,3" icon={CheckCircle2} tone="teal" /><MetricCard label="Dışarıda" value="17" detail="Takip ediliyor" icon={LocateFixed} tone="amber" /><MetricCard label="Doğrulanamadı" value={`${Math.max(0, 7 - checked.length)}`} detail="Acil aksiyon" icon={Siren} tone="coral" /></div>
      <div className="monitor-assembly-progress" aria-label="Yoklama durum dağılımı"><span className="safe" style={{ width: `${(104 + checked.length) / 128 * 100}%` }} /><span className="outside" style={{ width: "13.3%" }} /><span className="missing" style={{ flex: 1 }} /></div>
      <div className="monitor-progress-legend"><span><i className="teal" />Güvende 104</span><span><i className="amber" />Dışarıda 17</span><span><i className="coral" />Doğrulanamadı 7</span><em>Son yoklama 15:42:18</em></div>
    </section>
    <div className="monitor-emergency-grid">
      <section className="monitor-map-shell panel"><div className="monitor-panel-title"><div><p className="eyebrow">SAHA</p><h2>Toplanma alanları ve son konumlar</h2></div><span className="monitor-soft-badge amber"><Radio size={13} /> Canlı</span></div><div className="monitor-emergency-map"><MonitoringMap mode="emergency" /></div></section>
      <aside className="monitor-priority-panel panel"><div className="monitor-panel-title"><div><p className="eyebrow">ÖNCELİKLİ AKSİYON</p><h2>Doğrulama bekleyenler</h2></div><strong>{Math.max(0, 7 - checked.length)}</strong></div><div className="monitor-priority-list">{emergencyPeople.filter((person) => person.state !== "Güvende" && !checked.includes(person.id)).map((person) => <article key={person.id}><span className={`monitor-avatar ${person.state === "Doğrulanamadı" ? "coral" : "amber"}`}>{person.name.split(" ").map((part) => part[0]).join("")}</span><div><strong>{person.name}</strong><small>{person.team} · {person.lastSeen}</small><em>{person.elapsed} önce</em></div><button onClick={() => setChecked((current) => [...current, person.id])}><Check size={15} /> Doğrula</button></article>)}</div>{checked.length ? <div className="monitor-inline-success"><CheckCircle2 size={16} /> {checked.length} kişi manuel olarak doğrulandı.</div> : null}</aside>
    </div>
    <div className="monitor-emergency-bottom">
      <section className="panel monitor-zone-status"><div className="monitor-panel-title"><div><p className="eyebrow">BÖLGE DURUMU</p><h2>Toplanma oranı</h2></div></div><SimpleBars tone="teal" items={[{ name: "A Blok", value: 96 }, { name: "B Blok", value: 88 }, { name: "C Blok", value: 71 }, { name: "D Blok", value: 83 }]} /></section>
      <section className="panel monitor-roster"><div className="monitor-roster-head"><ViewSwitch value={tab} setValue={setTab} options={[{ id: "Tümü", label: "Tümü" }, { id: "Güvende", label: "Toplanma alanında" }, { id: "Dışarıda", label: "Dışarıda" }, { id: "Doğrulanamadı", label: "Doğrulanamayan" }]} /><label className="monitor-search compact"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kişi ara" /></label></div><div className="monitor-table-wrap"><table><thead><tr><th>ID</th><th>Ad Soyad</th><th>Ekip</th><th>Son konum</th><th>Süre</th><th>Durum</th></tr></thead><tbody>{people.map((person) => <tr key={person.id}><td className="mono">{person.id}</td><td><strong>{person.name}</strong></td><td>{person.team}</td><td>{person.lastSeen}</td><td>{person.elapsed}</td><td><span className={`monitor-status ${person.state === "Güvende" ? "teal" : person.state === "Dışarıda" ? "amber" : "coral"}`}>{person.state}</span></td></tr>)}</tbody></table></div></section>
    </div>
  </div>;
}

function LocationSummaryView() {
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(locations[0].id);
  const [onlyActive, setOnlyActive] = useState(true);
  const [query, setQuery] = useState("");
  const selected = locations.find((location) => location.id === selectedId) ?? locations[0];
  const visible = locations
    .filter((location) => !onlyActive || location.people || location.alarms)
    .filter((location) => `${location.name} ${location.detail}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")));
  return <div className="monitor-page location-monitor-page">
    <MonitoringHeader eyebrow="İZLEME · TESİSLER" title="Konum Özeti"><FilterPopover /><button className="monitor-icon-button" aria-label="Veriyi yenile"><RefreshCw size={17} /></button></MonitoringHeader>
    <section className="monitor-summary-metrics"><MetricCard label="İçerideki personel" value="325" detail="538 kayıtlı" icon={Users} tone="blue" /><MetricCard label="Misafir" value="23" detail="4 konumda" icon={UserCheck} tone="amber" /><MetricCard label="Ekipman" value="504" detail="493 çevrimiçi" icon={Wrench} tone="violet" /><MetricCard label="Aktif alarm" value="4" detail="3 aksiyon bekliyor" icon={Bell} tone="coral" /><MetricCard label="Çevrimdışı cihaz" value="13" detail="6 uzun süreli" icon={WifiOff} tone="slate" /></section>
    <section className="monitor-location-toolbar panel"><ViewSwitch value={view} setValue={setView} options={[{ id: "list", label: "Liste", icon: List }, { id: "map", label: "Harita", icon: Map }, { id: "compare", label: "Karşılaştır", icon: BarChart3 }]} /><label className="monitor-checkbox"><input type="checkbox" checked={onlyActive} onChange={(event) => setOnlyActive(event.target.checked)} /> Yalnızca aktif konumlar</label><label className="monitor-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Konum ara" /></label></section>
    {view === "list" ? <div className="monitor-location-layout">
      <section className="panel monitor-location-list"><div className="monitor-location-list-head"><span>Konum</span><span>Doluluk</span><span>Varlıklar</span><span>Sağlık</span></div>{visible.map((location) => <button key={location.id} className={selectedId === location.id ? "selected" : ""} onClick={() => setSelectedId(location.id)}><span><i className={location.tone} /><span><strong>{location.name}</strong><small>{location.detail} · Son veri {location.freshness}</small></span></span><span className="monitor-capacity"><strong>%{location.capacity}</strong><i><b className={location.capacity > 80 ? "coral" : location.capacity > 65 ? "amber" : "teal"} style={{ width: `${location.capacity}%` }} /></i></span><span className="monitor-location-counts"><small><Users size={13} />{location.people}</small><small><UserCheck size={13} />{location.visitors}</small><small><Wrench size={13} />{location.equipment}</small></span><span>{location.alarms ? <em className="monitor-status coral">{location.alarms} alarm</em> : location.offline ? <em className="monitor-status amber">{location.offline} çevrimdışı</em> : <em className="monitor-status teal">Normal</em>}</span></button>)}</section>
      <aside className="panel monitor-location-detail"><div className="monitor-panel-title"><div><p className="eyebrow">SEÇİLİ KONUM</p><h2>{selected.name}</h2></div><span className={`monitor-soft-badge ${selected.tone}`}><CircleDot size={13} /> {selected.alarms ? "Aksiyon gerekli" : "Normal"}</span></div><div className="monitor-location-map"><MonitoringMap mode="summary" /></div><div className="monitor-detail-kpis"><span><small>İçeride</small><strong>{selected.people}</strong></span><span><small>Misafir</small><strong>{selected.visitors}</strong></span><span><small>Ekipman</small><strong>{selected.equipment}</strong></span><span><small>Alarm</small><strong>{selected.alarms}</strong></span></div><div className="monitor-sparkline"><div><small>Son 24 saat doluluk</small><strong>%{selected.capacity}</strong></div><ResponsiveContainer width="100%" height={72}><AreaChart data={selected.trend.map((value, index) => ({ index, value }))}><defs><linearGradient id="locationGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-blue)" stopOpacity={.28} /><stop offset="100%" stopColor="var(--chart-blue)" stopOpacity={0} /></linearGradient></defs><Area dataKey="value" type="monotone" stroke="var(--chart-blue)" strokeWidth={2.5} fill="url(#locationGradient)" /></AreaChart></ResponsiveContainer></div></aside>
    </div> : null}
    {view === "map" ? <section className="panel monitor-location-full-map"><MonitoringMap mode="summary" /></section> : null}
    {view === "compare" ? <div className="monitor-compare-grid"><section className="panel monitor-chart-panel"><div className="monitor-panel-title"><div><p className="eyebrow">KAPASİTE</p><h2>Konum doluluk karşılaştırması</h2></div></div><ResponsiveContainer width="100%" height={310}><BarChart data={locations} layout="vertical" margin={{ left: 12, right: 24 }}><CartesianGrid horizontal={false} stroke="var(--chart-grid)" /><XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `%${value}`} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={108} axisLine={false} tickLine={false} /><Tooltip contentStyle={chartTooltip} formatter={(value) => [`%${value}`, "Doluluk"]} /><Bar dataKey="capacity" radius={[0, 7, 7, 0]} fill="var(--chart-blue)" /></BarChart></ResponsiveContainer></section><section className="panel monitor-chart-panel"><div className="monitor-panel-title"><div><p className="eyebrow">SAĞLIK</p><h2>Alarm ve çevrimdışı cihazlar</h2></div></div><ResponsiveContainer width="100%" height={310}><BarChart data={locations}><CartesianGrid vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} /><YAxis axisLine={false} tickLine={false} /><Tooltip contentStyle={chartTooltip} /><Bar dataKey="alarms" name="Alarm" stackId="health" fill="var(--chart-coral)" /><Bar dataKey="offline" name="Çevrimdışı" stackId="health" fill="var(--chart-amber)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></section></div> : null}
  </div>;
}

function AlarmSummaryView() {
  const [view, setView] = useState("live");
  const [incidents, setIncidents] = useState(initialIncidents);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const updateIncident = (id: string, status: string) => setIncidents((current) => current.map((incident) => incident.id === id ? { ...incident, status } : incident));
  const paretoTotal = alarmKinds.reduce((sum, item) => sum + item.value, 0);
  const pareto = alarmKinds.map((item, index) => ({
    ...item,
    cumulative: Math.round(alarmKinds.slice(0, index + 1).reduce((sum, current) => sum + current.value, 0) / paretoTotal * 100),
  }));
  return <div className="monitor-page alarm-monitor-page">
    <MonitoringHeader eyebrow="İZLEME · OLAY YÖNETİMİ" title="Alarm Özeti" status="2 canlı alarm"><FilterPopover kind="alarm" /><button className="monitor-icon-button" aria-label="Veriyi yenile"><RefreshCw size={17} /></button></MonitoringHeader>
    <div className="monitor-top-switch"><ViewSwitch value={view} setValue={setView} options={[{ id: "live", label: "Canlı" }, { id: "history", label: "Geçmiş" }, { id: "analysis", label: "Analiz" }]} /></div>
    <section className="monitor-summary-metrics"><MetricCard label="Açık kritik" value="2" detail="Aksiyon bekliyor" icon={ShieldAlert} tone="coral" /><MetricCard label="Onay bekleyen" value="1" detail="3 dakikadır" icon={Bell} tone="amber" /><MetricCard label="Atanmamış" value="1" detail="Sorumlu seçilmeli" icon={Users} tone="violet" /><MetricCard label="Ort. onay süresi" value="2d 18s" detail="Hedefin içinde" icon={Clock3} tone="teal" /><MetricCard label="Ort. çözüm süresi" value="18d 42s" detail="Son 30 gün" icon={Gauge} tone="blue" /></section>
    {view === "live" ? <>
      <div className="monitor-alarm-live-grid"><section className="panel monitor-chart-panel"><div className="monitor-panel-title"><div><p className="eyebrow">BUGÜN</p><h2>Alarm yoğunluğu</h2></div><span className="monitor-soft-badge teal"><Activity size={13} /> Güncel</span></div><ResponsiveContainer width="100%" height={300}><AreaChart data={alarmTrend}><defs><linearGradient id="criticalArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-coral)" stopOpacity={.45} /><stop offset="1" stopColor="var(--chart-coral)" stopOpacity={.05} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="time" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip contentStyle={chartTooltip} /><Area type="monotone" dataKey="info" name="Bilgi" stackId="1" stroke="var(--chart-blue)" fill="var(--blue-soft)" /><Area type="monotone" dataKey="warning" name="Uyarı" stackId="1" stroke="var(--chart-amber)" fill="var(--amber-soft)" /><Area type="monotone" dataKey="critical" name="Kritik" stackId="1" stroke="var(--chart-coral)" fill="url(#criticalArea)" /></AreaChart></ResponsiveContainer><div className="monitor-chart-legend"><span><i className="coral" />Kritik</span><span><i className="amber" />Uyarı</span><span><i className="blue" />Bilgi</span></div></section>
        <aside className="panel monitor-incident-rail"><div className="monitor-panel-title"><div><p className="eyebrow">CANLI ALARMLAR</p><h2>Aksiyon kuyruğu</h2></div><strong>{incidents.filter((incident) => incident.status !== "Çözüldü").length}</strong></div><div className="monitor-incident-list">{incidents.map((incident) => <article key={incident.id} className={incident.priority === "Kritik" ? "critical" : "warning"}><div><span className={`monitor-status ${incident.priority === "Kritik" ? "coral" : "amber"}`}>{incident.priority}</span><em>{incident.age}</em></div><h3>{incident.name}</h3><p>{incident.source} · {incident.location}</p><small>{incident.repeats > 1 ? `${incident.repeats} tekrar tek olayda gruplandı` : "Tek olay"}</small><div>{incident.status === "Açık" ? <button onClick={() => updateIncident(incident.id, "Onaylandı")}><Check size={14} /> Onayla</button> : <button onClick={() => updateIncident(incident.id, "Çözüldü")}><CheckCircle2 size={14} /> Çöz</button>}<button onClick={() => updateIncident(incident.id, "Atandı")}><Users size={14} /> Ata</button></div></article>)}</div></aside></div>
      <div className="monitor-alarm-breakdowns"><section className="panel"><div className="monitor-panel-title"><div><p className="eyebrow">KAYNAK</p><h2>Alarm tipleri</h2></div></div><SimpleBars items={alarmKinds} tone="coral" /></section><section className="panel"><div className="monitor-panel-title"><div><p className="eyebrow">KONUM</p><h2>En sorunlu konumlar</h2></div></div><SimpleBars items={alarmLocations} tone="amber" /></section></div>
    </> : null}
    {view === "history" ? <section className="panel monitor-history-panel"><div className="monitor-table-toolbar"><label className="monitor-search"><Search size={15} /><input value={historyQuery} onChange={(event) => { setHistoryQuery(event.target.value); setHistoryPage(1); }} placeholder="Alarm, kişi veya konum ara" /></label><button className="monitor-button"><Download size={15} /> Dışa aktar</button></div><div className="monitor-table-wrap"><table><thead><tr>{["ID", "Tarih", "Alarm", "Bölge", "Kat", "Kaynak", "Konum", "Tür", "Öncelik", "Durum"].map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{alarmHistory.filter((row) => row.join(" ").toLocaleLowerCase("tr").includes(historyQuery.toLocaleLowerCase("tr"))).map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{index === 0 ? <span className="mono">{cell}</span> : index === 8 ? <span className={`monitor-status ${cell === "Kritik" ? "coral" : "amber"}`}>{cell}</span> : index === 9 ? <span className="monitor-status blue">{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div><footer className="monitor-table-footer"><span>4 / 20.104 ham kayıt · 1.005 olay</span><div><button disabled={historyPage === 1} onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}>‹</button>{[1,2,3].map((page) => <button key={page} className={historyPage === page ? "active" : ""} onClick={() => setHistoryPage(page)}>{page}</button>)}<button disabled={historyPage === 3} onClick={() => setHistoryPage((page) => Math.min(3, page + 1))}>›</button></div></footer></section> : null}
    {view === "analysis" ? <div className="monitor-analysis-grid"><section className="panel monitor-chart-panel"><div className="monitor-panel-title"><div><p className="eyebrow">PARETO</p><h2>Tekrarlayan alarm nedenleri</h2></div></div><ResponsiveContainer width="100%" height={320}><ComposedChart data={pareto}><CartesianGrid vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} /><YAxis yAxisId="left" axisLine={false} tickLine={false} /><YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(value) => `%${value}`} axisLine={false} tickLine={false} /><Tooltip contentStyle={chartTooltip} /><Bar yAxisId="left" dataKey="value" name="Olay" fill="var(--chart-coral)" radius={[7, 7, 0, 0]} /><Line yAxisId="right" dataKey="cumulative" name="Kümülatif %" stroke="var(--chart-blue)" strokeWidth={3} dot={{ r: 4 }} /></ComposedChart></ResponsiveContainer></section><section className="panel monitor-heatmap-panel"><div className="monitor-panel-title"><div><p className="eyebrow">ZAMAN DESENİ</p><h2>Gün ve saat yoğunluğu</h2></div></div><div className="monitor-heatmap"><div className="monitor-heatmap-hours"><span />{["08", "10", "12", "14", "16", "18"].map((hour) => <strong key={hour}>{hour}</strong>)}</div>{["Pzt", "Sal", "Çar", "Per", "Cum"].map((day, row) => <div className="monitor-heatmap-row" key={day}><em>{day}</em>{[0,1,2,3,4,5].map((column) => <i key={`${day}-${column}`} data-level={(row * 2 + column * 3) % 5} title={`${day} ${8 + column * 2}:00`} />)}</div>)}</div><div className="monitor-client-stack"><span>Kaynak türü</span><i><b className="blue" style={{ width: "48%" }} /><b className="violet" style={{ width: "32%" }} /><b className="amber" style={{ width: "20%" }} /></i><small>Personel %48 · Cihaz %32 · Geçiş %20</small></div></section></div> : null}
  </div>;
}

function ActiveTasksView() {
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("Tümü");
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const visible = tasks
    .filter((task) => filter === "Tümü" || (filter === "Bana Atanan" ? task.owner === "Ahmet Demir" : task.status === filter))
    .filter((task) => `${task.title} ${task.owner} ${task.team} ${task.location}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")));
  const complete = (id: string) => setTasks((current) => current.map((task) => task.id === id ? { ...task, status: "Tamamlandı", progress: 100 } : task));
  const workload = [
    { team: "Teknik", active: 12, late: 2 }, { team: "Güvenlik", active: 9, late: 1 }, { team: "Operasyon", active: 7, late: 0 }, { team: "İSG", active: 5, late: 0 },
  ];
  return <div className="monitor-page tasks-monitor-page">
    <MonitoringHeader eyebrow="İZLEME · İŞ AKIŞI" title="Aktif Görevler"><FilterPopover kind="tasks" /><button className="monitor-button primary"><Sparkles size={16} /> Yeni görev</button></MonitoringHeader>
    <section className="monitor-summary-metrics"><MetricCard label="Açık görev" value="33" detail="4 ekip" icon={List} tone="blue" /><MetricCard label="Devam eden" value="18" detail="Şu anda" icon={Activity} tone="teal" /><MetricCard label="Bugün bitecek" value="7" detail="3 yüksek öncelik" icon={CalendarDays} tone="amber" /><MetricCard label="Geciken" value="3" detail="Aksiyon gerekli" icon={AlertTriangle} tone="coral" /><MetricCard label="Atanmamış" value="2" detail="Sorumlu seçilmeli" icon={Users} tone="violet" /></section>
    <section className="monitor-task-toolbar panel"><ViewSwitch value={view} setValue={setView} options={[{ id: "list", label: "Liste", icon: List }, { id: "team", label: "Ekip", icon: Users }, { id: "calendar", label: "Takvim", icon: CalendarDays }]} /><div className="monitor-quick-filters">{["Tümü", "Bana Atanan", "Gecikti", "Bugün", "Atanmamış"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="monitor-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Görev veya sorumlu ara" /></label></section>
    {view === "list" ? <div className="monitor-task-layout"><section className="panel monitor-task-list"><div className="monitor-task-head"><span>Görev</span><span>Sorumlu</span><span>Plan</span><span>Durum</span><span /></div>{visible.map((task) => <article key={task.id}><div><span className={`monitor-priority-dot ${task.priority === "Kritik" ? "coral" : task.priority === "Yüksek" ? "amber" : "blue"}`} /><span><strong>{task.title}</strong><small>{task.id} · {task.location} · {task.priority}</small></span></div><span><strong>{task.owner}</strong><small>{task.team}</small></span><span><strong>{task.due}</strong><i className="monitor-task-progress"><b style={{ width: `${task.progress}%` }} /></i></span><span className={`monitor-status ${task.status === "Gecikti" ? "coral" : task.status === "Devam ediyor" || task.status === "Tamamlandı" ? "teal" : task.status === "Atanmamış" ? "violet" : "amber"}`}>{task.status}</span><div>{task.status !== "Tamamlandı" ? <button className="monitor-row-action" onClick={() => complete(task.id)}><Check size={14} /> Tamamla</button> : <CheckCircle2 className="monitor-complete-icon" size={19} />}<button className="monitor-icon-button" aria-label={`${task.title} seçenekleri`}><MoreHorizontal size={16} /></button></div></article>)}</section><aside className="panel monitor-workload"><div className="monitor-panel-title"><div><p className="eyebrow">EKİP YÜKÜ</p><h2>Açık görev dağılımı</h2></div></div><ResponsiveContainer width="100%" height={270}><BarChart data={workload} layout="vertical" margin={{ left: 4, right: 10 }}><CartesianGrid horizontal={false} stroke="var(--chart-grid)" /><XAxis type="number" axisLine={false} tickLine={false} /><YAxis dataKey="team" type="category" width={72} axisLine={false} tickLine={false} /><Tooltip contentStyle={chartTooltip} /><Bar dataKey="active" name="Aktif" stackId="task" fill="var(--chart-blue)" /><Bar dataKey="late" name="Geciken" stackId="task" fill="var(--chart-coral)" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer><div className="monitor-chart-legend"><span><i className="blue" />Aktif</span><span><i className="coral" />Geciken</span></div></aside></div> : null}
    {view === "team" ? <section className="panel monitor-chart-panel monitor-task-team"><div className="monitor-panel-title"><div><p className="eyebrow">EKİP KARŞILAŞTIRMA</p><h2>Aktif ve geciken görevler</h2></div></div><ResponsiveContainer width="100%" height={380}><BarChart data={workload}><CartesianGrid vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="team" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip contentStyle={chartTooltip} /><Bar dataKey="active" name="Aktif" fill="var(--chart-blue)" radius={[6,6,0,0]} /><Bar dataKey="late" name="Geciken" fill="var(--chart-coral)" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></section> : null}
    {view === "calendar" ? <section className="panel monitor-task-calendar"><div className="monitor-calendar-head"><button onClick={() => setWeekOffset((offset) => offset - 1)}>‹</button><h2>{weekOffset === 0 ? "8–14 Ağustos 2026" : weekOffset > 0 ? `${15 + (weekOffset - 1) * 7}–${21 + (weekOffset - 1) * 7} Ağustos 2026` : `${1 + (weekOffset + 1) * 7}–${7 + (weekOffset + 1) * 7} Ağustos 2026`}</h2><button onClick={() => setWeekOffset((offset) => offset + 1)}>›</button></div><div className="monitor-calendar-grid">{["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"].map((day, index) => <article key={day} className={weekOffset === 0 && index === 5 ? "today" : ""}><strong>{day}<span>{3 + index + weekOffset * 7}</span></strong>{initialTasks.slice(index % 3, index % 3 + (index % 2 ? 1 : 2)).map((task) => <button key={`${day}-${task.id}`}><i className={task.priority === "Kritik" ? "coral" : "blue"} />{task.title}</button>)}</article>)}</div></section> : null}
  </div>;
}

export function MonitoringView({ id }: { id: MonitoringId }) {
  if (id === "live") return <LiveMonitoringView />;
  if (id === "emergency") return <EmergencyView />;
  if (id === "summary") return <LocationSummaryView />;
  if (id === "alarm-dashboard") return <AlarmSummaryView />;
  return <ActiveTasksView />;
}
