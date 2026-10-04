import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, Line, Path, RadialGradient, Stop } from 'react-native-svg';
import { threadOrder, threads } from '../domain/threads';
import type { PassageWithAffinity, ReflectionAnswers } from '../domain/types';
import { passagePoint, threadAnchors, wanderingFog, type Point } from '../lib/terrain';
import { colors, touchTarget } from '../theme';

type Props = {
  passages: PassageWithAffinity[];
  selectedId: string | null;
  reflection: ReflectionAnswers | null;
  onSelect: (id: string) => void;
};

/**
 * A quiet career terrain. Zones are Threads, not job titles or industries.
 * The Flâneur appears as a lamp-lit fog, never as a precise point.
 */
export function CareerMap({ passages, selectedId, reflection, onSelect }: Props) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => setBox(e.nativeEvent.layout);

  const size = Math.min(box.width, box.height);
  const ox = (box.width - size) / 2;
  const oy = (box.height - size) / 2;
  const at = (p: Point) => ({ x: ox + p.x * size, y: oy + p.y * size });

  const fog = wanderingFog(reflection);
  const selected = passages.find((p) => p.id === selectedId) ?? null;

  return (
    <View style={styles.root} onLayout={onLayout}>
      {size > 0 && (
        <>
          <Svg width={box.width} height={box.height} accessible={false}>
            <Defs>
              <RadialGradient id="fog" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.lamp} stopOpacity={0.42} />
                <Stop offset="0.7" stopColor={colors.lamp} stopOpacity={0.12} />
                <Stop offset="1" stopColor={colors.lamp} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            {threadOrder.map((id) => {
              const c = at(threadAnchors[id]);
              return (
                <Circle
                  key={id}
                  cx={c.x}
                  cy={c.y}
                  r={size * 0.13}
                  fill="none"
                  stroke={colors.hairline}
                  strokeWidth={1}
                  strokeDasharray="2 6"
                />
              );
            })}
            {fog && (
              <>
                <Circle cx={at(fog.center).x} cy={at(fog.center).y} r={fog.radius * size} fill="url(#fog)" />
                <Path
                  d={wanderPath(at(fog.center), fog.radius * size * 0.55)}
                  stroke={colors.ink}
                  strokeWidth={1}
                  strokeLinecap="round"
                  strokeDasharray="1 5"
                  opacity={0.6}
                  fill="none"
                />
              </>
            )}
            {selected &&
              selected.threads.map((t) => {
                const a = at(passagePoint(selected));
                const b = at(threadAnchors[t]);
                return <Line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors.ink} strokeWidth={0.75} opacity={0.5} />;
              })}
          </Svg>

          {threadOrder.map((id) => {
            const c = at(threadAnchors[id]);
            return (
              <Text key={id} style={[styles.zone, { left: c.x - 60, top: c.y - 9 }]} accessible={false}>
                {threads[id].short}
              </Text>
            );
          })}

          {fog && (
            <Text
              style={[styles.fogLabel, { left: at(fog.center).x - 60, top: at(fog.center).y + fog.radius * size * 0.6 }]}
              accessibilityLabel="나의 위치: 헤매는 중"
            >
              헤매는 중
            </Text>
          )}

          {passages.map((p) => {
            const c = at(passagePoint(p));
            const isSelected = p.id === selectedId;
            return (
              <Pressable
                key={p.id}
                onPress={() => onSelect(p.id)}
                accessibilityRole="button"
                accessibilityLabel={`장면 ${p.title}`}
                accessibilityState={{ selected: isSelected }}
                style={[styles.marker, { left: c.x - touchTarget / 2, top: c.y - touchTarget / 2 }]}
              >
                <View style={[styles.dot, isSelected && styles.dotSelected, p.stillWandering && !isSelected && styles.dotOpen]} />
              </Pressable>
            );
          })}
        </>
      )}
    </View>
  );
}

/** A soft, unclosed drifting loop: wandering, not arriving. */
function wanderPath(c: Point, r: number): string {
  const steps = 14;
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const a = (i / steps) * Math.PI * 2.6 + 0.4;
    const rr = r * (0.55 + 0.3 * Math.sin(i * 1.7));
    return { x: c.x + Math.cos(a) * rr, y: c.y + Math.sin(a) * rr * 0.75 };
  });
  let d = `M${pts[0]!.x.toFixed(1)} ${pts[0]!.y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i += 1) {
    const prev = pts[i - 1]!;
    const p = pts[i]!;
    d += ` Q${prev.x.toFixed(1)} ${prev.y.toFixed(1)} ${((prev.x + p.x) / 2).toFixed(1)} ${((prev.y + p.y) / 2).toFixed(1)}`;
  }
  return d;
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  zone: { position: 'absolute', width: 120, textAlign: 'center', fontSize: 12, color: colors.muted },
  fogLabel: { position: 'absolute', width: 120, textAlign: 'center', fontSize: 12, color: colors.lampText, fontWeight: '600' },
  marker: { position: 'absolute', width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.ink },
  dotOpen: { backgroundColor: colors.ground, borderWidth: 1.5, borderColor: colors.ink },
  dotSelected: { width: 17, height: 17, borderRadius: 9, backgroundColor: colors.ink, borderWidth: 3, borderColor: colors.lamp },
});
