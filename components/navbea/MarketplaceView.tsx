"use client";

import { useMemo, useState } from "react";
import { Activity, Building2, Check, PackageSearch, Search, ShieldAlert, Store, TimerReset, UserRoundPlus, type LucideIcon } from "lucide-react";
import { SectionHeader } from "./Ui";

type MarketplaceUseCase = {
  id: string;
  title: string;
  category: "Tesis" | "Güvenlik" | "Operasyon" | "İnsan" | "IoT";
  description: string;
  capabilities: string[];
  icon: LucideIcon;
  tone: string;
  badge: "Hazır" | "Yeni";
  serviceId: string;
};

const USE_CASES: MarketplaceUseCase[] = [
  { id: "space-intelligence", title: "Akıllı Alan Kullanımı", category: "Tesis", description: "Kat ve bölgelerdeki anlık yoğunluğu, kullanım süresini ve kapasite aşımını tek görünümde izleyin.", capabilities: ["Canlı yoğunluk haritası", "Alan bazlı doluluk eğilimi", "Kapasite alarmı"], icon: Building2, tone: "bg-blue-500/10 text-blue-600 dark:text-blue-300", badge: "Hazır", serviceId: "summary" },
  { id: "emergency-readiness", title: "Acil Durum ve Toplanma", category: "Güvenlik", description: "Tahliye sırasında personel durumunu, toplanma bölgelerini ve eksik kişileri gerçek zamanlı takip edin.", capabilities: ["Toplanma bölgesi sayımı", "Eksik kişi listesi", "Kritik durum bildirimi"], icon: ShieldAlert, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-300", badge: "Hazır", serviceId: "emergency" },
  { id: "asset-tracking", title: "Ekipman ve El Aleti Takibi", category: "Operasyon", description: "Paylaşılan ekipmanların son konumunu, kullanım durumunu ve sorumlu personelini görün.", capabilities: ["Canlı ekipman konumu", "Kullanım ve zimmet geçmişi", "Bölge dışına çıkış alarmı"], icon: PackageSearch, tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300", badge: "Hazır", serviceId: "tool-tracking" },
  { id: "visitor-contractor-flow", title: "Ziyaretçi ve Taşeron Akışı", category: "İnsan", description: "Davet, giriş, yetki ve saha çıkış süreçlerini ziyaretçi ve taşeronlar için birlikte yönetin.", capabilities: ["Ön kayıt ve davet", "Alan ve saat yetkisi", "İçerideki ziyaretçi görünümü"], icon: UserRoundPlus, tone: "bg-violet-500/10 text-violet-600 dark:text-violet-300", badge: "Hazır", serviceId: "visitors" },
  { id: "smart-hygiene", title: "Hijyen ve Sarf Doluluk Takibi", category: "IoT", description: "Sabunluk, peçetelik ve sarf noktalarını doluluk seviyesine göre planlı biçimde yönetin.", capabilities: ["Anlık doluluk seviyesi", "Kritik seviye iş emri", "Tüketim eğilimi"], icon: Activity, tone: "bg-teal-500/10 text-teal-700 dark:text-teal-300", badge: "Yeni", serviceId: "shell-dispenser" },
  { id: "time-compliance", title: "Mesai ve Görev Süresi Uyumu", category: "Operasyon", description: "Personel çalışma süresini görev kodlarıyla eşleştirerek eksik ve onay bekleyen kayıtları yönetin.", capabilities: ["Eksik süre tespiti", "Toplu görev eşleştirme", "Yönetici onay akışı"], icon: TimerReset, tone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300", badge: "Yeni", serviceId: "time-matching" },
];

const CATEGORIES = ["Tümü", "Tesis", "Güvenlik", "Operasyon", "İnsan", "IoT"] as const;

export function MarketplaceView({ onOpenService, onNotice }: { onOpenService: (id: string) => void; onNotice: (message: string) => void }) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Tümü");
  const [query, setQuery] = useState("");
  const [enabledIds, setEnabledIds] = useState<string[]>(["space-intelligence", "emergency-readiness"]);
  const visibleUseCases = useMemo(() => USE_CASES.filter((useCase) => {
    const matchesCategory = category === "Tümü" || useCase.category === category;
    const normalizedQuery = query.toLocaleLowerCase("tr-TR");
    const matchesQuery = `${useCase.title} ${useCase.category} ${useCase.description} ${useCase.capabilities.join(" ")}`.toLocaleLowerCase("tr-TR").includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  }), [category, query]);

  const enableUseCase = (useCase: MarketplaceUseCase) => {
    setEnabledIds((current) => current.includes(useCase.id) ? current : [...current, useCase.id]);
    onNotice(`${useCase.title} kullanım senaryosu etkinleştirildi.`);
  };

  return <div className="view-stack">
    <SectionHeader eyebrow="NAVBEA MARKETPLACE" title="Marketplace" description="Hazır kullanım senaryolarını çalışma alanınıza ekleyin." actions={<span className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-[10px] font-semibold text-[var(--text-soft)]"><Check size={14} className="text-emerald-600" /> {enabledIds.length} etkin</span>} />
    <section className="rounded-xl border border-[var(--line)] bg-[var(--surface-raised)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3.5"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-lg bg-[var(--blue-soft)] text-[var(--blue)]"><Store size={18} /></span><div><h2 className="text-xs font-semibold text-[var(--text)]">Çözüm kitaplığı</h2><p className="mt-0.5 text-[9px] text-[var(--text-soft)]">{USE_CASES.length} kullanım senaryosu</p></div></div><label className="flex h-9 w-full max-w-[280px] items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 focus-within:border-[var(--blue)]"><Search size={14} className="text-[var(--text-soft)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kullanım senaryosu ara" className="min-w-0 flex-1 bg-transparent text-[11px] text-[var(--text)] outline-none placeholder:text-[var(--text-soft)]" /></label></div>
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--line)] px-4 py-2.5" role="tablist" aria-label="Marketplace kategorileri">{CATEGORIES.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} className={`h-8 whitespace-nowrap rounded-lg px-3 text-[10px] font-semibold transition ${category === item ? "bg-[var(--blue)] text-white" : "text-[var(--text-soft)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {visibleUseCases.length ? <div className="grid gap-3 p-4 md:grid-cols-2 2xl:grid-cols-3">{visibleUseCases.map((useCase) => {
        const Icon = useCase.icon;
        const enabled = enabledIds.includes(useCase.id);
        return <article key={useCase.id} className="flex min-h-[255px] flex-col rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--line-strong)]">
          <div className="flex items-start justify-between gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${useCase.tone}`}><Icon size={20} /></span><div className="flex items-center gap-2"><span className="rounded-md bg-[var(--surface-soft)] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-[var(--text-faint)]">{useCase.category}</span><span className={`rounded-md px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] ${useCase.badge === "Yeni" ? "bg-[var(--blue-soft)] text-[var(--blue)]" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>{useCase.badge}</span></div></div>
          <h3 className="mt-4 text-sm font-semibold tracking-[-0.02em] text-[var(--text)]">{useCase.title}</h3><p className="mt-1.5 text-[10px] leading-5 text-[var(--text-soft)]">{useCase.description}</p>
          <ul className="mt-3 space-y-1.5">{useCase.capabilities.map((capability) => <li key={capability} className="flex items-center gap-2 text-[9px] text-[var(--text-soft)]"><Check size={12} className="shrink-0 text-emerald-600" /> {capability}</li>)}</ul>
          <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[var(--line)] pt-4"><button type="button" className="h-9 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-[9px] font-semibold text-[var(--text)] hover:border-[var(--line-strong)]" onClick={() => onOpenService(useCase.serviceId)}>İlgili modülü aç</button><button type="button" disabled={enabled} className={`h-9 rounded-lg px-3 text-[9px] font-semibold ${enabled ? "cursor-default bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-[var(--blue)] text-white hover:brightness-95"}`} onClick={() => enableUseCase(useCase)}>{enabled ? "Etkin" : "Etkinleştir"}</button></div>
        </article>;
      })}</div> : <div className="grid min-h-64 place-items-center p-8 text-center"><div><Search size={24} className="mx-auto text-[var(--text-faint)]" /><h3 className="mt-3 text-xs font-semibold text-[var(--text)]">Sonuç bulunamadı</h3><p className="mt-1 text-[10px] text-[var(--text-soft)]">Farklı bir kategori veya arama ifadesi deneyin.</p></div></div>}
    </section>
  </div>;
}
