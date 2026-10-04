import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import { colors } from '../theme';
import type { SubjectiveMapProps } from './mapTypes';

// Development default only. Production uses owned/contracted tiles via env, without an app release.
const TILE_URL = process.env.EXPO_PUBLIC_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = process.env.EXPO_PUBLIC_TILE_ATTRIBUTION ?? '&copy; OpenStreetMap contributors';

function passageIcon(selected: boolean) {
  const size = selected ? 18 : 12;
  return L.divIcon({
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `<span style="display:flex;width:44px;height:44px;align-items:center;justify-content:center"><span style="width:${size}px;height:${size}px;border-radius:50%;border:2px solid ${colors.ink};background:${selected ? colors.ink : colors.paper};box-sizing:border-box"></span></span>`,
  });
}

/** Fits once framing points first appear, then preserves the Flâneur's own pan/zoom. */
function FitOnce({ points }: { points: [number, number][] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || points.length < 2) return;
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 17 });
    fitted.current = true;
  }, [map, points]);
  return null;
}

/** Expo Web map: Leaflet raster tiles as a quiet spatial canvas. */
export function SubjectiveMap({ passages, selectedId, flaneur, trace = [], onSelect, center }: SubjectiveMapProps) {
  const framing = useMemo<[number, number][]>(() => {
    const points = passages.map((p) => [p.coordinates.latitude, p.coordinates.longitude] as [number, number]);
    if (flaneur) points.push([flaneur.latitude, flaneur.longitude]);
    for (const c of trace) points.push([c.latitude, c.longitude]);
    return points;
  }, [passages, flaneur, trace]);

  return (
    <div className="threshold-map" style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex' }}>
      {/* Quiet the tiles only; Passage, Flâneur and Tracé marks keep their ink. */}
      <style>{'.threshold-map .leaflet-tile-pane{filter:grayscale(0.85) sepia(0.12) opacity(0.8)}'}</style>
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={14}
        style={{ flex: 1, background: colors.paper }}
        zoomControl={false}
        attributionControl
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <FitOnce points={framing} />
        {trace.length > 1 && (
          <Polyline
            positions={trace.map((c) => [c.latitude, c.longitude] as [number, number])}
            pathOptions={{ color: colors.trace, weight: 3, lineCap: 'round' }}
          />
        )}
        {flaneur && (
          <CircleMarker
            center={[flaneur.latitude, flaneur.longitude]}
            radius={6}
            pathOptions={{ color: colors.flaneur, fillColor: colors.flaneur, fillOpacity: 1, weight: 8, opacity: 0.18 }}
          />
        )}
        {passages.map((passage) => (
          <Marker
            key={passage.id}
            position={[passage.coordinates.latitude, passage.coordinates.longitude]}
            icon={passageIcon(passage.id === selectedId)}
            title={`Passage ${passage.name}, ${passage.zone}`}
            alt={`Passage ${passage.name}`}
            keyboard
            eventHandlers={{ click: () => onSelect(passage.id) }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
