"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { MonitoringView } from "./MonitoringViews";
import { DataTable, type TableModel } from "../components/navbea/DataTable";
import { SidebarTreeItem, type SidebarNode } from "../components/navbea/SidebarTree";
import { IconButton, SectionHeader, StatusPill } from "../components/navbea/Ui";
import { MapManagementView } from "../components/navbea/MapManagementView";
import { DashboardManagementView } from "../components/navbea/DashboardManagementView";
import { TimeApprovalView, TimeMatchingView, TimeReportView } from "../components/navbea/TimeDistributionViews";
import { MarketplaceView } from "../components/navbea/MarketplaceView";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlarmClock,
  AlertTriangle,
  Archive,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarClock,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  DoorOpen,
  FileBarChart,
  FileText,
  Filter,
  Gauge,
  Grid2X2,
  HardHat,
  Home,
  KeyRound,
  Layers3,
  LayoutDashboard,
  Map,
  MapPin,
  Menu,
  MessageSquareText,
  MonitorDot,
  Moon,
  MoreHorizontal,
  Network,
  PackageSearch,
  Pin,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Sun,
  Tag,
  ThermometerSun,
  TimerReset,
  ToggleLeft,
  UserCheck,
  UserCog,
  Users,
  UsersRound,
  UserRoundPlus,
  Workflow,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

type ServiceType = "table" | "dashboard" | "report" | "map" | "builder";

type Service = {
  id: string;
  title: string;
  group: string;
  description: string;
  icon: LucideIcon;
  type: ServiceType;
  status?: string;
};

const WORKSPACE_NAME = "Merkez Kampüs";

const GROUPS = [
  { id: "İzleme", label: "İzleme", icon: MonitorDot, color: "blue" },
  { id: "Panolar", label: "Panolar", icon: LayoutDashboard, color: "violet" },
  { id: "İnsan", label: "Personel ve misafir", icon: UsersRound, color: "teal" },
  { id: "Varlık", label: "Ekipman ve IoT", icon: Boxes, color: "amber" },
  { id: "Güvenlik", label: "Güvenlik", icon: ShieldCheck, color: "coral" },
  { id: "Yönetim", label: "Sistem yönetimi", icon: UserCog, color: "slate" },
  { id: "Raporlar", label: "Raporlar", icon: FileBarChart, color: "indigo" },
  { id: "Modüller", label: "İş süreçleri", icon: Grid2X2, color: "mint" },
] as const;

const SERVICES: Service[] = [
  { id: "live", title: "Canlı İzleme", group: "İzleme", description: "Personel, ekipman ve misafirleri harita üzerinde izleyin.", icon: Radio, type: "map", status: "Canlı" },
  { id: "emergency", title: "Acil Durum", group: "İzleme", description: "Toplanma bölgelerini ve kişi durumlarını yönetin.", icon: ShieldAlert, type: "dashboard" },
  { id: "summary", title: "Konum Özeti", group: "İzleme", description: "Konumlar, katlar ve anlık saha değerleri.", icon: Gauge, type: "dashboard" },
  { id: "alarm-dashboard", title: "Alarm Özeti", group: "İzleme", description: "Alarm dağılımları, kaynakları ve son olaylar.", icon: Bell, type: "dashboard" },
  { id: "active-tasks", title: "Aktif Görevler", group: "İzleme", description: "Sahadaki açık görevleri ve sorumluları takip edin.", icon: ClipboardCheck, type: "table" },
  { id: "maps", title: "Haritalar", group: "İzleme", description: "2D/3D haritaları, katları ve nesneleri yönetin.", icon: Map, type: "map" },

  { id: "dashboard", title: "Operasyon Panosu", group: "Panolar", description: "Operasyon göstergelerinin genel görünümü.", icon: Gauge, type: "dashboard" },
  { id: "tool-tracking", title: "Araç ve Ekipman Takibi", group: "Panolar", description: "Araç ve ekipmanların canlı kullanım görünümü.", icon: PackageSearch, type: "dashboard" },
  { id: "shell-dispenser", title: "Shell Dispenser Doluluk Takibi", group: "Panolar", description: "Sarf sensörleri, doluluk ve kritik seviyeler.", icon: Activity, type: "dashboard" },
  { id: "shell-dashboard", title: "Shell Operasyon Panosu", group: "Panolar", description: "Shell operasyon göstergeleri ve filtreleri.", icon: LayoutDashboard, type: "dashboard" },
  { id: "dashboard-management", title: "Pano Yönetimi", group: "Panolar", description: "Pano, bileşen ve veri kaynağı yapılandırması.", icon: Grid2X2, type: "builder" },

  { id: "personnels", title: "Personeller", group: "İnsan", description: "Personel kartları, çalışma bilgileri ve durumları.", icon: Users, type: "table" },
  { id: "personnel-groups", title: "Personel Grupları", group: "İnsan", description: "Ekip, taşeron ve görev gruplarını yönetin.", icon: UsersRound, type: "table" },
  { id: "personnel-devices", title: "Personel Cihazları", group: "İnsan", description: "Personel kartı ve cihaz eşleştirmeleri.", icon: Smartphone, type: "table" },
  { id: "mobile-personnels", title: "Mobil Personeller", group: "İnsan", description: "Mobil çalışan hesapları ve kimlik bilgileri.", icon: UserCheck, type: "table" },
  { id: "visitors", title: "Misafirler", group: "İnsan", description: "Misafir kayıtları, ziyaret tarihleri ve erişimler.", icon: UserRoundPlus, type: "table" },
  { id: "visitor-groups", title: "Misafir Grupları", group: "İnsan", description: "Misafir grupları ve toplu işlemler.", icon: UsersRound, type: "table" },
  { id: "visitor-devices", title: "Misafir Cihazları", group: "İnsan", description: "Misafir kartı ve cihaz atamaları.", icon: Smartphone, type: "table" },
  { id: "attendance", title: "Mesai ve Görev Yönetimi", group: "İnsan", description: "Mesai giriş–çıkış ve görev kayıtları.", icon: Clock3, type: "table" },
  { id: "attendance-daily", title: "Günlük Giriş Raporu", group: "İnsan", description: "Gün bazında personel giriş ve çıkışları.", icon: CalendarClock, type: "report" },
  { id: "attendance-monthly", title: "Aylık Giriş Raporu", group: "İnsan", description: "Aylık puantaj ve devam özeti.", icon: CalendarClock, type: "report" },
  { id: "access-reader-groups", title: "Geçiş Kuralları", group: "İnsan", description: "Geçiş kuralları, günler ve saat planları.", icon: KeyRound, type: "table" },

  { id: "equipments", title: "Ekipmanlar", group: "Varlık", description: "Ekipman envanteri ve son konumları.", icon: Archive, type: "table" },
  { id: "equipment-groups", title: "Ekipman Grupları", group: "Varlık", description: "Ekipman sınıfları ve grup üyelikleri.", icon: Boxes, type: "table" },
  { id: "equipment-devices", title: "Ekipman Cihazları", group: "Varlık", description: "Ekipman–cihaz atamaları ve pil durumları.", icon: Smartphone, type: "table" },
  { id: "beacon-devices", title: "Beacon Cihazları", group: "Varlık", description: "Beacon kimlikleri, konum ve sinyal bilgileri.", icon: Radio, type: "table" },
  { id: "wifi-devices", title: "Wifi Cihazları", group: "Varlık", description: "Gateway ve Wifi cihaz sağlık durumları.", icon: Network, type: "table" },
  { id: "access-control-devices", title: "Geçiş Kontrol Cihazları", group: "Varlık", description: "Webhook, turnike ve geçiş cihazları.", icon: DoorOpen, type: "table" },
  { id: "sensors", title: "Sensörler", group: "Varlık", description: "Sensör tipi, konumu, pil ve bağlantı durumu.", icon: Activity, type: "table" },
  { id: "pir-sensors", title: "PIR Sensörleri", group: "Varlık", description: "Hareket sensörleri ve son algılama bilgileri.", icon: Zap, type: "table" },
  { id: "areas", title: "Alan ve Bölge Yönetimi", group: "Varlık", description: "Kat, bölge ve alt alan hiyerarşisi.", icon: Layers3, type: "table" },
  { id: "tags", title: "Etiketler", group: "Varlık", description: "Görev, alarm ve personel etiketleri.", icon: Tag, type: "table" },
  { id: "risk-factors", title: "Risk Faktörleri", group: "Varlık", description: "Saha riskleri ve değerlendirme kayıtları.", icon: AlertTriangle, type: "table" },

  { id: "alarms-management", title: "Alarm Yönetimi", group: "Güvenlik", description: "Alarm tipi, kuralı, gecikmesi ve bağlı varlıkları.", icon: ShieldAlert, type: "table" },
  { id: "alarm-notifiers", title: "Alarm Bildiricileri", group: "Güvenlik", description: "Bildirim kanalları ve alıcı kuralları.", icon: Bell, type: "table" },

  { id: "users", title: "Kullanıcılar", group: "Yönetim", description: "Platform kullanıcıları ve hesap durumları.", icon: UserCog, type: "table" },
  { id: "roles", title: "Roller", group: "Yönetim", description: "Rol bazlı yetkiler ve erişim kapsamları.", icon: ShieldCheck, type: "table" },
  { id: "mobile-users", title: "Mobil Kullanıcılar", group: "Yönetim", description: "Mobil uygulama kullanıcı hesapları.", icon: Smartphone, type: "table" },
  { id: "wizard", title: "Kurulum Sihirbazı", group: "Yönetim", description: "Konum, cihaz ve temel yapılandırma adımlarını yönetin.", icon: Sparkles, type: "builder" },

  { id: "report-alarms", title: "Alarm Raporları", group: "Raporlar", description: "Alarm türü, durum ve zaman analizleri.", icon: Bell, type: "report" },
  { id: "report-personnels", title: "Personel Raporları", group: "Raporlar", description: "Personel süre, bölge ve hareket raporları.", icon: Users, type: "report" },
  { id: "report-visitors", title: "Misafir Raporları", group: "Raporlar", description: "Ziyaret ve erişim geçmişi.", icon: UserRoundPlus, type: "report" },
  { id: "report-equipment", title: "Ekipman Raporları", group: "Raporlar", description: "Ekipman konum ve durum raporları.", icon: Archive, type: "report" },
  { id: "report-equipment-usage", title: "Ekipman Kullanım Raporları", group: "Raporlar", description: "Kullanım süresi ve kişi bazlı hareketler.", icon: TimerReset, type: "report" },
  { id: "report-area", title: "Bölge Raporları", group: "Raporlar", description: "Bölge bazlı yoğunluk ve süreler.", icon: MapPin, type: "report" },
  { id: "report-floor", title: "Kat Raporları", group: "Raporlar", description: "Kat hareketleri ve varlık dağılımı.", icon: Building2, type: "report" },
  { id: "report-tags", title: "Etiket Raporları", group: "Raporlar", description: "Etiket bazlı giriş–çıkış ve süre analizi.", icon: Tag, type: "report" },
  { id: "report-gps", title: "GPS Raporları", group: "Raporlar", description: "GPS hareket rotaları ve ham konum kayıtları.", icon: MapPin, type: "report" },
  { id: "report-pir", title: "PIR Sensör Raporları", group: "Raporlar", description: "Hareket algılama zaman serileri.", icon: Activity, type: "report" },
  { id: "report-sensors", title: "Sıcaklık ve Nem Raporları", group: "Raporlar", description: "Sensör ölçümleri ve eşik aşımları.", icon: ThermometerSun, type: "report" },
  { id: "report-heatmap", title: "Yoğunluk Haritası", group: "Raporlar", description: "Personel ve ekipman yoğunluk analizi.", icon: Map, type: "map" },
  { id: "report-dynamic", title: "Dinamik Raporlar", group: "Raporlar", description: "Alan seçerek özel rapor oluşturun.", icon: FileBarChart, type: "builder" },
  { id: "report-entrances", title: "Giriş–Çıkış Raporları", group: "Raporlar", description: "Kapı, kullanıcı ve tarih bazlı geçişler.", icon: DoorOpen, type: "report" },

  { id: "invitations", title: "Davetler", group: "Modüller", description: "Davet kodları ve misafir ön kayıtları.", icon: UserRoundPlus, type: "table" },
  { id: "turnstiles", title: "Turnikeler", group: "Modüller", description: "Turnike durumları ve geçiş yetkileri.", icon: DoorOpen, type: "table" },
  { id: "campaigns", title: "Kampanyalar", group: "Modüller", description: "Saha kampanyaları ve katılım bilgileri.", icon: Sparkles, type: "table" },
  { id: "cameras", title: "Kameralar", group: "Modüller", description: "Kamera kaynakları ve canlı yayın bağlantıları.", icon: Camera, type: "table" },
  { id: "switches", title: "Akıllı Anahtarlar", group: "Modüller", description: "IoT anahtarları ve aç/kapat durumları.", icon: ToggleLeft, type: "table" },
  { id: "workflows", title: "İş Akışları", group: "Modüller", description: "Otomasyon adımları ve tetikleyiciler.", icon: Workflow, type: "table" },
  { id: "polls", title: "Anketler", group: "Modüller", description: "Anketler, yanıtlar ve yayın durumu.", icon: MessageSquareText, type: "table" },
  { id: "forms", title: "Formlar", group: "Modüller", description: "Form şablonları ve yanıt kayıtları.", icon: FileText, type: "table" },
  { id: "tof-series", title: "ToF Serileri", group: "Modüller", description: "ToF sensör serileri ve alarm eşikleri.", icon: Activity, type: "table" },
  { id: "checklists", title: "Görev ve Kontrol Listeleri", group: "Modüller", description: "Kontrol listeleri ve saha görevleri.", icon: ClipboardList, type: "table" },
  { id: "contractor-works", title: "Alt Yüklenici İşleri", group: "Modüller", description: "Taşeron iş planları ve bitiş tarihleri.", icon: HardHat, type: "table" },
  { id: "time-matching", title: "Süre Eşleştirme", group: "Modüller", description: "Görev kodu ile personel süresi eşleştirme.", icon: TimerReset, type: "builder" },
  { id: "time-approval", title: "Süre Onayları", group: "Modüller", description: "Eşleştirilen süreleri inceleyin ve onaylayın.", icon: CheckCircle2, type: "table" },
  { id: "time-report", title: "Süre Dağılım Raporu", group: "Modüller", description: "İş, bölge ve personel bazlı süre analizi.", icon: BarChart3, type: "report" },
  { id: "system-logs", title: "Sistem Günlükleri", group: "Modüller", description: "Sistem olayları, kullanıcı işlemleri ve hata kayıtları.", icon: ScrollText, type: "table" },
];

const SIDEBAR_TREE: SidebarNode[] = [
  {
    id: "dashboards",
    label: "Panolar",
    icon: LayoutDashboard,
    children: [
      { id: "dashboard", label: "Operasyon Panosu", icon: Gauge, serviceId: "dashboard" },
      { id: "tool-tracking", label: "Araç ve Ekipman Takibi", icon: PackageSearch, serviceId: "tool-tracking" },
      { id: "shell-dispenser", label: "Shell Dispenser Doluluk Takibi", icon: Activity, serviceId: "shell-dispenser" },
      { id: "shell-dashboard", label: "Shell Operasyon Panosu", icon: LayoutDashboard, serviceId: "shell-dashboard" },
    ],
  },
  {
    id: "monitoring",
    label: "İzleme",
    icon: MonitorDot,
    children: [
      { id: "live", label: "Canlı İzle", icon: Radio, serviceId: "live" },
      { id: "emergency", label: "Acil Durum", icon: ShieldAlert, serviceId: "emergency" },
      { id: "summary", label: "Konum Özeti", icon: Gauge, serviceId: "summary" },
      { id: "alarm-dashboard", label: "Alarm Özeti", icon: Bell, serviceId: "alarm-dashboard" },
      { id: "active-tasks", label: "Aktif Görevler", icon: ClipboardCheck, serviceId: "active-tasks" },
    ],
  },
  {
    id: "management",
    label: "Yönetim",
    icon: Building2,
    children: [
      {
        id: "personnel-management",
        label: "Personel Yönetimi",
        icon: Users,
        children: [
          { id: "personnels", label: "Personeller", icon: Users, serviceId: "personnels" },
          { id: "personnel-groups", label: "Gruplar", icon: UsersRound, serviceId: "personnel-groups" },
          { id: "personnel-devices", label: "Cihazlar", icon: Smartphone, serviceId: "personnel-devices" },
          { id: "mobile-personnels", label: "Mobil Personeller", icon: UserCheck, serviceId: "mobile-personnels" },
        ],
      },
      {
        id: "visitor-management",
        label: "Misafir Yönetimi",
        icon: UserRoundPlus,
        children: [
          { id: "visitors", label: "Misafirler", icon: UserRoundPlus, serviceId: "visitors" },
          { id: "visitor-groups", label: "Gruplar", icon: UsersRound, serviceId: "visitor-groups" },
          { id: "visitor-devices", label: "Cihazlar", icon: Smartphone, serviceId: "visitor-devices" },
        ],
      },
      {
        id: "equipment-management",
        label: "Ekipman Yönetimi",
        icon: Boxes,
        children: [
          { id: "equipments", label: "Ekipmanlar", icon: Archive, serviceId: "equipments" },
          { id: "equipment-groups", label: "Gruplar", icon: Boxes, serviceId: "equipment-groups" },
          { id: "equipment-devices", label: "Cihazlar", icon: Smartphone, serviceId: "equipment-devices" },
        ],
      },
      {
        id: "users-management",
        label: "Kullanıcı Yönetimi",
        icon: UserCog,
        children: [
          { id: "users", label: "Kullanıcılar", icon: UserCog, serviceId: "users" },
          { id: "roles", label: "Roller", icon: ShieldCheck, serviceId: "roles" },
          { id: "mobile-users", label: "Mobil Kullanıcılar", icon: Smartphone, serviceId: "mobile-users" },
        ],
      },
      {
        id: "device-management",
        label: "Cihaz Yönetimi",
        icon: Network,
        children: [
          { id: "beacon-devices", label: "Beacon Cihazları", icon: Radio, serviceId: "beacon-devices" },
          { id: "wifi-devices", label: "Wifi Cihazları", icon: Network, serviceId: "wifi-devices" },
          { id: "access-control-devices", label: "Geçiş Kontrol Cihazları", icon: DoorOpen, serviceId: "access-control-devices" },
        ],
      },
      {
        id: "sensor-management",
        label: "Sensör Yönetimi",
        icon: Activity,
        children: [
          { id: "sensors", label: "Sensörler", icon: Activity, serviceId: "sensors" },
          { id: "pir-sensors", label: "PIR Sensörleri", icon: Zap, serviceId: "pir-sensors" },
        ],
      },
      { id: "access-reader-groups", label: "Geçiş Kontrol Kural Yönetimi", icon: KeyRound, serviceId: "access-reader-groups" },
      { id: "maps", label: "Harita Yönetimi", icon: Map, serviceId: "maps" },
      { id: "areas", label: "Bölge Yönetimi", icon: Layers3, serviceId: "areas" },
      { id: "dashboard-management", label: "Pano Yönetimi", icon: Grid2X2, serviceId: "dashboard-management" },
      {
        id: "alarm-management",
        label: "Alarm Yönetimi",
        icon: Bell,
        children: [
          { id: "alarms-management", label: "Alarm Yönetimi", icon: ShieldAlert, serviceId: "alarms-management" },
          { id: "alarm-notifiers", label: "Alarm Bildiricileri", icon: Bell, serviceId: "alarm-notifiers" },
        ],
      },
      { id: "tags", label: "Etiketler", icon: Tag, serviceId: "tags" },
      { id: "risk-factors", label: "Risk Faktörleri", icon: AlertTriangle, serviceId: "risk-factors" },
      { id: "attendance", label: "Mesai & Görev Yönetimi", icon: CalendarClock, serviceId: "attendance" },
      { id: "checklists", label: "Görev Yönetimi", icon: ClipboardList, serviceId: "checklists" },
      {
        id: "time-distribution",
        label: "Süre Dağıtımı & Onay Akışı",
        icon: Clock3,
        children: [
          { id: "time-matching", label: "Süre Eşleştirme", icon: TimerReset, serviceId: "time-matching" },
          { id: "time-approval", label: "Onay Ekranı", icon: CheckCircle2, serviceId: "time-approval" },
          { id: "time-report", label: "Dağılım Raporu", icon: BarChart3, serviceId: "time-report" },
        ],
      },
      { id: "contractor-works", label: "Alt Yüklenici İşleri", icon: HardHat, serviceId: "contractor-works" },
    ],
  },
  {
    id: "reports",
    label: "Raporlar",
    icon: FileBarChart,
    children: [
      { id: "report-alarms", label: "Alarm Raporları", icon: Bell, serviceId: "report-alarms" },
      { id: "report-personnels", label: "Personel Raporları", icon: Users, serviceId: "report-personnels" },
      { id: "report-visitors", label: "Misafir Raporları", icon: UserRoundPlus, serviceId: "report-visitors" },
      { id: "report-equipment", label: "Ekipman Raporları", icon: Archive, serviceId: "report-equipment" },
      { id: "report-equipment-usage", label: "Ekipman Kullanım Raporları", icon: TimerReset, serviceId: "report-equipment-usage" },
      { id: "report-area", label: "Bölge Raporları", icon: MapPin, serviceId: "report-area" },
      { id: "report-floor", label: "Kat Raporları", icon: Building2, serviceId: "report-floor" },
      { id: "report-tags", label: "Etiket Raporları", icon: Tag, serviceId: "report-tags" },
      { id: "report-gps", label: "GPS Raporları", icon: MapPin, serviceId: "report-gps" },
      { id: "report-pir", label: "PIR Sensör Raporları", icon: Activity, serviceId: "report-pir" },
      { id: "report-sensors", label: "Sıcaklık & Nem Raporları", icon: ThermometerSun, serviceId: "report-sensors" },
      { id: "report-heatmap", label: "Yoğunluk Haritası", icon: Map, serviceId: "report-heatmap" },
      { id: "report-dynamic", label: "Dinamik Raporlar", icon: FileBarChart, serviceId: "report-dynamic" },
      {
        id: "attendance-reports",
        label: "Personel Devam Raporları",
        icon: CalendarClock,
        children: [
          { id: "attendance-daily", label: "Günlük Giriş Raporları", icon: CalendarClock, serviceId: "attendance-daily" },
          { id: "attendance-monthly", label: "Aylık Giriş Raporları", icon: CalendarClock, serviceId: "attendance-monthly" },
          { id: "report-entrances", label: "Geçiş Kontrol Raporları", icon: DoorOpen, serviceId: "report-entrances" },
        ],
      },
    ],
  },
  {
    id: "modules",
    label: "Modüller",
    icon: Grid2X2,
    children: [
      { id: "invitations", label: "Davetli Yönetimi", icon: UserRoundPlus, serviceId: "invitations" },
      { id: "turnstiles", label: "Turnike Yönetimi", icon: DoorOpen, serviceId: "turnstiles" },
      { id: "campaigns", label: "Kampanya Yönetimi", icon: Sparkles, serviceId: "campaigns" },
      { id: "cameras", label: "Kamera Yönetimi", icon: Camera, serviceId: "cameras" },
      { id: "switches", label: "Anahtar Yönetimi", icon: ToggleLeft, serviceId: "switches" },
      { id: "workflows", label: "İş Akışı Yönetimi", icon: Workflow, serviceId: "workflows" },
      { id: "polls", label: "Anket Yönetimi", icon: MessageSquareText, serviceId: "polls" },
      { id: "forms", label: "Form Yönetimi", icon: FileText, serviceId: "forms" },
      { id: "tof-series", label: "ToF Serileri", icon: Activity, serviceId: "tof-series" },
      { id: "system-logs", label: "Sistem Günlükleri", icon: ScrollText, serviceId: "system-logs" },
    ],
  },
];

function nodeContainsService(node: SidebarNode, serviceId: string): boolean {
  return node.serviceId === serviceId || Boolean(node.children?.some((child) => nodeContainsService(child, serviceId)));
}

function findSidebarPath(nodes: SidebarNode[], serviceId: string, path: string[] = []): string[] {
  for (const node of nodes) {
    if (node.serviceId === serviceId) return path;
    if (node.children) {
      const childPath = findSidebarPath(node.children, serviceId, [...path, node.id]);
      if (childPath.length) return childPath;
    }
  }
  return [];
}

function findNodePath(nodes: SidebarNode[], nodeId: string, path: string[] = []): string[] {
  for (const node of nodes) {
    const nextPath = [...path, node.id];
    if (node.id === nodeId) return nextPath;
    if (node.children) {
      const childPath = findNodePath(node.children, nodeId, nextPath);
      if (childPath.length) return childPath;
    }
  }
  return [];
}

const INITIAL_RECENT_IDS = ["live", "personnels", "shell-dispenser", "alarms-management", "time-matching", "report-heatmap"];
const FREQUENT_IDS = ["live", "active-tasks", "personnels", "shell-dispenser", "alarm-dashboard", "report-personnels"];
const MAX_WORKSPACE_TABS = 7;

const WORK_ITEMS = [
  { level: "critical", title: "C Blok sıcaklık eşiği aşıldı", meta: "HVAC-3 • 2. Kat • 2 dk önce", tag: "Kritik", icon: ThermometerSun },
  { level: "warning", title: "Jeneratör periyodik bakımı yaklaşıyor", meta: "B Blok • 10 dk önce", tag: "Bakım", icon: AlarmClock },
  { level: "info", title: "12 personelin süre eşleştirmesi eksik", meta: "Vardiya A • Bugün", tag: "İşlem", icon: TimerReset },
  { level: "success", title: "Misafir grubu sahadan ayrıldı", meta: "Ana giriş • 14:42", tag: "Tamamlandı", icon: UserCheck },
];

const TABLE_ROWS = [
  ["NV-2048", "Ana Bina / 2. Kat", "Operasyon", "Aktif", "2 dk önce"],
  ["NV-2047", "B Blok / Zemin", "Teknik", "Aktif", "5 dk önce"],
  ["NV-2046", "C Blok / 1. Kat", "Güvenlik", "Dikkat", "12 dk önce"],
  ["NV-2045", "Depo / Giriş", "Lojistik", "Aktif", "18 dk önce"],
  ["NV-2044", "Şantiye / D Blok", "Taşeron", "Çevrimdışı", "1 sa önce"],
  ["NV-2043", "Ana Bina / Giriş", "Misafir", "Aktif", "2 sa önce"],
];

type MetricTone = "blue" | "teal" | "amber" | "coral" | "slate" | "indigo";
type SummaryMetric = { label: string; value: string; detail: string; tone: MetricTone; icon: LucideIcon };
const PEOPLE_SERVICES = ["personnels", "mobile-personnels", "personnel-groups", "attendance"];
const VISITOR_SERVICES = ["visitors", "visitor-groups", "invitations"];
const DEVICE_SERVICES = ["personnel-devices", "visitor-devices", "equipment-devices", "beacon-devices", "wifi-devices", "access-control-devices", "sensors", "pir-sensors", "tof-series", "switches", "turnstiles", "cameras"];
const TASK_SERVICES = ["active-tasks", "checklists", "contractor-works", "workflows", "time-approval"];

const CORE_MANAGEMENT_SERVICES = [
  "personnels", "personnel-groups", "personnel-devices", "mobile-personnels",
  "visitors", "visitor-groups", "visitor-devices",
  "equipments", "equipment-groups", "equipment-devices",
  "users", "roles", "mobile-users",
  "beacon-devices", "wifi-devices", "access-control-devices",
  "sensors", "pir-sensors",
] as const;

const CONFIGURATION_MANAGEMENT_SERVICES = [
  "access-reader-groups", "areas", "alarms-management", "alarm-notifiers", "tags",
] as const;

const CONFIGURATION_MANAGEMENT_TITLES: Record<string, string> = {
  "access-reader-groups": "Geçiş Kontrol Kuralları",
  areas: "Bölge Yönetimi",
  "alarms-management": "Alarm Yönetimi",
  "alarm-notifiers": "Alarm Bildiricileri",
  tags: "Etiketler",
};

const OPERATION_MANAGEMENT_SERVICES = [
  "risk-factors", "attendance", "checklists", "contractor-works",
] as const;

const OPERATION_MANAGEMENT_TITLES: Record<string, string> = {
  "risk-factors": "Risk Faktörleri",
  attendance: "Mesai & Görev Yönetimi",
  checklists: "Görev Yönetimi",
  "contractor-works": "Alt Yüklenici İşleri",
};

const CORE_MANAGEMENT_SECTIONS: Record<string, string> = {
  personnels: "Personel Yönetimi",
  "personnel-groups": "Personel Yönetimi",
  "personnel-devices": "Personel Yönetimi",
  "mobile-personnels": "Personel Yönetimi",
  visitors: "Misafir Yönetimi",
  "visitor-groups": "Misafir Yönetimi",
  "visitor-devices": "Misafir Yönetimi",
  equipments: "Ekipman Yönetimi",
  "equipment-groups": "Ekipman Yönetimi",
  "equipment-devices": "Ekipman Yönetimi",
  users: "Kullanıcı Yönetimi",
  roles: "Kullanıcı Yönetimi",
  "mobile-users": "Kullanıcı Yönetimi",
  "beacon-devices": "Cihaz Yönetimi",
  "wifi-devices": "Cihaz Yönetimi",
  "access-control-devices": "Cihaz Yönetimi",
  sensors: "Sensör Yönetimi",
  "pir-sensors": "Sensör Yönetimi",
};

const CORE_MANAGEMENT_TABLES: Record<string, TableModel> = {
  personnels: {
    title: "Personel Listesi", searchLabel: "Personel ara", total: 296,
    columns: ["ID", "Ad", "Soyad", "Vatandaşlık Numarası", "Sicil No", "Konum", "Grup", "İş Bitiş Tarihi", "Eylemler"],
    rows: [
      ["2048", "Mustafa", "Aydın", "10000000432", "NV-2048", "A Blok", "Operasyon", "—"],
      ["2047", "Ahmet", "Demir", "10000000718", "NV-2047", "B Blok", "Teknik", "—"],
      ["2046", "Merve", "Kaya", "10000000964", "NV-2046", "C Blok", "Güvenlik", "31.12.2026"],
      ["2045", "Selin", "Yılmaz", "10000000185", "NV-2045", "Depo", "Lojistik", "—"],
    ],
  },
  "personnel-groups": {
    title: "Personel Grup Listesi", searchLabel: "Grup ara", total: 15,
    columns: ["#", "Grup Adı", "Konum", "Üst Grup", "Çıkış Oluştur", "Personel Sayısı", "Eylemler"],
    rows: [
      ["1", "Operasyon", "Merkez Kampüs", "—", "Evet", "84"],
      ["2", "Teknik", "Merkez Kampüs", "Operasyon", "Evet", "62"],
      ["3", "Güvenlik", "Merkez Kampüs", "—", "Hayır", "41"],
      ["4", "Taşeron", "Şantiye", "—", "Evet", "109"],
    ],
  },
  "personnel-devices": {
    title: "Personel Cihaz Listesi", searchLabel: "Cihaz veya personel ara", total: 296,
    columns: ["ID", "Cihaz ID", "RF ID", "Personel", "Konum", "Batarya Durumu", "Cihaz Tipi", "Eylemler"],
    rows: [
      ["1", "DD9F-038C28EB", "RF-84120", "Mustafa Aydın", "A Blok", "%92", "Beacon"],
      ["2", "DD9F-039C18AA", "RF-84121", "Ahmet Demir", "B Blok", "%76", "Beacon"],
      ["3", "DD9F-041A92BC", "RF-84122", "Atanmamış", "C Blok", "%48", "Kart"],
      ["4", "DD9F-047B36DE", "RF-84123", "Merve Kaya", "C Blok", "%18", "Beacon"],
    ],
  },
  "mobile-personnels": {
    title: "Mobil Personel Listesi", searchLabel: "Mobil personel ara", total: 24,
    columns: ["ID", "Ad", "Soyad", "Vatandaşlık Numarası", "Sicil No", "Konum", "Grup", "İş Bitiş Tarihi", "Eylemler"],
    rows: [
      ["401", "Ece", "Arslan", "10000000241", "MP-0401", "A Blok", "Operasyon", "—"],
      ["402", "Mehmet", "Karaca", "10000000389", "MP-0402", "B Blok", "Teknik", "—"],
      ["403", "Seda", "Acar", "10000000512", "MP-0403", "C Blok", "Güvenlik", "30.09.2026"],
    ],
  },
  visitors: {
    title: "Misafir Listesi", searchLabel: "Misafir ara", total: 38,
    columns: ["ID", "Ad", "Soyad", "Grup", "Konum", "Vatandaşlık Numarası", "Plaka", "Ziyaret Sebebi", "Giriş Tarihi", "Çıkış Tarihi", "Eylemler"],
    rows: [
      ["501", "Deniz", "Akın", "Tedarikçi", "A Blok", "10000000103", "34 ABC 123", "Teknik görüşme", "10.08.2026 09:12", "—"],
      ["502", "Zeynep", "Erol", "Ziyaretçi", "B Blok", "10000000284", "06 DE 284", "Toplantı", "10.08.2026 10:05", "10.08.2026 12:40"],
      ["503", "Can", "Öz", "Taşeron", "C Blok", "10000000719", "—", "Bakım", "10.08.2026 11:18", "—"],
    ],
  },
  "visitor-groups": {
    title: "Misafir Grup Listesi", searchLabel: "Misafir grubu ara", total: 6,
    columns: ["ID", "Ad", "Konum", "Toplam", "Eylemler"],
    rows: [
      ["1", "Tedarikçiler", "Merkez Kampüs", "12"],
      ["2", "Günlük Ziyaretçiler", "Ana Bina", "18"],
      ["3", "Bakım Ekibi", "C Blok", "8"],
    ],
  },
  "visitor-devices": {
    title: "Misafir Cihaz Listesi", searchLabel: "Cihaz veya misafir ara", total: 42,
    columns: ["#", "Cihaz ID", "RF ID", "Misafir", "Konum", "Batarya Durumu", "Eylemler"],
    rows: [
      ["1", "VD-1048", "RF-91048", "Deniz Akın", "A Blok", "%88"],
      ["2", "VD-1049", "RF-91049", "Zeynep Erol", "B Blok", "%72"],
      ["3", "VD-1050", "RF-91050", "Atanmamış", "Ana Giriş", "%64"],
    ],
  },
  equipments: {
    title: "Ekipman Listesi", searchLabel: "Ekipman ara", total: 296,
    columns: ["#", "Ekipman Adı", "Seri Numarası", "Grup", "Konum", "Eylemler"],
    rows: [
      ["1", "Forklift 07", "FL-2024-007", "İş Makineleri", "D Blok"],
      ["2", "Termal Kamera 03", "TK-2025-003", "Ölçüm Cihazları", "C Blok"],
      ["3", "Jeneratör 02", "JN-2023-002", "Enerji", "B Blok"],
    ],
  },
  "equipment-groups": {
    title: "Ekipman Grup Listesi", searchLabel: "Ekipman grubu ara", total: 12,
    columns: ["#", "Grup Adı", "Ekipman Sayısı", "Konum", "Eylemler"],
    rows: [
      ["1", "İş Makineleri", "48", "Şantiye"],
      ["2", "Ölçüm Cihazları", "36", "Merkez Kampüs"],
      ["3", "Enerji", "22", "B Blok"],
    ],
  },
  "equipment-devices": {
    title: "Ekipman Cihaz Listesi", searchLabel: "Cihaz veya ekipman ara", total: 296,
    columns: ["#", "Cihaz ID", "Ekipman Sayısı", "Konum", "Batarya Durumu", "Eylemler"],
    rows: [
      ["1", "EQ-0187", "Forklift 07", "D Blok", "%81"],
      ["2", "EQ-0296", "Termal Kamera 03", "C Blok", "%68"],
      ["3", "EQ-0314", "Atanmamış", "Depo", "%44"],
    ],
  },
  users: {
    title: "Kullanıcı Listesi", searchLabel: "Kullanıcı ara", total: 84,
    columns: ["ID", "Ad Soyad", "Kullanıcı Adı", "E-posta", "Rol", "Durum", "Eylemler"],
    rows: [
      ["1", "Ayşe Şahin", "ayse.sahin", "ayse.sahin@navbea.com", "Sistem Yöneticisi", "Aktif"],
      ["2", "Burak Kaya", "burak.kaya", "burak.kaya@navbea.com", "Operasyon", "Aktif"],
      ["3", "Cem Yıldız", "cem.yildiz", "cem.yildiz@navbea.com", "Güvenlik", "Pasif"],
    ],
  },
  roles: {
    title: "Rol Listesi", searchLabel: "Rol ara", total: 11,
    columns: ["#", "ID", "Rol Adı", "Eylemler"],
    rows: [
      ["1", "1", "Sistem Yöneticisi"],
      ["2", "2", "Operasyon"],
      ["3", "3", "Güvenlik"],
      ["4", "4", "Raporlama"],
    ],
  },
  "mobile-users": {
    title: "Mobil Kullanıcı Listesi", searchLabel: "Mobil kullanıcı ara", total: 18,
    columns: ["#", "ID", "Ad", "E-posta", "MAC", "Eylemler"],
    rows: [
      ["1", "MU-101", "Mehmet Karaca", "mehmet.karaca@navbea.com", "A4:C3:F0:18:2B:91"],
      ["2", "MU-102", "Ece Arslan", "ece.arslan@navbea.com", "7C:10:C9:3A:5F:22"],
      ["3", "MU-103", "Seda Acar", "seda.acar@navbea.com", "D8:31:34:87:1C:06"],
    ],
  },
  "beacon-devices": {
    title: "Beacon Cihaz Listesi", searchLabel: "Beacon cihazı ara", total: 418,
    columns: ["Cihaz ID", "UUID", "Major", "Minor", "Konum", "Kat", "Bölge", "Eylemler"],
    rows: [
      ["BCN-1048", "FDA50693-A4E2-4FB1-AFCF-C6EB07647825", "100", "1048", "Merkez Kampüs", "2. Kat", "Ofis 10"],
      ["BCN-1049", "FDA50693-A4E2-4FB1-AFCF-C6EB07647825", "100", "1049", "B Blok", "Zemin", "Ana Giriş"],
      ["BCN-1050", "FDA50693-A4E2-4FB1-AFCF-C6EB07647825", "101", "1050", "C Blok", "1. Kat", "Teknik Alan"],
    ],
  },
  "wifi-devices": {
    title: "Wi-Fi Cihaz Listesi", searchLabel: "Wi-Fi cihazı ara", total: 36,
    columns: ["Cihaz ID", "Cihaz Tipi", "Konum", "Kat", "Bölge", "IP Adresi", "Durum", "Sinyal Gücü", "Sinyal Durumu", "Eylemler"],
    rows: [
      ["GW-0014", "Gateway", "Merkez Kampüs", "2. Kat", "Ofis 10", "192.168.1.14", "Aktif", "-52 dBm", "İyi"],
      ["GW-0018", "Gateway", "B Blok", "Zemin", "Ana Giriş", "192.168.1.18", "Aktif", "-67 dBm", "Orta"],
      ["GW-0021", "Access Point", "C Blok", "1. Kat", "Teknik Alan", "192.168.1.21", "Pasif", "-84 dBm", "Zayıf"],
    ],
  },
  "access-control-devices": {
    title: "Geçiş Kontrol Cihaz Listesi", searchLabel: "Geçiş cihazı ara", total: 24,
    columns: ["Cihaz Adresi", "Cihaz Kimliği", "Cihaz Tipi", "Konum", "Bölge", "Kurallı Geçiş", "Sinyal Durumu", "Durum", "Eylemler"],
    rows: [
      ["192.168.2.21", "AC-00:21:48", "Turnike", "Merkez Kampüs", "Ana Giriş", "Evet", "İyi", "Aktif"],
      ["192.168.2.22", "AC-00:22:52", "Kart Okuyucu", "B Blok", "Kuzey Kapı", "Evet", "Orta", "Aktif"],
      ["192.168.2.23", "AC-00:23:17", "Kapı Kontrolü", "C Blok", "Teknik Alan", "Hayır", "Zayıf", "Pasif"],
    ],
  },
  sensors: {
    title: "Sensör Listesi", searchLabel: "Sensör ara", total: 296,
    columns: ["ID", "Sensör Adı", "Cihaz ID", "Konum", "Kat", "Bölge", "Batarya", "Eylemler"],
    rows: [
      ["SN-1048", "Sıcaklık Sensörü 08", "SNS-1048", "Merkez Kampüs", "2. Kat", "Ofis 10", "%86"],
      ["SN-1052", "Nem Sensörü 12", "SNS-1052", "B Blok", "Zemin", "Depo", "%71"],
      ["SN-1061", "ToF Sensörü 03", "TOF-1061", "C Blok", "3. Kat", "Engelli WC", "%54"],
    ],
  },
  "pir-sensors": {
    title: "PIR Sensör Listesi", searchLabel: "PIR sensörü ara", total: 64,
    columns: ["ID", "Sensör Adı", "Cihaz ID", "Konum", "Kat", "Bölge", "Batarya", "Eylemler"],
    rows: [
      ["PIR-101", "Koridor PIR 01", "PIR-D-101", "Merkez Kampüs", "2. Kat", "Doğu Koridor", "%91"],
      ["PIR-102", "Depo PIR 02", "PIR-D-102", "B Blok", "Zemin", "Depo", "%74"],
      ["PIR-103", "Giriş PIR 03", "PIR-D-103", "C Blok", "Zemin", "Ana Giriş", "%39"],
    ],
  },
};

function getGroupLabel(groupId: string) {
  return GROUPS.find((group) => group.id === groupId)?.label ?? groupId;
}

function getGroupColor(groupId: string) {
  return GROUPS.find((group) => group.id === groupId)?.color ?? "blue";
}

function isAlarmService(service: Service) {
  return service.id.includes("alarm") || service.id === "risk-factors";
}

function getCreateLabel(service: Service) {
  const managementLabels: Record<string, string> = {
    personnels: "Personel Ekle",
    "personnel-groups": "Grup Ekle",
    "personnel-devices": "Cihaz Ekle",
    "mobile-personnels": "Mobil Personel Ekle",
    visitors: "Misafir Ekle",
    "visitor-groups": "Grup Ekle",
    "visitor-devices": "Cihaz Ekle",
    equipments: "Ekipman Ekle",
    "equipment-groups": "Ekipman Grubu Ekle",
    "equipment-devices": "Ekipman Cihazı Ekle",
    users: "Kullanıcı Ekle",
    roles: "Rol Ekle",
    "mobile-users": "Mobil Kullanıcı Ekle",
    "beacon-devices": "Beacon Cihaz Ekle",
    "wifi-devices": "Wifi Cihazı Ekle",
    "access-control-devices": "Geçiş Kontrol Cihazı Ekle",
    sensors: "Sensör Ekle",
    "pir-sensors": "PIR Sensörü Ekle",
    "access-reader-groups": "Kural Ekle",
    areas: "Bölge Ekle",
    "alarms-management": "Alarm Ekle",
    "alarm-notifiers": "Alarm Bildirici Ekle",
    tags: "Etiket Ekle",
    "risk-factors": "Risk Faktörü Ekle",
    attendance: "Tanım Ekle",
    checklists: "Kontrol Listesi Ekle",
    "contractor-works": "Taşeron İş Ekle",
  };
  if (managementLabels[service.id]) return managementLabels[service.id];
  if (service.id === "cameras") return "Kamera ekle";
  if (service.id === "campaigns") return "Kampanya ekle";
  if (service.id === "workflows") return "İş akışı ekle";
  if (service.id === "switches") return "Anahtar ekle";
  if (service.id === "turnstiles") return "Turnike ekle";
  if (service.id === "tof-series") return "ToF serisi ekle";
  if (service.id === "personnels" || PEOPLE_SERVICES.includes(service.id)) return "Personel ekle";
  if (VISITOR_SERVICES.includes(service.id)) return service.id === "invitations" ? "Davet oluştur" : "Misafir ekle";
  if (service.id.includes("equipment")) return "Ekipman ekle";
  if (DEVICE_SERVICES.includes(service.id)) return service.id === "sensors" || service.id === "pir-sensors" ? "Sensör ekle" : "Cihaz ekle";
  if (isAlarmService(service)) return "Alarm kuralı ekle";
  if (service.id === "users" || service.id === "mobile-users") return "Kullanıcı ekle";
  if (service.id === "roles") return "Rol ekle";
  if (service.id === "forms") return "Form oluştur";
  if (service.id === "polls") return "Anket oluştur";
  if (TASK_SERVICES.includes(service.id)) return "Görev oluştur";
  return "Yeni kayıt";
}

function getServiceSummary(service: Service): SummaryMetric[] {
  if (service.id === "shell-dispenser") return [
    { label: "Toplam sensör", value: "296", detail: "Tüm dispenserler", tone: "blue", icon: Activity },
    { label: "Dolu", value: "154", detail: "%52,0", tone: "teal", icon: CheckCircle2 },
    { label: "Orta seviye", value: "86", detail: "%29,1", tone: "amber", icon: Gauge },
    { label: "Müdahale gerekli", value: "56", detail: "28 düşük · 28 boş", tone: "coral", icon: AlertTriangle },
  ];
  if (PEOPLE_SERVICES.includes(service.id)) return [
    { label: "Toplam personel", value: "296", detail: "15 ekip", tone: "blue", icon: Users },
    { label: "Sahada", value: "184", detail: "Şu anda", tone: "teal", icon: CheckCircle2 },
    { label: "İzinli", value: "11", detail: "Bugün", tone: "amber", icon: CalendarClock },
    { label: "İşlem gerekli", value: "4", detail: "Kart veya süre", tone: "coral", icon: AlertTriangle },
  ];
  if (VISITOR_SERVICES.includes(service.id)) return [
    { label: "Bugünkü ziyaret", value: "38", detail: "18 planlı", tone: "blue", icon: UserRoundPlus },
    { label: "İçeride", value: "12", detail: "3 farklı alan", tone: "teal", icon: MapPin },
    { label: "Onay bekleyen", value: "6", detail: "2 yeni", tone: "amber", icon: Clock3 },
    { label: "Süresi geçen", value: "2", detail: "Kontrol gerekli", tone: "coral", icon: AlertTriangle },
  ];
  if (DEVICE_SERVICES.includes(service.id) || service.id.includes("equipment")) return [
    { label: "Toplam varlık", value: "842", detail: "12 grup", tone: "blue", icon: service.icon },
    { label: "Çevrimiçi", value: "817", detail: "%97,0", tone: "teal", icon: CheckCircle2 },
    { label: "Düşük pil", value: "19", detail: "48 saat içinde", tone: "amber", icon: Zap },
    { label: "Çevrimdışı", value: "6", detail: "Kontrol gerekli", tone: "coral", icon: AlertTriangle },
  ];
  if (isAlarmService(service)) return [
    { label: "Toplam kural", value: "48", detail: "9 kategori", tone: "blue", icon: ShieldAlert },
    { label: "Etkin", value: "42", detail: "%87,5", tone: "teal", icon: CheckCircle2 },
    { label: "Uyarı", value: "4", detail: "Eşik kontrolü", tone: "amber", icon: Bell },
    { label: "Devre dışı", value: "2", detail: "İnceleme gerekli", tone: "coral", icon: AlertTriangle },
  ];
  if (TASK_SERVICES.includes(service.id)) return [
    { label: "Toplam görev", value: "126", detail: "8 ekip", tone: "blue", icon: ClipboardCheck },
    { label: "Devam eden", value: "18", detail: "Şu anda", tone: "teal", icon: Clock3 },
    { label: "Bugün bitecek", value: "7", detail: "3 kritik", tone: "amber", icon: CalendarClock },
    { label: "Geciken", value: "3", detail: "Aksiyon gerekli", tone: "coral", icon: AlertTriangle },
  ];
  if (["users", "roles", "mobile-users"].includes(service.id)) return [
    { label: "Toplam kullanıcı", value: "84", detail: "11 rol", tone: "blue", icon: UserCog },
    { label: "Etkin", value: "79", detail: "Son 30 gün", tone: "teal", icon: CheckCircle2 },
    { label: "Yönetici", value: "6", detail: "Tam yetkili", tone: "indigo", icon: ShieldCheck },
    { label: "Kilitli", value: "2", detail: "Kontrol gerekli", tone: "coral", icon: AlertTriangle },
  ];
  return [
    { label: "Toplam kayıt", value: "128", detail: "Güncel kapsam", tone: "blue", icon: service.icon },
    { label: "Etkin", value: "112", detail: "%87,5", tone: "teal", icon: CheckCircle2 },
    { label: "Taslak", value: "12", detail: "Düzenlenebilir", tone: "amber", icon: FileText },
    { label: "İşlem gerekli", value: "4", detail: "Son 24 saat", tone: "coral", icon: AlertTriangle },
  ];
}

function getTableModel(service: Service): TableModel {
  if (CORE_MANAGEMENT_TABLES[service.id]) return CORE_MANAGEMENT_TABLES[service.id];
  const baseIds = TABLE_ROWS.map((row) => row[0]);
  const locations = TABLE_ROWS.map((row) => row[1]);
  const statuses = TABLE_ROWS.map((row) => row[3]);
  if (service.id === "cameras") {
    return { title: "Kamera listesi", searchLabel: "Kamera veya RTSP adresi ara", total: 3, columns: ["ID", "Kamera", "RTSP Adresi", "Konum", "Kat / Bölge", "Yayın", "Eylemler"], rows: [
      ["CAM-01", "Lobi Kamera 1", "rtsp://192.168.1.48/stream/102", "Merkez Kampüs", "Ofis 10 · Güvenlik Girişi", "Yayın kapalı"],
      ["CAM-02", "Kuzey Giriş", "rtsp://192.168.1.52/live", "Merkez Kampüs", "Zemin · Kuzey Kapı", "Yayında"],
      ["CAM-03", "Depo Koridor", "rtsp://192.168.1.63/main", "Depo", "Zemin · Koridor", "Yayında"],
    ] };
  }
  if (service.id === "campaigns") {
    return { title: "Kampanya listesi", searchLabel: "Kampanya veya bağlantı ara", total: 4, columns: ["ID", "Kampanya", "Bağlantı", "Konum / Bölge", "Geçerlilik", "Kullanım", "Durum", "Eylemler"], rows: [
      ["CMP-04", "Yemekhane Avantajı", "/kampanya/yemekhane", "Merkez Kampüs · Yemekhane", "26 Kas 2026", "84 / 250", "Aktif"],
      ["CMP-03", "Güvenlik Eğitimi", "/kampanya/isg", "C Blok · Eğitim Alanı", "3 Ara 2026", "62 / 120", "Aktif"],
      ["CMP-02", "Servis Duyurusu", "/kampanya/servis", "Tüm kampüs", "11 Ara 2026", "196 / 500", "Taslak"],
      ["CMP-01", "Oryantasyon", "/kampanya/orientation", "Ana Bina", "30 Eyl 2026", "108 / 150", "Aktif"],
    ] };
  }
  if (service.id === "workflows") {
    return { title: "İş akışları", searchLabel: "İş akışı ara", total: 2, columns: ["ID", "İş Akışı", "Son Güncelleme", "Durum", "Eylemler"], rows: [
      ["WF-04", "Ekipman Onay Akışı", "Bugün 14:20", "Etkin"],
      ["WF-01", "Vardiya Başlangıç Kontrolü", "Dün 17:45", "Taslak"],
    ] };
  }
  if (service.id === "polls") {
    return { title: "Anket listesi", searchLabel: "Anket veya soru ara", total: 3, columns: ["ID", "Anket", "Soru", "Yanıt", "Durum", "Eylemler"], rows: [
      ["POL-03", "Yemekhane Memnuniyeti", "Bugünkü menüyü nasıl değerlendirirsiniz?", "184 yanıt", "Aktif"],
      ["POL-02", "Servis Saatleri", "Servis saatleri ihtiyacınızı karşılıyor mu?", "96 yanıt", "Aktif"],
      ["POL-01", "İSG Farkındalığı", "Eğitim içeriği yeterli miydi?", "241 yanıt", "Kapandı"],
    ] };
  }
  if (service.id === "access-reader-groups") {
    return { title: "Geçiş kontrol kuralları", searchLabel: "Ad, konum veya erişim türü ara", total: 10, columns: ["Ad", "Konum", "Erişim Türü", "Geçiş Sayısı", "Eylemler"], rows: [
      ["Mesai Saatleri", "Merkez Kampüs", "Saat aralığında çoklu erişim", "1.284"],
      ["Teknik Alan", "C Blok", "İki tarih arasında erişim", "342"],
      ["Haftalık Ziyaretçi", "Ana Bina", "Haftalık plan", "196"],
      ["Yönetici Geçişi", "Tüm kampüs", "Sınırsız", "2.842"],
      ["Bakım Ekibi", "B Blok", "Aylık plan", "418"],
    ] };
  }
  if (service.id === "areas") {
    return { title: "Bölgeler", searchLabel: "Bölge, konum veya kat ara", total: 24, columns: ["ID", "Bölge Adı", "Bölge Tipi", "Konum", "Kat", "Eylemler"], rows: [
      ["AR-024", "Üretim Hattı", "Çalışma Alanı", "Merkez Kampüs", "Zemin"],
      ["AR-021", "Kuzey Toplanma Alanı", "Toplanma Alanı", "Merkez Kampüs", "Açık Alan"],
      ["AR-018", "Teknik Oda", "Riskli Alan", "C Blok", "2. Kat"],
      ["AR-012", "Yemekhane", "Ortak Alan", "Ana Bina", "1. Kat"],
      ["AR-007", "Depo Girişi", "Geçiş Alanı", "Depo", "Zemin"],
    ] };
  }
  if (service.id === "alarms-management") {
    return { title: "Alarm kuralları", searchLabel: "Alarm adı, tipi veya konum ara", total: 48, columns: ["Alarm Adı", "Konum", "Alarm Tipi", "Koşul", "Öncelik", "Başlangıç Tarihi", "Bitiş Tarihi", "Eylemler"], rows: [
      ["Yetkisiz Alan Girişi", "C Blok", "Yetkisiz alana giriş", "Bölgeye giriş", "Kritik", "01.08.2026 00:00", "31.12.2026 23:59"],
      ["Hareketsizlik Kontrolü", "Ana Bina", "Personel hareket etmiyor", "15 dakikadan uzun", "Yüksek", "01.08.2026 08:00", "31.12.2026 18:00"],
      ["Sıcaklık Eşiği", "B Blok", "Sensör aralık dışı", "> 29 °C", "Orta", "01.08.2026 00:00", "31.12.2026 23:59"],
      ["Gateway Bağlantısı", "Merkez Kampüs", "Gateway sinyali yok", "5 dakika çevrimdışı", "Yüksek", "01.08.2026 00:00", "31.12.2026 23:59"],
      ["Azami Kişi Sayısı", "Yemekhane", "Maksimum kişi", "> 180 kişi", "Orta", "01.08.2026 11:00", "31.12.2026 15:00"],
    ] };
  }
  if (service.id === "alarm-notifiers") {
    return { title: "Alarm bildiricileri", searchLabel: "Bildirici, alarm tipi veya konum ara", total: 12, columns: ["#", "Alarm Bildirici Adı", "Alarm Tipi", "Konum", "Eylemler"], rows: [
      ["1", "Kritik Alarm Ekibi", "Tüm kritik alarmlar", "Merkez Kampüs"],
      ["2", "Teknik Bakım", "Cihaz ve sensör alarmları", "B Blok"],
      ["3", "Güvenlik Merkezi", "Geçiş ve alan alarmları", "Tüm konumlar"],
      ["4", "Acil Durum Sorumluları", "Acil durum butonu", "Merkez Kampüs"],
    ] };
  }
  if (service.id === "tags") {
    return { title: "Etiketler", searchLabel: "Etiket adı veya tipi ara", total: 16, columns: ["#", "ID", "Etiket Adı", "Etiket Tipi", "Eylemler"], rows: [
      ["1", "TAG-016", "Yüksekte Çalışma", "Checklist"],
      ["2", "TAG-014", "Teknik Ekip", "Personel"],
      ["3", "TAG-009", "Kritik Alan", "Alarm"],
      ["4", "TAG-006", "Toplanma Noktası", "Bölge"],
    ] };
  }
  if (service.id === "risk-factors") {
    return { title: "Risk faktörleri", searchLabel: "Risk faktörü ara", total: 2, columns: ["#", "ID", "Risk Faktörü Adı", "Eylemler"], rows: [
      ["1", "4", "Deneme test"],
      ["2", "1", "dene12"],
    ] };
  }
  if (service.id === "attendance") {
    return { title: "Mesai ve görev tanımları", searchLabel: "Tanım, konum veya tür ara", total: 6, columns: ["Tanım Adı", "Konum", "Tür", "Hedef", "Tarih", "Eylemler"], rows: [
      ["rapor", "Map 1", "Mesai Giriş–Çıkış Takibi", "Personel", "28.11.2025 14:12:16"],
      ["denemeeee", "Map 1", "İzin & Mazeret", "Personel", "28.11.2025 14:15:22"],
      ["denme", "Map 1", "Mesai Giriş–Çıkış Takibi", "Personel", "28.11.2025 14:15:42"],
      ["Holiday #1764332288328", "Map 1", "İzin & Mazeret", "Personel", "28.11.2025 15:18:09"],
      ["deneme", "Map 1", "Mesai Giriş–Çıkış Takibi", "Personel", "23.02.2026 15:28:56"],
      ["x", "Map 1", "Mesai Giriş–Çıkış Takibi", "Personel", "23.02.2026 15:50:56"],
    ] };
  }
  if (service.id === "checklists") {
    return { title: "Kontrol listeleri", searchLabel: "Kontrol listesi ara", total: 4, columns: ["#", "Ad", "Eylemler"], rows: [
      ["10", "EO1"],
      ["8", "Deneme çalik"],
      ["5", "deneme 2 checklist"],
      ["4", "Test Görev 2"],
    ] };
  }
  if (service.id === "contractor-works") {
    return { title: "Alt yüklenici işleri", searchLabel: "İş, konum veya grup ara", total: 13, columns: ["#", "Ad", "Başlangıç Tarihi", "Bitiş Tarihi", "Konum", "Grup", "Eylemler"], rows: [
      ["19", "dene11", "17.10.2025 00:00", "17.10.2025 00:00", "Map 1", "Beyaz Yaka"],
      ["18", "denesaat", "01.10.2025 03:01", "01.10.2025 05:05", "Map 1", "Personel"],
      ["17", "deneme", "17.10.2025 00:00", "17.10.2025 00:00", "Map 1", "Beyaz Yaka"],
      ["16", "saat", "15.10.2025 00:00", "15.10.2025 00:00", "Map 1", "Beyaz Yaka"],
      ["15", "aaaauy", "10.10.2025 00:00", "22.10.2025 00:00", "Map 1", "Beyaz Yaka"],
      ["14", "son", "01.10.2025 00:00", "09.10.2025 00:00", "Map 1", "Personel"],
    ] };
  }
  if (service.id === "personnels" || service.id === "mobile-personnels") {
    const names = ["Mustafa Aydın", "Ahmet Demir", "Merve Kaya", "Selin Yılmaz", "Mehmet Karaca", "Ece Arslan"];
    return { title: "Personel listesi", searchLabel: "Personel ara", total: 296, columns: ["ID", "Ad Soyad", "Kimlik / Sicil", "Konum", "Grup", "Durum", "Eylemler"], rows: baseIds.map((id, index) => [id, names[index], `TR-${88787878 + index}`, locations[index], TABLE_ROWS[index][2], statuses[index]]) };
  }
  if (VISITOR_SERVICES.includes(service.id)) {
    const names = ["Deniz Akın", "Zeynep Erol", "Can Öz", "Aslı Koç", "Ozan Işık", "Derya Polat"];
    return { title: service.id === "invitations" ? "Davet listesi" : "Ziyaretçi listesi", searchLabel: "Ziyaretçi ara", total: 38, columns: ["ID", "Ad Soyad", "Şirket", "Ziyaret Alanı", "Ziyaret Saati", "Durum", "Eylemler"], rows: baseIds.map((id, index) => [id, names[index], ["ABC Yapı", "Delta Teknik", "Arven", "Bireysel", "Mira Enerji", "Orion"][index], locations[index], `${9 + index}:30`, index === 2 ? "Onay bekliyor" : index === 4 ? "Ayrıldı" : "İçeride"]) };
  }
  if (service.id === "shell-dispenser") {
    const names = ["A Blok Kadın WC", "A Blok Erkek WC", "B Blok Giriş", "C Blok 2. Kat", "D Blok Yemekhane", "Ana Bina Lobi"];
    const levels = ["%82", "%12", "%46", "%0", "%68", "%31"];
    const shellStates = ["Dolu", "Düşük", "Orta", "Boş", "Dolu", "Orta"];
    return { title: "Sensör listesi", searchLabel: "Sensör ara", total: 296, columns: ["ID", "Sensör", "Tür", "Konum", "Doluluk", "Durum", "Eylemler"], rows: baseIds.map((id, index) => [id, names[index], index % 2 ? "Peçetelik" : "Sabunluk", locations[index], levels[index], shellStates[index]]) };
  }
  if (DEVICE_SERVICES.includes(service.id) || service.id.includes("equipment")) {
    const names = ["Gateway 14", "PIR Zemin", "Personel Kartı 38", "ToF WC-03", "Turnike Kuzey", "Kamera Lobi"];
    return { title: "Varlık listesi", searchLabel: "Cihaz veya varlık ara", total: 842, columns: ["ID", "Cihaz / Varlık", "Cihaz Kimliği", "Konum", "Pil / Sinyal", "Durum", "Eylemler"], rows: baseIds.map((id, index) => [id, names[index], `DD9F-${38 + index}C28EB`, locations[index], index === 4 ? "Sabit güç" : `%${100 - index * 11}`, statuses[index]]) };
  }
  if (isAlarmService(service)) {
    const names = ["Azami kişi sayısı", "Yetkisiz bölge", "Kişi hareketsiz", "Düşük pil", "Sıcaklık eşiği", "Kaçak giriş"];
    return { title: "Alarm kuralları", searchLabel: "Alarm kuralı ara", total: 48, columns: ["ID", "Alarm Kuralı", "Kaynak", "Konum", "Öncelik", "Durum", "Eylemler"], rows: baseIds.map((id, index) => [id, names[index], index % 2 ? "Konum" : "Sensör", locations[index], index < 2 ? "Kritik" : "Orta", index === 4 ? "Devre dışı" : "Etkin"]) };
  }
  if (service.id === "users" || service.id === "mobile-users" || service.id === "roles") {
    const names = service.id === "roles" ? ["Sistem Yöneticisi", "Operasyon", "Güvenlik", "Raporlama", "Taşeron", "Misafir Karşılama"] : ["Ayşe Şahin", "Burak Kaya", "Cem Yıldız", "Elif Aksoy", "Mert Tuna", "Seda Acar"];
    return { title: service.id === "roles" ? "Rol listesi" : "Kullanıcı listesi", searchLabel: service.id === "roles" ? "Rol ara" : "Kullanıcı ara", total: service.id === "roles" ? 11 : 84, columns: service.id === "roles" ? ["ID", "Rol", "Kullanıcı", "Yetki Kapsamı", "Son Güncelleme", "Durum", "Eylemler"] : ["ID", "Ad Soyad", "E-posta", "Rol", "Son Giriş", "Durum", "Eylemler"], rows: baseIds.map((id, index) => service.id === "roles" ? [id, names[index], `${4 + index * 3} kullanıcı`, index < 2 ? "Geniş" : "Sınırlı", `${index + 1} gün önce`, "Etkin"] : [id, names[index], `kullanici${index + 1}@navbea.com`, ["Yönetici", "Operasyon", "Güvenlik", "Raporlama", "Taşeron", "Operasyon"][index], `${index + 1} sa önce`, index === 4 ? "Kilitli" : "Etkin"]) };
  }
  if (TASK_SERVICES.includes(service.id) || ["forms", "polls"].includes(service.id)) {
    const names = ["Vardiya başlangıç kontrolü", "Jeneratör bakımı", "Ziyaretçi onayı", "C Blok denetimi", "Yangın ekipmanı kontrolü", "Gün sonu raporu"];
    return { title: service.id === "forms" ? "Form listesi" : service.id === "polls" ? "Anket listesi" : "Görev listesi", searchLabel: "Başlık veya sorumlu ara", total: 126, columns: ["ID", "Başlık", "Sorumlu", "Konum", "Bitiş", "Durum", "Eylemler"], rows: baseIds.map((id, index) => [id, names[index], ["Operasyon", "Teknik", "Güvenlik", "Kalite", "İSG", "Yönetim"][index], locations[index], `${8 + index} Ağu`, index === 3 ? "Gecikti" : index < 2 ? "Devam ediyor" : "Planlandı"]) };
  }
  if (service.id === "system-logs") {
    const names = ["Kullanıcı işlemi", "Cihaz bağlantısı", "Rapor dışa aktarma", "Alarm olayı", "Yetki değişikliği", "Sistem işlemi"];
    return { title: "Sistem olayları", searchLabel: "Olay veya kullanıcı ara", total: 14420, columns: ["ID", "Olay", "Seviye", "Tarih", "Kullanıcı", "Durum", "Eylemler"], rows: baseIds.map((id, index) => [id, names[index], index % 2 ? "Bilgi" : "Uyarı", `06.08.2026 ${14 + index}:20`, index % 2 ? "admin2" : "sistem", "Kaydedildi"]) };
  }
  return { title: "Kayıt listesi", searchLabel: "Listede ara", total: 128, columns: ["ID", "Ad", "Kategori", "Konum", "Son Güncelleme", "Durum", "Eylemler"], rows: baseIds.map((id, index) => [id, index ? `${service.title} ${String(index + 1).padStart(2, "0")}` : service.title, TABLE_ROWS[index][2], locations[index], TABLE_ROWS[index][4], statuses[index]]) };
}

type ActionDialogState = { mode: "create" | "filter" | "columns"; label: string; serviceId?: string };

function ActionDialog({ state, close, confirm }: { state: ActionDialogState; close: () => void; confirm: (message: string) => void }) {
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const title = state.mode === "create" ? state.label : state.mode === "filter" ? "Filtreler" : "Görünen Sütunlar";
  const service = SERVICES.find((item) => item.id === state.serviceId);
  const workflowLike = service?.type === "builder" || state.label === "Adım ekle";
  const visitorLike = Boolean(service && VISITOR_SERVICES.includes(service.id));
  const deviceLike = Boolean(service && (DEVICE_SERVICES.includes(service.id) || service.id.includes("equipment")));
  const personLike = Boolean(service && PEOPLE_SERVICES.includes(service.id));
  useEffect(() => { firstFieldRef.current?.focus(); }, []);
  return <div className="action-overlay"><button className="action-backdrop" aria-label="Pencereyi kapat" onClick={close} /><section className="action-dialog" role="dialog" aria-modal="true" aria-label={title}>
    <div className="action-dialog-head"><div><p className="eyebrow">{state.mode === "create" ? workflowLike ? "YENİ İŞ AKIŞI" : "YENİ KAYIT" : "GÖRÜNÜM AYARLARI"}</p><h2>{title}</h2>{service ? <p>{service.title}</p> : null}</div><IconButton label="Pencereyi kapat" onClick={close}><X size={17} /></IconButton></div>
    {state.mode === "columns" ? <div className="column-options">{(service ? getTableModel(service).columns.filter((column) => column !== "Eylemler") : ["ID", "Ad / Başlık", "Konum", "Grup", "Durum", "Son Güncelleme"]).map((column) => <label key={column}><input type="checkbox" defaultChecked /> <span>{column}</span></label>)}</div> : <div className="action-form">
      {state.mode === "create" ? <label><span>{workflowLike ? "Akış adı" : personLike || visitorLike ? "Ad Soyad" : deviceLike ? "Varlık adı" : "Kayıt adı"}</span><input ref={firstFieldRef} placeholder={workflowLike ? "Örn. Vardiya süre kontrolü" : personLike || visitorLike ? "Ad ve soyad girin" : "Açıklayıcı bir ad girin"} /></label> : null}
      {state.mode === "create" && workflowLike ? <><label><span>Başlangıç türü</span><select><option>Zaman planı</option><option>Personel hareketi</option><option>Sensör olayı</option><option>Manuel başlangıç</option></select></label><label><span>Kapsam</span><select><option>Tüm kampüs</option><option>Ana Bina</option><option>C Blok</option></select></label></> : null}
      {state.mode === "create" && personLike ? <><label><span>Sicil numarası</span><input placeholder="Örn. NV-1042" /></label><label><span>Personel grubu</span><select><option>Operasyon</option><option>Teknik</option><option>Güvenlik</option></select></label></> : null}
      {state.mode === "create" && visitorLike ? <><label><span>Şirket</span><input placeholder="Şirket veya kurum" /></label><label><span>Ziyaret alanı</span><select><option>Ana Bina</option><option>B Blok</option><option>C Blok</option></select></label></> : null}
      {state.mode === "create" && deviceLike ? <><label><span>Cihaz kimliği</span><input placeholder="Cihaz üzerindeki kimlik" /></label><label><span>Konum</span><select><option>Ana Bina</option><option>B Blok</option><option>C Blok</option></select></label></> : null}
      {state.mode === "create" && !workflowLike && !personLike && !visitorLike && !deviceLike ? <><label><span>Konum</span><select><option>{WORKSPACE_NAME}</option><option>Ana Bina</option><option>C Blok</option></select></label><label><span>Başlangıç durumu</span><select><option>Etkin</option><option>Taslak</option></select></label></> : null}
      {state.mode === "filter" ? <><label><span>Konum</span><select><option>Tüm konumlar</option><option>Ana Bina</option><option>C Blok</option></select></label><label><span>Durum</span><select><option>Tüm durumlar</option><option>Etkin</option><option>Dikkat</option><option>Çevrimdışı</option></select></label></> : null}
      {state.mode === "filter" ? <label><span>Tarih Aralığı</span><input type="date" defaultValue="2026-08-06" /></label> : null}
    </div>}
    <div className="action-dialog-footer"><button className="secondary-button" onClick={close}>Vazgeç</button><button className="primary-button" onClick={() => confirm(state.mode === "create" ? `${state.label} hazırlandı` : state.mode === "filter" ? "Filtreler uygulandı" : "Sütun görünümü güncellendi")}>{state.mode === "create" ? workflowLike ? "Akışı oluştur" : "Kaydet" : "Uygula"}</button></div>
  </section></div>;
}

function CompactBars({ values, tone = "blue", label }: { values: number[]; tone?: string; label: string }) {
  const max = Math.max(...values);
  return <div className={`compact-bars ${tone}`} role="img" aria-label={label}>{values.map((value, index) => <span key={index} style={{ height: `${Math.max(14, (value / max) * 100)}%` }} />)}</div>;
}

function HorizontalBreakdown({ items }: { items: Array<{ label: string; value: number; tone: string }> }) {
  const max = Math.max(...items.map((item) => item.value));
  return <div className="horizontal-breakdown">{items.map((item) => <div key={item.label}><span>{item.label}</span><i><b className={item.tone} style={{ width: `${(item.value / max) * 100}%` }} /></i><strong>{item.value}</strong></div>)}</div>;
}

const HOME_ASSET_SUMMARY = [
  { label: "Misafir", value: "11", icon: UserRoundPlus, tone: "violet", serviceId: "visitors" },
  { label: "Çalışan", value: "2.084", icon: Users, tone: "blue", serviceId: "personnels" },
  { label: "Ekipman", value: "296", icon: Boxes, tone: "amber", serviceId: "equipments" },
  { label: "Sensör", value: "128", icon: Activity, tone: "teal", serviceId: "sensors" },
  { label: "Kamera", value: "24", icon: Camera, tone: "coral", serviceId: "cameras" },
  { label: "Okuyucu", value: "18", icon: DoorOpen, tone: "indigo", serviceId: "access-control-devices" },
  { label: "Taşeron", value: "42", icon: HardHat, tone: "slate", serviceId: "contractor-works" },
  { label: "Aktif alarm", value: "7", icon: Bell, tone: "coral", serviceId: "alarm-dashboard" },
  { label: "Yetkisiz giriş", value: "2", icon: ShieldAlert, tone: "amber", serviceId: "alarms-management" },
];

const DASHBOARD_TRENDS = {
  shell: [
    { day: "Pzt", primary: 71, secondary: 18 }, { day: "Sal", primary: 76, secondary: 16 },
    { day: "Çar", primary: 68, secondary: 23 }, { day: "Per", primary: 82, secondary: 12 },
    { day: "Cum", primary: 78, secondary: 15 }, { day: "Cmt", primary: 85, secondary: 10 },
    { day: "Paz", primary: 81, secondary: 13 },
  ],
  tool: [
    { day: "Pzt", primary: 122, secondary: 14 }, { day: "Sal", primary: 138, secondary: 12 },
    { day: "Çar", primary: 131, secondary: 18 }, { day: "Per", primary: 149, secondary: 9 },
    { day: "Cum", primary: 158, secondary: 11 }, { day: "Cmt", primary: 112, secondary: 17 },
    { day: "Paz", primary: 104, secondary: 15 },
  ],
  alarm: [
    { day: "Pzt", primary: 18, secondary: 4 }, { day: "Sal", primary: 14, secondary: 3 },
    { day: "Çar", primary: 21, secondary: 5 }, { day: "Per", primary: 11, secondary: 2 },
    { day: "Cum", primary: 16, secondary: 4 }, { day: "Cmt", primary: 9, secondary: 2 },
    { day: "Paz", primary: 7, secondary: 2 },
  ],
  general: [
    { day: "Pzt", primary: 64, secondary: 31 }, { day: "Sal", primary: 72, secondary: 34 },
    { day: "Çar", primary: 69, secondary: 29 }, { day: "Per", primary: 81, secondary: 37 },
    { day: "Cum", primary: 88, secondary: 42 }, { day: "Cmt", primary: 75, secondary: 36 },
    { day: "Paz", primary: 84, secondary: 39 },
  ],
};

function FilterDropdown({ kind = "general" }: { kind?: "home" | "shell" | "tool" | "general" | "report" }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterFormRef = useRef<HTMLFormElement>(null);
  const thirdLabel = kind === "shell" ? "Alan" : kind === "tool" ? "Ekipman" : kind === "report" ? "Durum" : "Bölge";
  const thirdOptions = kind === "shell" ? ["Tüm alanlar", "A Blok", "B Blok"] : kind === "tool" ? ["Tüm ekipmanlar", "El aletleri", "Araçlar"] : kind === "report" ? ["Tüm durumlar", "Aktif", "Dikkat"] : ["Tüm bölgeler", "A Blok", "B Blok"];
  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open]);
  return <div className="filter-dropdown" ref={dropdownRef}>
    <button className="secondary-button" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((value) => !value)}><Filter size={16} /> Filtrele <ChevronDown size={14} /></button>
    {open ? <section className="panel filter-popover" role="dialog" aria-label="Görünüm filtreleri">
      <div className="filter-popover-head"><div><p className="eyebrow">GÖRÜNÜM</p><h2>Filtreler</h2></div><IconButton label="Filtreleri kapat" onClick={() => setOpen(false)}><X size={15} /></IconButton></div>
      <form ref={filterFormRef} onSubmit={(event) => { event.preventDefault(); setOpen(false); }}><div className="filter-fields">
        <label><span>Konum</span><select><option>Merkez Kampüs</option><option>Ana Bina</option><option>Depo</option></select></label>
        <label><span>Kat</span><select><option>Tüm katlar</option><option>Zemin</option><option>1. Kat</option><option>2. Kat</option></select></label>
        <label><span>{thirdLabel}</span><select>{thirdOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
        {kind === "tool" || kind === "report" ? <label><span>Tarih</span><select><option>Son 7 gün</option><option>Son 30 gün</option><option>Bu yıl</option></select></label> : null}
      </div>
      <div className="filter-popover-footer"><button type="button" className="text-button" onClick={() => filterFormRef.current?.reset()}>Temizle</button><button type="submit" className="primary-button"><Filter size={15} /> Uygula</button></div></form>
    </section> : null}
  </div>;
}

function DashboardTrendChart({ variant }: { variant: "shell" | "tool" | "alarm" | "general" }) {
  const data = DASHBOARD_TRENDS[variant];
  const primaryLabel = variant === "shell" ? "Ortalama doluluk" : variant === "alarm" ? "Alarm" : variant === "tool" ? "Kullanımda" : "Operasyon";
  const secondaryLabel = variant === "shell" ? "Düşük seviye" : variant === "alarm" ? "Kritik" : variant === "tool" ? "Bakım / gecikme" : "Bekleyen";
  return <div className="dashboard-trend-visual" role="img" aria-label="Son yedi günlük operasyon eğilimi">
    <div className="rechart-frame">
      <ResponsiveContainer width="100%" height="100%">
      {variant === "tool" ? <BarChart data={data} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="4 6" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-soft)", fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-soft)", fontSize: 10 }} />
        <Tooltip cursor={{ fill: "var(--surface-soft)" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)" }} />
        <Bar dataKey="primary" name={primaryLabel} fill="var(--chart-blue)" radius={[7, 7, 2, 2]} maxBarSize={34} />
        <Bar dataKey="secondary" name={secondaryLabel} fill="var(--chart-amber)" radius={[7, 7, 2, 2]} maxBarSize={22} />
      </BarChart> : <AreaChart data={data} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
        <defs><linearGradient id={`trend-${variant}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={variant === "alarm" ? "var(--chart-coral)" : "var(--chart-teal)"} stopOpacity={0.32} /><stop offset="100%" stopColor={variant === "alarm" ? "var(--chart-coral)" : "var(--chart-teal)"} stopOpacity={0.02} /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="4 6" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-soft)", fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-soft)", fontSize: 10 }} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)" }} />
        <Area type="monotone" dataKey="primary" name={primaryLabel} stroke={variant === "alarm" ? "var(--chart-coral)" : "var(--chart-teal)"} strokeWidth={3} fill={`url(#trend-${variant})`} />
        <Line type="monotone" dataKey="secondary" name={secondaryLabel} stroke="var(--chart-amber)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "var(--surface)" }} />
      </AreaChart>}
      </ResponsiveContainer>
    </div>
    <div className="chart-inline-legend"><span><i className={variant === "alarm" ? "coral" : variant === "tool" ? "blue" : "teal"} />{primaryLabel}</span><span><i className="amber" />{secondaryLabel}</span></div>
  </div>;
}

function DistributionDonut({ shell = false }: { shell?: boolean }) {
  const data = shell ? [
    { name: "Dolu", value: 154, color: "var(--chart-teal)" }, { name: "Orta", value: 86, color: "var(--chart-amber)" },
    { name: "Düşük", value: 28, color: "var(--chart-coral)" }, { name: "Boş", value: 28, color: "var(--chart-slate)" },
  ] : [
    { name: "Normal", value: 2318, color: "var(--chart-teal)" }, { name: "Dikkat", value: 66, color: "var(--chart-amber)" },
    { name: "Kritik", value: 7, color: "var(--chart-coral)" },
  ];
  return <div className="donut-layout"><div className="rechart-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={68} paddingAngle={2} stroke="none">{data.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)" }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{shell ? "296" : "%96,9"}</strong><small>{shell ? "sensör" : "normal"}</small></div></div><ul>{data.map((item) => <li key={item.name}><span className="legend" style={{ background: item.color }} /> {item.name} <strong>{item.value.toLocaleString("tr-TR")}</strong></li>)}</ul></div>;
}

function MiniMap({ emergency = false }: { emergency?: boolean }) {
  const [zoomed, setZoomed] = useState(false);
  const [layersVisible, setLayersVisible] = useState(true);
  return <div className={`mini-map ${emergency ? "emergency-map" : ""} ${zoomed ? "zoomed" : ""} ${layersVisible ? "show-layers" : "hide-layers"}`}>
    <div className="map-viewport"><div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" />
      <div className="map-block block-a"><span>A BLOK</span><small>42 kişi</small></div>
      <div className="map-block block-b"><span>B BLOK</span><small>28 kişi</small></div>
      <div className="map-block block-c"><span>C BLOK</span><small>17 kişi</small></div>
      <div className="map-block block-d"><span>D BLOK</span><small>22 kişi</small></div>
      <span className="map-marker marker-one"><Radio size={14} /></span>
      <span className="map-marker marker-two warning"><AlertTriangle size={14} /></span>
      <span className="map-marker marker-three"><Users size={14} /></span>
    </div>
    <div className="map-tools"><IconButton label={zoomed ? "Uzaklaştır" : "Yakınlaştır"} active={zoomed} onClick={() => setZoomed((value) => !value)}>{zoomed ? <X size={15} /> : <Plus size={16} />}</IconButton><IconButton label="Katmanlar" active={layersVisible} onClick={() => setLayersVisible((value) => !value)}><Layers3 size={16} /></IconButton></div>
  </div>;
}

function HomeView({ openService, openCatalog, recentIds }: { openService: (id: string) => void; openCatalog: (group?: string) => void; recentIds: string[] }) {
  return <div className="view-stack">
    <SectionHeader eyebrow={`${WORKSPACE_NAME.toUpperCase()} · 8 AĞUSTOS 2026, CUMARTESİ`} title="Operasyon Merkezi" description="Son güncelleme 15:42" actions={<><FilterDropdown kind="home" /><button className="secondary-button"><RefreshCw size={16} /> Yenile</button><button className="primary-button" onClick={() => openService("active-tasks")}><Plus size={17} /> Yeni görev</button></>} />
    <section className="panel home-summary-panel" aria-label="Canlı varlık özeti"><div className="home-summary-heading"><div><p className="eyebrow">CANLI DURUM</p><h2>Varlık özeti</h2></div><span><Radio size={13} /> Son veri 15:42:18</span></div><div className="asset-overview">{HOME_ASSET_SUMMARY.map(({ label, value, icon: AssetIcon, tone, serviceId }) => <button key={label} onClick={() => openService(serviceId)}><span className={`metric-icon ${tone}`}><AssetIcon size={18} /></span><span><small>{label}</small><strong>{value}</strong></span><ChevronRight size={14} /></button>)}</div></section>

    <div className="home-grid">
      <section className="panel work-panel">
        <div className="panel-heading"><div><p className="eyebrow">İŞ KUTUSU</p><h2>Öncelikli işlemler</h2></div><button className="text-button" onClick={() => openService("active-tasks")}>Tümünü aç</button></div>
        <div className="work-list">{WORK_ITEMS.map(({ level, title, meta, tag, icon: ItemIcon }) => <button className="work-row" key={title} onClick={() => openService(level === "critical" ? "alarm-dashboard" : "active-tasks")}><span className={`work-icon ${level}`}><ItemIcon size={18} /></span><span className="work-copy"><strong>{title}</strong><small>{meta}</small></span><span className={`soft-tag ${level}`}>{tag}</span><span className="row-arrow">›</span></button>)}</div>
      </section>
      <section className="panel map-panel"><div className="panel-heading"><div><p className="eyebrow">CANLI SAHA</p><h2>Konum görünümü</h2></div><button className="text-button" onClick={() => openService("live")}>Canlı izle</button></div><MiniMap /></section>
    </div>

    <section className="panel services-panel">
      <div className="panel-heading"><div><p className="eyebrow">MODÜLLER</p><h2>Çalışma alanları</h2></div><button className="secondary-button" onClick={() => openCatalog()}><Grid2X2 size={16} /> Modül dizini</button></div>
      <div className="group-grid">{GROUPS.map((group) => { const GroupIcon = group.icon; return <button key={group.id} className="group-card" onClick={() => openCatalog(group.id)}><span className={`group-icon ${group.color}`}><GroupIcon size={22} /></span><span><strong>{group.label}</strong></span><span className="row-arrow">›</span></button>; })}</div>
    </section>

    <section className="panel recent-panel"><div className="panel-heading"><div><p className="eyebrow">HIZLI ERİŞİM</p><h2>Son kullanılanlar</h2></div></div><div className="recent-grid">{recentIds.map((id) => { const service = SERVICES.find((item) => item.id === id)!; const ServiceIcon = service.icon; const tone = getGroupColor(service.group); return <article className="recent-card" key={id}><button className="recent-open" onClick={() => openService(id)}><span className={`recent-icon ${tone}`}><ServiceIcon size={20} /></span><span><strong>{service.title}</strong><small>{getGroupLabel(service.group)}</small></span><ChevronRight size={15} /></button></article>; })}</div></section>
  </div>;
}

function CatalogView({ activeGroup, setActiveGroup, openService }: { activeGroup: string; setActiveGroup: (value: string) => void; openService: (id: string) => void }) {
  const visibleGroups = activeGroup === "Tümü" ? GROUPS : GROUPS.filter((group) => group.id === activeGroup);
  const renderService = (service: Service) => { const ServiceIcon = service.icon; const tone = getGroupColor(service.group); return <article key={service.id} className="service-card"><button className="service-open" onClick={() => openService(service.id)}><span className={`service-icon ${tone}`}><ServiceIcon size={21} /></span><span className="service-copy"><strong>{service.title}</strong><small>{getGroupLabel(service.group)}</small></span>{service.status ? <span className="live-badge">{service.status}</span> : null}<span className="row-arrow">›</span></button></article>; };
  return <div className="view-stack"><SectionHeader eyebrow={WORKSPACE_NAME.toUpperCase()} title="Modül Dizini" actions={<button className="secondary-button"><Settings size={16} /> Görünümü düzenle</button>} />
    <div className="catalog-tabs"><button className={activeGroup === "Tümü" ? "active" : ""} onClick={() => setActiveGroup("Tümü")}>Tümü</button>{GROUPS.map((group) => <button key={group.id} className={activeGroup === group.id ? "active" : ""} onClick={() => setActiveGroup(group.id)}>{group.label}</button>)}</div>
    {visibleGroups.map((group) => { const GroupIcon = group.icon; const groupServices = SERVICES.filter((service) => service.group === group.id); return <section className="catalog-section" key={group.id}><div className="catalog-group-heading"><span className={`group-icon ${group.color}`}><GroupIcon size={21} /></span><h2>{group.label}</h2></div><div className="service-grid">{groupServices.map(renderService)}</div></section>; })}
  </div>;
}

function LiveView({ emergency = false }: { emergency?: boolean }) {
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const [selectedArea, setSelectedArea] = useState("A Blok");
  return <div className="view-stack"><SectionHeader eyebrow={`${emergency ? "GÜVENLİK" : "CANLI İZLEME"} · ${WORKSPACE_NAME.toUpperCase()}`} title={emergency ? "Toplanma Durumu" : "Saha Haritası"} description="Son veri 15:42:18" actions={<><StatusPill tone={emergency ? "danger" : "success"}>{emergency ? "Acil durum" : "Canlı"}</StatusPill><FilterDropdown kind="general" /></>} />
    <div className="live-layout"><section className="panel live-map-card"><div className="map-filters">{[["Tümü", "2.391"], ["Personel", "2.084"], ["Ekipman", "296"], ["Misafir", "11"]].map(([label, count]) => <button key={label} className={`filter-chip ${activeFilter === label ? "active" : ""}`} onClick={() => setActiveFilter(label)}>{label} <span>{count}</span></button>)}</div><MiniMap emergency={emergency} /></section>
      <aside className="panel live-side"><div className="panel-heading"><div><p className="eyebrow">{emergency ? "TOPLANMA BÖLGELERİ" : "VARLIKLAR"}</p><h2>{emergency ? "Bölge durumu" : "Yakındaki hareketler"}</h2></div><IconButton label="Seçenekler"><MoreHorizontal size={18} /></IconButton></div><div className="side-list">{[["A Blok", "42 kişi", "Güvende"], ["B Blok", "28 kişi", "Güvende"], ["C Blok", "17 kişi", emergency ? "3 kişi eksik" : "1 alarm"], ["D Blok", "22 kişi", "Kontrol edildi"]].map(([name, count, state], i) => <button key={name} className={`side-row ${selectedArea === name ? "selected" : ""}`} aria-pressed={selectedArea === name} onClick={() => setSelectedArea(name)}><span className={`site-dot site-${i}`} /><span><strong>{name}</strong><small>{count}</small></span><em className={state.includes("eksik") || state.includes("alarm") ? "danger-text" : ""}>{state}</em></button>)}</div><button className="primary-button full">{emergency ? "Yoklama raporu oluştur" : `${selectedArea} alanını incele`}</button></aside>
    </div>
  </div>;
}

type TableCallbacks = {
  onColumns?: () => void;
  onExport?: () => void;
  onNotice?: (message: string) => void;
};

function DashboardView({ service, tableCallbacks }: { service: Service; tableCallbacks?: TableCallbacks }) {
  const metrics = getServiceSummary(service);
  const shell = service.id === "shell-dispenser";
  const alarm = service.id === "alarm-dashboard";
  const tool = service.id === "tool-tracking";
  const breakdown = shell ? [{ label: "Dolu", value: 154, tone: "teal" }, { label: "Orta", value: 86, tone: "amber" }, { label: "Düşük", value: 28, tone: "coral" }] : alarm ? [{ label: "Acil durum", value: 18, tone: "coral" }, { label: "Hareketsizlik", value: 11, tone: "amber" }, { label: "Geçiş", value: 7, tone: "violet" }] : tool ? [{ label: "Kullanımda", value: 148, tone: "blue" }, { label: "Hazır", value: 96, tone: "teal" }, { label: "Bakım", value: 22, tone: "amber" }] : [{ label: "A Blok", value: 84, tone: "blue" }, { label: "B Blok", value: 71, tone: "teal" }, { label: "C Blok", value: 58, tone: "violet" }];
  if (service.id === "shell-dashboard") return <div className="view-stack"><SectionHeader eyebrow={`${getGroupLabel(service.group).toUpperCase()} · ${WORKSPACE_NAME.toUpperCase()}`} title={service.title} description="Son güncelleme 15:42" actions={<><FilterDropdown kind="general" /><button className="primary-button"><Plus size={16} /> Bileşen ekle</button></>} /><section className="panel dashboard-empty"><span className="metric-icon violet"><LayoutDashboard size={24} /></span><h2>Henüz veri bileşeni yok</h2><p>Bu panoya gösterge, grafik veya tablo ekleyin.</p><button className="primary-button"><Plus size={16} /> Bileşen ekle</button></section></div>;
  const trendVariant = shell ? "shell" : tool ? "tool" : alarm ? "alarm" : "general";
  return <div className="view-stack"><SectionHeader eyebrow={`${getGroupLabel(service.group).toUpperCase()} · ${WORKSPACE_NAME.toUpperCase()}`} title={service.title} description="Son güncelleme 15:42" actions={<><FilterDropdown kind={shell ? "shell" : tool ? "tool" : "general"} /><button className="secondary-button"><RefreshCw size={16} /> Yenile</button><button className="primary-button"><Plus size={16} /> Bileşen ekle</button></>} />
    <section className="metric-grid dashboard-metric-strip">{metrics.map((metric) => { const MetricIcon = metric.icon; return <article className="metric-card" key={metric.label}><span className={`metric-icon ${metric.tone}`}><MetricIcon size={20} /></span><div><small>{metric.label}</small><strong>{metric.value}</strong><span className="trend">{metric.detail}</span></div></article>; })}</section>
    <div className={`dashboard-grid dashboard-grid-${trendVariant}`}><section className="panel chart-card dashboard-primary-chart"><div className="panel-heading"><div><p className="eyebrow">SON 7 GÜN</p><h2>{shell ? "Doluluk değişimi" : alarm ? "Alarm yoğunluğu" : tool ? "Ekipman kullanımı" : "Operasyon trendi"}</h2></div><StatusPill tone="success">Güncel</StatusPill></div><DashboardTrendChart variant={trendVariant} /></section><section className="panel distribution-card dashboard-distribution"><div className="panel-heading"><div><p className="eyebrow">DURUM DAĞILIMI</p><h2>{shell ? "Doluluk dağılımı" : "Anlık sağlık"}</h2></div></div><DistributionDonut shell={shell} /></section></div>
    <div className="visual-insight-grid"><section className="panel compact-chart-card"><div><p className="eyebrow">KAYNAK DAĞILIMI</p><h2>{shell ? "Seviye bantları" : alarm ? "Alarm tipleri" : tool ? "Kullanım durumu" : "Alan yükü"}</h2></div><HorizontalBreakdown items={breakdown} /></section><section className="panel compact-chart-card"><div><p className="eyebrow">SAATLİK HAREKET</p><h2>Gün içi yoğunluk</h2></div><CompactBars values={shell ? [22,28,35,49,71,66,52,43,37,29,24,18] : [18,25,36,61,82,76,68,72,57,46,31,22]} tone={alarm ? "coral" : shell ? "teal" : "violet"} label="Gün içindeki saatlik yoğunluk dağılımı" /></section></div>
    <DataTable key={service.id} model={getTableModel(service)} {...tableCallbacks} />
  </div>;
}

function ReportView({ service, tableCallbacks }: { service: Service; tableCallbacks?: TableCallbacks }) {
  return <div className="view-stack"><SectionHeader eyebrow={`RAPORLAR · ${WORKSPACE_NAME.toUpperCase()}`} title={service.title} description="10 Temmuz–8 Ağustos 2026" actions={<><FilterDropdown kind="report" /><button className="secondary-button"><CalendarClock size={16} /> Son 30 gün</button><button className="primary-button"><FileText size={16} /> Dışa aktar</button></>} />
    <div className="dashboard-grid"><section className="panel chart-card"><div className="panel-heading"><div><p className="eyebrow">ZAMAN SERİSİ</p><h2>{service.id === "report-sensors" ? "Sıcaklık ve nem eğrisi" : service.id === "report-pir" ? "Hareket algılama yoğunluğu" : "Dönemsel değişim"}</h2></div></div><div className="rechart-frame"><ResponsiveContainer width="100%" height="100%"><LineChart data={DASHBOARD_TRENDS.general} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="4 6" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-soft)", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-soft)", fontSize: 10 }} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)" }} /><Line type="monotone" dataKey="primary" name="Kayıt" stroke="var(--chart-blue)" strokeWidth={3} dot={{ r: 4, fill: "var(--surface)", strokeWidth: 2 }} activeDot={{ r: 6 }} /><Line type="monotone" dataKey="secondary" name="Karşılaştırma" stroke="var(--chart-violet)" strokeWidth={2} strokeDasharray="6 5" dot={false} /></LineChart></ResponsiveContainer></div></section><section className="panel distribution-card"><div className="panel-heading"><div><p className="eyebrow">DAĞILIM</p><h2>{service.id.includes("alarm") ? "Öncelik" : "Konum"}</h2></div></div><HorizontalBreakdown items={[{ label: "A Blok", value: 4820, tone: "blue" }, { label: "B Blok", value: 3740, tone: "teal" }, { label: "C Blok", value: 2860, tone: "violet" }, { label: "Diğer", value: 1940, tone: "amber" }]} /><div className="report-kpi-row"><div><span>Kayıt</span><strong>14.820</strong></div><div><span>Değişim</span><strong className="positive-text">+%8,4</strong></div></div></section></div>
    <DataTable key={service.id} model={getTableModel(service)} {...tableCallbacks} />
  </div>;
}

function BuilderView({ service }: { service: Service }) {
  const Icon = service.icon;
  const dynamicReport = service.id === "report-dynamic";
  const [addedBlocks, setAddedBlocks] = useState<string[]>([]);
  const createLabel = service.id === "time-matching" ? "Yeni eşleştirme akışı" : service.id === "report-dynamic" ? "Yeni rapor" : service.id === "wizard" ? "Yeni kurulum" : "Yeni iş akışı";
  return <div className="view-stack"><SectionHeader eyebrow={`${getGroupLabel(service.group).toUpperCase()} · ${WORKSPACE_NAME.toUpperCase()}`} title={service.title} description="Son kayıt 15:40" actions={<><button className="secondary-button">Taslaklar</button><button className="primary-button"><Plus size={16} /> {createLabel}</button></>} />
    <div className="builder-layout"><aside className="panel builder-library"><div className="panel-heading"><div><p className="eyebrow">BİLEŞENLER</p><h2>{dynamicReport ? "Widget kütüphanesi" : "Araç kutusu"}</h2></div></div>{(dynamicReport ? [["Gösterge", Gauge], ["Çizgi grafik", BarChart3], ["Veri tablosu", Grid2X2], ["Filtre", Filter], ["Metin alanı", FileText]] : [["Başlangıç", Zap], ["Onay adımı", CheckCircle2], ["Bildirim", Bell], ["Koşul", Workflow], ["Form alanı", FileText]]).map(([label, C]) => { const Component = C as LucideIcon; return <button key={label as string} onClick={() => setAddedBlocks((current) => [...current, label as string])}><span><Component size={18} /></span>{label as string}<Plus size={15} /></button>; })}</aside><section className="panel builder-canvas"><div className="canvas-top"><span>Taslak • Otomatik kaydedildi</span><div><button className="secondary-button">Önizle</button><button className="primary-button">Yayınla</button></div></div><div className="workflow-canvas"><div className="flow-node start"><span><Icon size={18} /></span><div><small>{dynamicReport ? "VERİ KAYNAĞI" : "BAŞLANGIÇ"}</small><strong>{dynamicReport ? "Tarih, konum ve varlık filtresi" : service.title}</strong></div></div><span className="flow-line" /><div className="flow-node"><span><Filter size={18} /></span><div><small>{dynamicReport ? "ALANLAR" : "KOŞUL"}</small><strong>{dynamicReport ? "Ölçüm ve gruplama alanları" : "Konum ve durum kontrolü"}</strong></div></div><span className="flow-line" /><div className="flow-node"><span>{dynamicReport ? <BarChart3 size={18} /> : <Bell size={18} />}</span><div><small>{dynamicReport ? "GÖRSELLEŞTİRME" : "AKSİYON"}</small><strong>{dynamicReport ? "Grafik ve veri tablosu" : "Sorumluya bildirim gönder"}</strong></div></div>{addedBlocks.map((block, index) => <div className="flow-added" key={`${block}-${index}`}><Plus size={14} />{block}</div>)}<button className="add-step" onClick={() => setAddedBlocks((current) => [...current, dynamicReport ? "Yeni widget" : "Yeni adım"])}><Plus size={17} /> {dynamicReport ? "Widget ekle" : "Adım ekle"}</button></div></section><aside className="panel inspector"><div className="panel-heading"><div><p className="eyebrow">AYARLAR</p><h2>{dynamicReport ? "Seçili widget" : "Seçili adım"}</h2></div></div><label><span>Ad</span><input defaultValue={dynamicReport ? "Operasyon trendi" : "Konum ve durum kontrolü"} /></label><label><span>Konum</span><select><option>Ana Bina</option></select></label><label><span>Durum</span><select><option>Aktif</option></select></label><button className="secondary-button full">{dynamicReport ? "Veriyi önizle" : "Adımı test et"}</button></aside></div>
  </div>;
}

function ServiceView({ service, onColumns, onExport, onNotice }: { service: Service } & TableCallbacks) {
  if (["live", "emergency", "summary", "alarm-dashboard", "active-tasks"].includes(service.id)) return <MonitoringView id={service.id as "live" | "emergency" | "summary" | "alarm-dashboard" | "active-tasks"} />;
  if (service.id === "maps") return <MapManagementView />;
  if (service.id === "dashboard-management") return <DashboardManagementView />;
  if (service.id === "time-matching") return <TimeMatchingView />;
  if (service.id === "time-approval") return <TimeApprovalView />;
  if (service.id === "time-report") return <TimeReportView onColumns={onColumns} onExport={onExport} onNotice={onNotice} />;
  if (service.id === "live" || service.id === "report-heatmap") return <LiveView />;
  if (service.id === "emergency") return <LiveView emergency />;
  const tableCallbacks = { onColumns, onExport, onNotice };
  if (service.type === "dashboard") return <DashboardView service={service} tableCallbacks={tableCallbacks} />;
  if (service.type === "report") return <ReportView service={service} tableCallbacks={tableCallbacks} />;
  if (service.type === "builder") return <BuilderView service={service} />;
  if (CONFIGURATION_MANAGEMENT_SERVICES.includes(service.id as typeof CONFIGURATION_MANAGEMENT_SERVICES[number])) {
    const notifier = service.id === "alarm-notifiers";
    return <div className="view-stack"><SectionHeader eyebrow="YÖNETİM" title={CONFIGURATION_MANAGEMENT_TITLES[service.id]} actions={<>{notifier ? <button className="secondary-button"><Settings size={16} /> Ayarlar</button> : null}<button className="primary-button"><Plus size={16} /> {getCreateLabel(service)}</button></>} /><DataTable key={service.id} model={getTableModel(service)} showExport={service.id !== "tags"} {...tableCallbacks} /></div>;
  }
  if (OPERATION_MANAGEMENT_SERVICES.includes(service.id as typeof OPERATION_MANAGEMENT_SERVICES[number])) {
    const attendance = service.id === "attendance";
    const contractor = service.id === "contractor-works";
    return <div className="view-stack"><SectionHeader eyebrow="YÖNETİM" title={OPERATION_MANAGEMENT_TITLES[service.id]} actions={<>{attendance ? <><button className="secondary-button" onClick={() => onNotice?.("İzin ve mazeret tipleri açıldı")}>İzin & Mazeret Tipleri</button><button className="secondary-button">İzin & Mazeret Ekle</button><button className="secondary-button">Tanım Ekle</button><button className="primary-button" onClick={() => onNotice?.("Mesai kayıtları açıldı")}>Mesai Kayıtları</button></> : <>{contractor ? <button className="secondary-button" onClick={() => onNotice?.("Alt yüklenici ayarları açıldı")}><Settings size={16} /> Ayarlar</button> : null}<button className="primary-button"><Plus size={16} /> {getCreateLabel(service)}</button></>}</>} /><DataTable key={service.id} model={getTableModel(service)} showExport={service.id !== "risk-factors"} {...tableCallbacks} /></div>;
  }
  if (CORE_MANAGEMENT_SERVICES.includes(service.id as typeof CORE_MANAGEMENT_SERVICES[number])) {
    const supportsBulkImport = ["personnels", "personnel-groups", "personnel-devices", "visitor-devices", "equipment-devices"].includes(service.id);
    const isVisitorList = service.id === "visitors";
    return <div className="view-stack"><SectionHeader eyebrow={(CORE_MANAGEMENT_SECTIONS[service.id] ?? "Yönetim").toLocaleUpperCase("tr")} title={service.title} actions={<>{isVisitorList ? <FilterDropdown kind="general" /> : null}{supportsBulkImport ? <button className="secondary-button"><FileText size={16} /> Toplu İçe Aktar</button> : null}{service.id === "wifi-devices" ? <button className="secondary-button"><Activity size={16} /> RSSI Testi</button> : null}{service.id === "sensors" ? <button className="secondary-button"><Plus size={16} /> ToF Sensörü Ekle</button> : null}<button className="primary-button"><Plus size={16} /> {getCreateLabel(service)}</button></>} /><DataTable key={service.id} model={getTableModel(service)} showExport {...tableCallbacks} /></div>;
  }
  const metrics = getServiceSummary(service);
  return <div className="view-stack"><SectionHeader eyebrow={getGroupLabel(service.group).toLocaleUpperCase("tr")} title={service.title} actions={<><FilterDropdown kind="general" /><button className="primary-button"><Plus size={16} /> {getCreateLabel(service)}</button></>} /><section className="summary-strip">{metrics.map((metric) => { const MetricIcon = metric.icon; return <div key={metric.label}><span className={`metric-icon ${metric.tone}`}><MetricIcon size={19} /></span><p><small>{metric.label}</small><strong>{metric.value}</strong><em>{metric.detail}</em></p></div>; })}</section><DataTable key={service.id} model={getTableModel(service)} {...tableCallbacks} /></div>;
}

function CommandPalette({ close, openService, openCatalog }: { close: () => void; openService: (id: string) => void; openCatalog: () => void }) {
  const [query, setQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => query
    ? SERVICES.filter((service) => `${service.title} ${service.description} ${service.group}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))).slice(0, 8)
    : FREQUENT_IDS.map((id) => SERVICES.find((service) => service.id === id)).filter((service): service is Service => Boolean(service)), [query]);
  useEffect(() => {
    searchInputRef.current?.focus();
    const handleOutside = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!popoverRef.current?.contains(target) && !target.closest(".global-search")) close();
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [close]);
  return <div className="command-popover" ref={popoverRef}><div className="command-dialog"><div className="command-search"><Search size={19} /><input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sayfa, kişi, cihaz veya rapor ara…" /><IconButton label="Aramayı kapat" onClick={close}><X size={16} /></IconButton></div><div className="command-results"><p className="eyebrow">{query ? "ARAMA SONUÇLARI" : "SIK KULLANILANLAR"}</p>{results.map((service) => { const Icon = service.icon; const tone = getGroupColor(service.group); return <button key={service.id} onClick={() => { openService(service.id); close(); }}><span className={`command-result-icon ${tone}`}><Icon size={18} /></span><span><strong>{service.title}</strong><small>{getGroupLabel(service.group)}</small></span><kbd>↵</kbd></button>; })}{results.length === 0 ? <div className="empty-command"><Search size={28} /><strong>Sonuç bulunamadı</strong><span>Farklı bir sayfa veya kayıt adı deneyin.</span></div> : null}</div><div className="command-footer"><button onClick={() => { openCatalog(); close(); }}><Grid2X2 size={15} /> Modül dizinini aç</button><span><kbd>↑↓</kbd> Gezin <kbd>↵</kbd> Aç</span></div></div></div>;
}

export function NavbeaApp() {
  const [activeId, setActiveId] = useState("home");
  const [tabs, setTabs] = useState<string[]>(["home", "live", "personnels"]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [flyoutId, setFlyoutId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<string[]>(["monitoring"]);
  const [catalogGroup, setCatalogGroup] = useState("Tümü");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<ActionDialogState | null>(null);
  const [toast, setToast] = useState("");
  const [recentIds, setRecentIds] = useState<string[]>(INITIAL_RECENT_IDS);
  const [pinnedTabIds, setPinnedTabIds] = useState<string[]>(["live"]);

  useEffect(() => {
    const restorePins = window.setTimeout(() => {
      const savedPins = window.localStorage.getItem("navbea:pinned-tabs");
      if (savedPins) {
        try {
          const parsedPins = JSON.parse(savedPins);
          const validPins = Array.isArray(parsedPins)
            ? parsedPins.filter((id): id is string => typeof id === "string" && (["catalog", "marketplace"].includes(id) || SERVICES.some((service) => service.id === id)))
            : [];
          setPinnedTabIds(validPins);
          setTabs((current) => ["home", ...validPins, ...current.filter((id) => id !== "home" && !validPins.includes(id))]);
        } catch { /* Keep safe defaults. */ }
      }
    }, 0);
    return () => window.clearTimeout(restorePins);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen(true); }
      if (event.key === "Escape") { setPaletteOpen(false); setFlyoutId(null); setMobileMenuOpen(false); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    return () => window.cancelAnimationFrame(frame);
  }, [activeId]);

  const openService = (id: string) => {
    const path = findSidebarPath(SIDEBAR_TREE, id);
    setExpandedNodes(path);
    setActiveId(id);
    setMobileMenuOpen(false);
    setFlyoutId(null);
    setTabs((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      if (next.length <= MAX_WORKSPACE_TABS) return next;
      const removableId = next.find((candidate) => candidate !== "home" && candidate !== id && !pinnedTabIds.includes(candidate));
      return removableId ? next.filter((candidate) => candidate !== removableId) : next;
    });
    if (SERVICES.some((service) => service.id === id)) setRecentIds((current) => [id, ...current.filter((item) => item !== id)].slice(0, 6));
  };
  const openCatalog = (group = "Tümü") => { setCatalogGroup(group); openService("catalog"); };
  const toggleNode = (id: string) => setExpandedNodes((current) => current.includes(id) ? findNodePath(SIDEBAR_TREE, id).slice(0, -1) : findNodePath(SIDEBAR_TREE, id));
  const closeTab = (id: string) => {
    const next = tabs.filter((tab) => tab !== id);
    const safe = next.length ? next : ["home"];
    const nextPins = pinnedTabIds.filter((tab) => tab !== id);
    setTabs(safe);
    setPinnedTabIds(nextPins);
    window.localStorage.setItem("navbea:pinned-tabs", JSON.stringify(nextPins));
    if (activeId === id) setActiveId(safe[safe.length - 1]);
  };
  const getLabel = (id: string) => id === "home" ? "Ana Sayfa" : id === "catalog" ? "Tüm Hizmetler" : id === "marketplace" ? "Marketplace" : SERVICES.find((service) => service.id === id)?.title ?? id;
  const getIcon = (id: string): LucideIcon => id === "home" ? Home : id === "catalog" ? Grid2X2 : id === "marketplace" ? Store : SERVICES.find((service) => service.id === id)?.icon ?? FileText;
  const activeService = SERVICES.find((service) => service.id === activeId);
  const activeRootId = SIDEBAR_TREE.find((node) => nodeContainsService(node, activeId))?.id;
  const flyoutNode = SIDEBAR_TREE.find((node) => node.id === flyoutId);
  const toggleTabPin = (id: string) => setPinnedTabIds((current) => {
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    window.localStorage.setItem("navbea:pinned-tabs", JSON.stringify(next));
    return next;
  });
  const orderedTabs = useMemo(() => [
    ...tabs.filter((id) => id === "home"),
    ...pinnedTabIds.filter((id) => id !== "home" && tabs.includes(id)),
    ...tabs.filter((id) => id !== "home" && !pinnedTabIds.includes(id)),
  ], [tabs, pinnedTabIds]);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };
  const exportTable = (service = activeService) => {
    if (!service) return;
    const model = getTableModel(service);
    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = [model.columns.filter((column) => column !== "Eylemler"), ...model.rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${service.id}-kayitlari.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify("CSV dosyası indirildi");
  };
  const handleAppAction = (event: React.MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button || button.closest(".main-nav, .workspace-tabs, .command-popover, .filter-dropdown, .catalog-tabs, .group-grid, .recent-grid, .work-list, .data-panel, .self-managed-view")) return;
    const label = (button.getAttribute("aria-label") || button.textContent || "").trim().replace(/\s+/g, " ");
    if (!label) return;
    if (/^(Yeni görev|Bileşen ekle|Adım ekle)$/.test(label) || /^(Yeni |.* (ekle|oluştur)$)/.test(label)) {
      event.stopPropagation();
      setActionDialog({ mode: "create", label, serviceId: activeId });
    } else if (/^(Son 30 gün|Görünümü düzenle|Kataloğu düzenle)$/.test(label)) {
      event.stopPropagation();
      setActionDialog({ mode: "filter", label, serviceId: activeId });
    } else if (label === "Sütunlar") {
      event.stopPropagation();
      setActionDialog({ mode: "columns", label, serviceId: activeId });
    } else if (/^(Dışa aktar|İndir)$/.test(label)) {
      event.stopPropagation();
      exportTable();
    } else if (/^(Yenile|Uygula|Yayınla|Önizle|Adımı test et|Veriyi önizle|Tamamlananları görüntüle|Yoklama raporu oluştur|.* alanını incele|Taslaklar)$/.test(label)) {
      notify(`${label} işlemi tamamlandı`);
    } else if (/^(Satır seçenekleri|Seçenekler|Yakınlaştır|Katmanlar|Bildirimler|Hesap ayarları)$/.test(label)) {
      notify(`${label} açıldı`);
    }
  };

  return <div className="navbea-app" data-theme={theme} data-mobile-nav={mobileMenuOpen ? "open" : "closed"} onClickCapture={handleAppAction}>
    <aside className="navigation-shell" onMouseLeave={() => setFlyoutId(null)}>
      <div className="sidebar">
        <button className="brand" aria-label="Ana sayfaya git" onClick={() => openService("home")}><Image className="brand-logo brand-logo-light" src="/logo-icon-light.svg" alt="Navbea" width={26} height={42} priority /><Image className="brand-logo brand-logo-dark" src="/logo-icon-dark.svg" alt="" aria-hidden="true" width={26} height={42} priority /></button>
        <nav className="rail-nav" aria-label="Ana navigasyon">
          <button className={`rail-link ${activeId === "home" ? "active" : ""}`} onClick={() => openService("home")} title="Ana Sayfa"><Home size={20} /><span className="rail-tooltip">Ana Sayfa</span></button>
          <span className="rail-divider" />
          {SIDEBAR_TREE.map((node, index) => { const RailIcon = node.icon; const active = activeRootId === node.id; return <button key={node.id} className={`rail-link rail-tone-${index % 6} ${active ? "active" : ""} ${flyoutId === node.id ? "open" : ""}`} aria-expanded={flyoutId === node.id} aria-controls="navigation-flyout" onMouseEnter={() => setFlyoutId(node.id)} onFocus={() => setFlyoutId(node.id)} onClick={() => setFlyoutId((current) => current === node.id ? null : node.id)} title={node.label}><RailIcon size={20} /><span className="rail-tooltip">{node.label}</span>{node.id === "monitoring" ? <i className="rail-live-dot" /> : null}</button>; })}
        </nav>
        <div className="rail-bottom"><button className={`rail-link rail-marketplace ${activeId === "marketplace" ? "active" : ""}`} onClick={() => openService("marketplace")} title="Marketplace"><Store size={20} /><span className="rail-tooltip">Marketplace</span><i className="marketplace-dot" /></button><button className={`rail-link ${activeId === "wizard" ? "active" : ""}`} onClick={() => openService("wizard")} title="Kurulum Sihirbazı"><Sparkles size={20} /><span className="rail-tooltip">Kurulum Sihirbazı</span></button><button className="rail-avatar" aria-label="Hesap ayarları" title="Admin hesabı">AS</button></div>
      </div>
      {flyoutNode ? <section className="nav-flyout" id="navigation-flyout" aria-label={`${flyoutNode.label} menüsü`}><div className="flyout-heading"><span className={`flyout-group-icon ${getGroupColor(SERVICES.find((service) => nodeContainsService(flyoutNode, service.id))?.group ?? "İzleme")}`}><flyoutNode.icon size={20} /></span><div><small>ÇALIŞMA ALANI</small><h2>{flyoutNode.label}</h2></div><IconButton label="Menüyü kapat" onClick={() => setFlyoutId(null)}><X size={16} /></IconButton></div><div className="flyout-tree">{flyoutNode.children?.map((child) => <SidebarTreeItem key={child.id} node={child} level={0} activeId={activeId} expandedNodes={expandedNodes} toggleNode={toggleNode} openService={openService} />)}</div><button className="flyout-directory" onClick={() => openCatalog()}><Grid2X2 size={16} /> Tüm modülleri görüntüle <ChevronRight size={15} /></button></section> : null}
    </aside>
    <button className="sidebar-backdrop" aria-label="Menüyü kapat" onClick={() => setMobileMenuOpen(false)} />

    <main className="app-shell">
      <header className="topbar"><IconButton label="Mobil menü" onClick={() => { setMobileMenuOpen(true); setFlyoutId(activeRootId ?? "monitoring"); }}><Menu size={19} /></IconButton><button className="global-search" onClick={() => setPaletteOpen(true)}><Search size={18} /><span>Sayfa, kişi, cihaz veya rapor ara…</span><kbd>⌘ K</kbd></button><div className="top-actions"><StatusPill tone="success">Bağlantı aktif</StatusPill><IconButton label="Bildirimler"><Bell size={19} /><span className="notification-dot">3</span></IconButton><IconButton label={theme === "light" ? "Koyu moda geç" : "Açık moda geç"} onClick={() => setTheme((value) => value === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={19} /> : <Sun size={19} />}</IconButton><div className="top-user"><span className="avatar">AS</span><span><strong>Admin</strong><small>{WORKSPACE_NAME}</small></span></div></div></header>
      <div className="workspace-tabs" role="tablist" aria-label="Açık çalışma sekmeleri">{orderedTabs.map((id) => { const TabIcon = getIcon(id); const pinned = pinnedTabIds.includes(id); return <div className={`workspace-tab ${activeId === id ? "active" : ""} ${pinned ? "pinned" : ""}`} key={id}><button className="tab-main" role="tab" aria-selected={activeId === id} onClick={() => setActiveId(id)}><TabIcon size={15} /><span>{getLabel(id)}</span></button>{id !== "home" ? <><button className="tab-pin" aria-label={pinned ? `${getLabel(id)} sekmesinin sabitlemesini kaldır` : `${getLabel(id)} sekmesini sabitle`} aria-pressed={pinned} title={pinned ? "Sabitlemeyi kaldır" : "Sekmeyi sabitle"} onClick={() => toggleTabPin(id)}><Pin size={12} /></button><button className="tab-close" aria-label={`${getLabel(id)} sekmesini kapat`} onClick={() => closeTab(id)}><X size={13} /></button></> : null}</div>; })}<button className="new-tab" aria-label="Modül dizinini aç" onClick={() => openCatalog()}><Plus size={15} /></button></div>
      <div className="content-area">{activeId === "home" ? <HomeView openService={openService} openCatalog={openCatalog} recentIds={recentIds} /> : activeId === "catalog" ? <CatalogView activeGroup={catalogGroup} setActiveGroup={setCatalogGroup} openService={openService} /> : activeId === "marketplace" ? <MarketplaceView onOpenService={openService} onNotice={notify} /> : activeService ? <ServiceView service={activeService} onColumns={() => setActionDialog({ mode: "columns", label: "Sütunlar", serviceId: activeService.id })} onExport={() => exportTable(activeService)} onNotice={notify} /> : null}</div>
    </main>
    {paletteOpen ? <CommandPalette close={() => setPaletteOpen(false)} openService={openService} openCatalog={() => openCatalog()} /> : null}
    {actionDialog ? <ActionDialog state={actionDialog} close={() => setActionDialog(null)} confirm={(message) => { setActionDialog(null); notify(message); }} /> : null}
    {toast ? <div className="app-toast" role="status"><CheckCircle2 size={17} />{toast}</div> : null}
  </div>;
}
