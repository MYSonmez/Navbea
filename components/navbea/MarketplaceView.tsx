"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  PackageSearch,
  Radio,
  Search,
  ShieldAlert,
  Sparkles,
  Store,
  TimerReset,
  UserRoundPlus,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

type MarketplaceCategory = "Tesis" | "Güvenlik" | "Operasyon" | "İnsan" | "IoT";
type MarketplaceBadge = "Hazır" | "Yeni" | "Popüler";

type MarketplaceUseCase = {
  id: string;
  title: string;
  category: MarketplaceCategory;
  description: string;
  capabilities: string[];
  icon: LucideIcon;
  tone: "blue" | "teal" | "amber" | "coral" | "violet" | "slate";
  badge: MarketplaceBadge;
  serviceId: string;
  publisher: string;
  installs: number;
  version: string;
  featured?: boolean;
  preview: [string, string, string];
};

const USE_CASES: MarketplaceUseCase[] = [
  { id: "space-intelligence", title: "Akıllı Alan Kullanımı", category: "Tesis", description: "Kat ve bölgelerdeki yoğunluğu, kullanım süresini ve kapasite aşımını birlikte izleyin.", capabilities: ["Canlı yoğunluk haritası", "Doluluk eğilimi", "Kapasite alarmı"], icon: Building2, tone: "blue", badge: "Popüler", serviceId: "summary", publisher: "Navbea Spatial", installs: 286, version: "2.4", featured: true, preview: ["12 alan", "%74 doluluk", "2 eşik"] },
  { id: "emergency-readiness", title: "Acil Durum ve Toplanma", category: "Güvenlik", description: "Tahliye sırasında personel durumunu, toplanma bölgelerini ve eksik kişileri gerçek zamanlı takip edin.", capabilities: ["Toplanma sayımı", "Eksik kişi listesi", "Kritik bildirim"], icon: ShieldAlert, tone: "coral", badge: "Hazır", serviceId: "emergency", publisher: "Navbea Safety", installs: 214, version: "3.1", preview: ["4 bölge", "2.084 kişi", "32 kritik"] },
  { id: "asset-tracking", title: "Ekipman ve El Aleti Takibi", category: "Operasyon", description: "Paylaşılan ekipmanların son konumunu, kullanım durumunu ve sorumlu personelini görün.", capabilities: ["Canlı ekipman konumu", "Zimmet geçmişi", "Alan dışı alarmı"], icon: PackageSearch, tone: "amber", badge: "Popüler", serviceId: "tool-tracking", publisher: "Navbea Assets", installs: 248, version: "2.8", preview: ["296 ekipman", "%87 aktif", "5 gecikme"] },
  { id: "visitor-contractor-flow", title: "Ziyaretçi ve Taşeron Akışı", category: "İnsan", description: "Davet, giriş, yetki ve saha çıkış süreçlerini ziyaretçi ve taşeronlar için birlikte yönetin.", capabilities: ["Ön kayıt ve davet", "Alan ve saat yetkisi", "İçerideki ziyaretçiler"], icon: UserRoundPlus, tone: "violet", badge: "Hazır", serviceId: "visitors", publisher: "Navbea People", installs: 193, version: "2.2", preview: ["11 içeride", "3 bekliyor", "6 alan"] },
  { id: "smart-hygiene", title: "Hijyen ve Sarf Takibi", category: "IoT", description: "Sabunluk, peçetelik ve sarf noktalarını doluluk seviyesine göre planlı biçimde yönetin.", capabilities: ["Anlık doluluk", "Kritik seviye iş emri", "Tüketim eğilimi"], icon: Activity, tone: "teal", badge: "Yeni", serviceId: "shell-dispenser", publisher: "Navbea IoT", installs: 84, version: "1.6", preview: ["296 sensör", "28 düşük", "%52 dolu"] },
  { id: "time-compliance", title: "Mesai ve Görev Süresi Uyumu", category: "Operasyon", description: "Çalışma süresini görev kodlarıyla eşleştirerek eksik ve onay bekleyen kayıtları yönetin.", capabilities: ["Eksik süre tespiti", "Toplu eşleştirme", "Yönetici onayı"], icon: TimerReset, tone: "blue", badge: "Yeni", serviceId: "time-matching", publisher: "Navbea Workforce", installs: 118, version: "1.9", preview: ["126 kayıt", "18 eksik", "9 onay"] },
  { id: "access-assurance", title: "Geçiş Güvenliği Paketi", category: "Güvenlik", description: "Kapı, turnike ve alan kurallarını tek kapsamda izleyerek yetkisiz geçişleri hızla inceleyin.", capabilities: ["Geçiş kuralı denetimi", "Kapı olay geçmişi", "Yetki sapması"], icon: DoorOpen, tone: "slate", badge: "Hazır", serviceId: "access-reader-groups", publisher: "Navbea Access", installs: 176, version: "2.5", preview: ["18 kapı", "24 kural", "3 sapma"] },
  { id: "sensor-watch", title: "Sensör Sağlığı ve Eşik İzleme", category: "IoT", description: "Bağlantı, pil ve ölçüm eşiklerini birlikte izleyerek veri kaybını oluşmadan fark edin.", capabilities: ["Pil sağlık görünümü", "Eşik aşımı geçmişi", "Çevrimdışı sensörler"], icon: Radio, tone: "teal", badge: "Hazır", serviceId: "report-sensors", publisher: "Navbea IoT", installs: 229, version: "3.0", preview: ["1.840 canlı", "12 düşük pil", "4 çevrimdışı"] },
  { id: "contractor-safety", title: "Alt Yüklenici İş Güvenliği", category: "İnsan", description: "Taşeron iş planlarını, saha yetkilerini ve yaklaşan bitiş tarihlerini aynı akışta yönetin.", capabilities: ["İş planı takibi", "Yetki süresi kontrolü", "Saha sorumlusu"], icon: Wrench, tone: "amber", badge: "Yeni", serviceId: "contractor-works", publisher: "Navbea Workforce", installs: 62, version: "1.3", preview: ["14 iş", "6 ekip", "2 gecikme"] },
  { id: "alarm-orchestration", title: "Alarm Müdahale Merkezi", category: "Güvenlik", description: "Alarm kaynaklarını önem seviyesine göre birleştirin ve müdahale durumunu tek kuyrukta takip edin.", capabilities: ["Öncelikli olay kuyruğu", "Kaynak doğrulama", "Müdahale takibi"], icon: ShieldAlert, tone: "coral", badge: "Popüler", serviceId: "alarm-dashboard", publisher: "Navbea Safety", installs: 271, version: "3.4", preview: ["7 aktif", "2 kritik", "4 atandı"] },
  { id: "workflow-studio", title: "Saha İş Akışı Otomasyonu", category: "Operasyon", description: "Sensör, görev ve bildirim adımlarını kurallara bağlayarak tekrarlanan saha işlemlerini otomatikleştirin.", capabilities: ["Olay tetikleyicileri", "Çok adımlı akış", "İşlem günlüğü"], icon: Workflow, tone: "violet", badge: "Yeni", serviceId: "workflows", publisher: "Navbea Automate", installs: 97, version: "1.7", preview: ["23 akış", "18 etkin", "642 işlem"] },
  { id: "live-field", title: "Canlı Saha Görünümü", category: "Tesis", description: "Personel, ekipman ve misafir hareketlerini tesis bağlamını kaybetmeden tek haritada birleştirin.", capabilities: ["Canlı varlık haritası", "Alan bazlı filtre", "Bağlamsal detay"], icon: Store, tone: "blue", badge: "Hazır", serviceId: "live", publisher: "Navbea Spatial", installs: 304, version: "3.2", preview: ["2.391 varlık", "5 gecikmeli", "11 alan"] },
];

const CATEGORIES = ["Tümü", "Tesis", "Güvenlik", "Operasyon", "İnsan", "IoT"] as const;
const SORT_OPTIONS = ["Önerilen", "En çok kullanılan", "En yeni", "A–Z"] as const;
const PAGE_SIZE = 6;

export function MarketplaceView({ onOpenService, onNotice }: { onOpenService: (id: string) => void; onNotice: (message: string) => void }) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Tümü");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"Tümü" | "Etkin">("Tümü");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>("Önerilen");
  const [page, setPage] = useState(1);
  const [enabledIds, setEnabledIds] = useState<string[]>(["space-intelligence", "emergency-readiness"]);

  useEffect(() => {
    const saved = window.localStorage.getItem("navbea-marketplace-enabled");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const timer = window.setTimeout(() => setEnabledIds(parsed.filter((id: unknown): id is string => typeof id === "string")), 0);
        return () => window.clearTimeout(timer);
      }
    } catch {
      window.localStorage.removeItem("navbea-marketplace-enabled");
    }
  }, []);

  const filteredUseCases = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    const matches = USE_CASES.filter((useCase) => {
      const matchesCategory = category === "Tümü" || useCase.category === category;
      const matchesScope = scope === "Tümü" || enabledIds.includes(useCase.id);
      const searchable = `${useCase.title} ${useCase.category} ${useCase.description} ${useCase.capabilities.join(" ")} ${useCase.publisher}`.toLocaleLowerCase("tr-TR");
      return matchesCategory && matchesScope && searchable.includes(normalizedQuery);
    });

    return [...matches].sort((a, b) => {
      if (sort === "En çok kullanılan") return b.installs - a.installs;
      if (sort === "En yeni") return Number.parseFloat(b.version) - Number.parseFloat(a.version);
      if (sort === "A–Z") return a.title.localeCompare(b.title, "tr-TR");
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.installs - a.installs;
    });
  }, [category, enabledIds, query, scope, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredUseCases.length / PAGE_SIZE));
  const visibleUseCases = filteredUseCases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const featured = USE_CASES.find((useCase) => useCase.featured) ?? USE_CASES[0];

  const toggleUseCase = (useCase: MarketplaceUseCase) => {
    const enabled = enabledIds.includes(useCase.id);
    const nextIds = enabled ? enabledIds.filter((id) => id !== useCase.id) : [...enabledIds, useCase.id];
    setEnabledIds(nextIds);
    window.localStorage.setItem("navbea-marketplace-enabled", JSON.stringify(nextIds));
    onNotice(`${useCase.title} ${enabled ? "çalışma alanından kaldırıldı" : "etkinleştirildi"}.`);
  };

  const showFeatured = category === "Tümü" && scope === "Tümü" && query.trim() === "" && page === 1;

  return <main className="marketplace-page">
    <header className="marketplace-heading">
      <div>
        <span className="marketplace-kicker"><Store size={13} /> NAVBEA MARKETPLACE</span>
        <h1>Operasyon çözümleri</h1>
        <p>Saha ihtiyaçlarınıza göre hazırlanmış çözüm paketlerini keşfedin ve çalışma alanınıza ekleyin.</p>
      </div>
      <span className="marketplace-enabled-count"><Check size={15} /> <strong>{enabledIds.length}</strong> etkin çözüm</span>
    </header>

    <section className="marketplace-command" aria-label="Marketplace arama ve filtreleri">
      <div className="marketplace-search">
        <Search size={18} aria-hidden="true" />
        <input aria-label="Marketplace içinde ara" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Çözüm, özellik veya yayıncı ara…" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Aramayı temizle">Temizle</button>}
      </div>
      <div className="marketplace-filter-row">
        <nav className="marketplace-categories" aria-label="Çözüm kategorileri">
          {CATEGORIES.map((item) => <button key={item} type="button" aria-current={category === item ? "page" : undefined} onClick={() => { setCategory(item); setPage(1); }}>{item}<small>{item === "Tümü" ? USE_CASES.length : USE_CASES.filter((useCase) => useCase.category === item).length}</small></button>)}
        </nav>
        <div className="marketplace-selects">
          <select value={scope} onChange={(event) => { setScope(event.target.value as "Tümü" | "Etkin"); setPage(1); }} aria-label="Etkinlik durumu"><option>Tümü</option><option>Etkin</option></select>
          <select value={sort} onChange={(event) => { setSort(event.target.value as (typeof SORT_OPTIONS)[number]); setPage(1); }} aria-label="Sıralama">{SORT_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select>
        </div>
      </div>
    </section>

    {showFeatured && <section className="marketplace-featured" aria-labelledby="featured-title">
      <div className="marketplace-featured-copy">
        <span><Sparkles size={14} /> ÖNE ÇIKAN ÇÖZÜM</span>
        <h2 id="featured-title">{featured.title}</h2>
        <p>{featured.description}</p>
        <div className="marketplace-featured-actions">
          <button type="button" className="marketplace-primary" onClick={() => onOpenService(featured.serviceId)}>Çözümü incele <ArrowRight size={15} /></button>
          <button type="button" className="marketplace-ghost" aria-pressed={enabledIds.includes(featured.id)} onClick={() => toggleUseCase(featured)}>{enabledIds.includes(featured.id) ? "Çalışma alanından kaldır" : "Etkinleştir"}</button>
        </div>
      </div>
      <div className="marketplace-featured-instrument" aria-hidden="true">
        <div className="marketplace-featured-grid"><span /><span /><span /><span /><span /><span /></div>
        <div className="marketplace-featured-metrics">{featured.preview.map((metric, index) => <span key={metric}><i>{index + 1}</i><strong>{metric}</strong></span>)}</div>
        <Building2 className="marketplace-featured-icon" size={44} />
      </div>
    </section>}

    <section className="marketplace-catalog" aria-labelledby="catalog-title">
      <div className="marketplace-results-head">
        <div><h2 id="catalog-title">Çözüm kataloğu</h2><p><strong>{filteredUseCases.length}</strong> çözüm bulundu{category !== "Tümü" ? ` · ${category}` : ""}</p></div>
        <span>{Math.min((page - 1) * PAGE_SIZE + 1, filteredUseCases.length)}–{Math.min(page * PAGE_SIZE, filteredUseCases.length)} / {filteredUseCases.length}</span>
      </div>

      {visibleUseCases.length ? <div className="marketplace-grid">{visibleUseCases.map((useCase) => {
        const Icon = useCase.icon;
        const enabled = enabledIds.includes(useCase.id);
        return <article key={useCase.id} className={`marketplace-app-card tone-${useCase.tone}`}>
          <div className="marketplace-card-preview">
            <span className="marketplace-card-category">{useCase.category}</span>
            <span className="marketplace-card-icon"><Icon size={26} /></span>
            <div className="marketplace-card-data" aria-hidden="true">{useCase.preview.map((metric) => <i key={metric}>{metric}</i>)}</div>
          </div>
          <div className="marketplace-card-body">
            <div className="marketplace-card-title-row"><div><h3>{useCase.title}</h3><span><BadgeCheck size={12} /> {useCase.publisher}</span></div><mark data-badge={useCase.badge}>{useCase.badge}</mark></div>
            <p>{useCase.description}</p>
            <ul>{useCase.capabilities.map((capability) => <li key={capability}><Check size={12} /> {capability}</li>)}</ul>
          </div>
          <footer className="marketplace-card-footer">
            <span><strong>{useCase.installs}</strong> çalışma alanı <small>v{useCase.version}</small></span>
            <div><button type="button" className="marketplace-open-button" onClick={() => onOpenService(useCase.serviceId)}>İncele</button><button type="button" className={`marketplace-install-button${enabled ? " is-enabled" : ""}`} aria-pressed={enabled} onClick={() => toggleUseCase(useCase)}>{enabled ? "Etkin" : "Ekle"}</button></div>
          </footer>
        </article>;
      })}</div> : <div className="marketplace-empty"><Search size={28} /><h3>Bu kapsamda çözüm bulunamadı</h3><p>Arama ifadenizi değiştirin veya kategori filtrelerini temizleyin.</p><button type="button" onClick={() => { setQuery(""); setCategory("Tümü"); setScope("Tümü"); }}>Filtreleri temizle</button></div>}

      {totalPages > 1 && <nav className="marketplace-pagination" aria-label="Marketplace sayfaları">
        <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Önceki sayfa"><ChevronLeft size={16} /></button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => <button key={item} type="button" aria-current={page === item ? "page" : undefined} onClick={() => setPage(item)}>{item}</button>)}
        <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} aria-label="Sonraki sayfa"><ChevronRight size={16} /></button>
      </nav>}
    </section>
  </main>;
}
