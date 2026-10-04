import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import type { Coordinates } from '../domain/types';
import { colors, touchTarget } from '../theme';
import type { SubjectiveMapProps } from './mapTypes';

/**
 * Native (Expo Go) subjective map: an owned, static ink drawing with projected
 * Passage points. No map SDK or tiles; external apps handle navigation.
 * Replace the drawn ground with the approved Figma export in assets/figma/ when available.
 */
export function SubjectiveMap({ passages, selectedId, flaneur, trace = [], onSelect, center }: SubjectiveMapProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const project = useMemo(() => {
    const points: Coordinates[] = [...passages.map((p) => p.coordinates), ...trace];
    if (flaneur) points.push(flaneur);
    if (points.length === 0) points.push(center);
    return createProjection(points, size.width, size.height);
  }, [passages, trace, flaneur, center, size]);

  const traceLine = trace.map((c) => project(c)).map((p) => `${p.x},${p.y}`).join(' ');
  const me = flaneur ? project(flaneur) : null;

  return (
    <View style={styles.root} onLayout={onLayout}>
      {size.width > 0 && (
        <>
          <Svg width={size.width} height={size.height} accessible={false}>
            <Rect width={size.width} height={size.height} fill={colors.paper} />
            {groundLines(size.width, size.height).map((d, i) => (
              <Path key={i} d={d} stroke={colors.line} strokeWidth={1} fill="none" />
            ))}
            {trace.length > 1 && (
              <Polyline
                points={traceLine}
                stroke={colors.trace}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
            {me && (
              <>
                <Circle cx={me.x} cy={me.y} r={14} fill={colors.flaneur} opacity={0.14} />
                <Circle cx={me.x} cy={me.y} r={5} fill={colors.flaneur} />
              </>
            )}
          </Svg>
          {passages.map((passage) => {
            const point = project(passage.coordinates);
            const selected = passage.id === selectedId;
            return (
              <Pressable
                key={passage.id}
                onPress={() => onSelect(passage.id)}
                accessibilityRole="button"
                accessibilityLabel={`Passage ${passage.name}, ${passage.zone}`}
                accessibilityState={{ selected }}
                style={[styles.marker, { left: point.x - touchTarget / 2, top: point.y - touchTarget / 2 }]}
              >
                <View style={[styles.dot, selected && styles.dotSelected]} />
              </Pressable>
            );
          })}
        </>
      )}
    </View>
  );
}

/** Equirectangular projection fitted to the view with padding. */
function createProjection(points: Coordinates[], width: number, height: number) {
  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const midLat = (minLat + maxLat) / 2;
  const lonScale = Math.cos((midLat * Math.PI) / 180);
  const spanX = Math.max((maxLon - minLon) * lonScale, 0.004);
  const spanY = Math.max(maxLat - minLat, 0.004);
  const pad = 56;
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
  const cx = (minLon + maxLon) / 2;
  const cy = midLat;
  return (c: Coordinates) => ({
    x: width / 2 + (c.longitude - cx) * lonScale * scale,
    y: height / 2 - (c.latitude - cy) * scale,
  });
}

/** Quiet, deterministic ground strokes: contours rather than administrative lines. */
function groundLines(width: number, height: number): string[] {
  const lines: string[] = [];
  for (let i = 1; i <= 6; i += 1) {
    const y = (height / 7) * i;
    const amp = 10 + i * 3;
    lines.push(
      `M0 ${y} C ${width * 0.3} ${y - amp}, ${width * 0.6} ${y + amp}, ${width} ${y - amp / 2}`,
    );
  }
  return lines;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper, overflow: 'hidden' },
  marker: {
    position: 'absolute',
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  dotSelected: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.ink },
});
