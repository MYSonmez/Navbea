"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type MapMode = "live" | "emergency" | "summary";

type MonitoringMapProps = {
  mode?: MapMode;
  filter?: string;
  selectedArea?: string;
};

const CAMPUS_CENTER: LatLngExpression = [41.0471, 29.0084];

const AREA_CENTERS: Record<string, LatLngExpression> = {
  "Tüm alanlar": CAMPUS_CENTER,
  "A Blok": [41.0482, 29.0068],
  "B Blok": [41.0474, 29.0101],
  "C Blok": [41.0458, 29.0089],
  "D Blok": [41.0468, 29.0052],
};

const entities = [
  { id: "NV-2048", name: "Mustafa Aydın", kind: "Personel", area: "A Blok", position: [41.04825, 29.00675] as LatLngExpression, state: "Hareketli", updated: "12 sn" },
  { id: "NV-2014", name: "Merve Kaya", kind: "Personel", area: "B Blok", position: [41.04775, 29.01035] as LatLngExpression, state: "Sabit", updated: "34 sn" },
  { id: "EQ-0296", name: "Termal Kamera 03", kind: "Ekipman", area: "C Blok", position: [41.0457, 29.00905] as LatLngExpression, state: "Çevrimiçi", updated: "8 sn" },
  { id: "VS-0011", name: "Deniz Akın", kind: "Misafir", area: "A Blok", position: [41.04765, 29.0074] as LatLngExpression, state: "İçeride", updated: "1 dk" },
  { id: "EQ-0187", name: "Forklift 07", kind: "Ekipman", area: "D Blok", position: [41.0464, 29.0049] as LatLngExpression, state: "Düşük pil", updated: "4 dk" },
  { id: "NV-1988", name: "Ahmet Demir", kind: "Personel", area: "C Blok", position: [41.04605, 29.0085] as LatLngExpression, state: "Alarm", updated: "2 dk" },
];

const assemblyZones: LatLngExpression[][] = [
  [[41.0491, 29.0048], [41.04945, 29.0063], [41.0487, 29.00665], [41.04835, 29.0051]],
  [[41.04545, 29.0102], [41.04605, 29.01145], [41.04525, 29.0121], [41.04475, 29.01075]],
];

function MapViewport({ selectedArea }: { selectedArea: string }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(AREA_CENTERS[selectedArea] ?? CAMPUS_CENTER, selectedArea === "Tüm alanlar" ? 16 : 17, { duration: .65 });
  }, [map, selectedArea]);
  return null;
}

function markerColor(kind: string, state: string, mode: MapMode) {
  if (mode === "emergency") return state === "Alarm" || state === "Düşük pil" ? "#e45454" : state === "Sabit" ? "#e49a13" : "#0f9f8f";
  if (state === "Alarm" || state === "Düşük pil") return "#e45454";
  if (kind === "Ekipman") return "#7b61d1";
  if (kind === "Misafir") return "#e49a13";
  return "#285ec9";
}

export default function MonitoringMap({ mode = "live", filter = "Tümü", selectedArea = "Tüm alanlar" }: MonitoringMapProps) {
  const visibleEntities = entities.filter((entity) =>
    (filter === "Tümü" || filter === entity.kind) &&
    (selectedArea === "Tüm alanlar" || selectedArea === entity.area),
  );

  return (
    <MapContainer center={CAMPUS_CENTER} zoom={16} minZoom={14} scrollWheelZoom className="monitoring-leaflet" zoomControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewport selectedArea={selectedArea} />
      {mode === "emergency" ? assemblyZones.map((positions, index) => (
        <Polygon key={index} positions={positions} pathOptions={{ color: "#0f9f8f", fillColor: "#3cc7b4", fillOpacity: .2, weight: 2 }}>
          <Popup>Toplanma alanı {index + 1}</Popup>
        </Polygon>
      )) : null}
      {mode === "emergency" ? (
        <Polyline positions={[[41.04605, 29.0085], [41.047, 29.0074], [41.0487, 29.0058]]} pathOptions={{ color: "#e49a13", weight: 4, dashArray: "8 8" }} />
      ) : null}
      {visibleEntities.map((entity) => {
        const color = markerColor(entity.kind, entity.state, mode);
        return (
          <CircleMarker key={entity.id} center={entity.position} radius={9} pathOptions={{ color: "#fff", fillColor: color, fillOpacity: 1, weight: 3 }}>
            <Popup>
              <strong>{entity.name}</strong><br />
              {entity.kind} · {entity.area}<br />
              {entity.state} · {entity.updated} önce
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
