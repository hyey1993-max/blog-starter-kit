import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

type Props = { stations: string[]; companions: string[] };

/**
 * The walked path through the Flâneur's stations, with the companion line
 * that walked beside it (from 돌아보는 길's closing figure).
 */
export function PathFigure({ stations, companions }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const height = 150;
  const n = Math.max(stations.length, 2);
  const points = Array.from({ length: n }, (_, i) => ({
    x: 8 + (i / (n - 1)) * (width - 16),
    y: height * 0.55 + Math.sin(i * 1.3) * 18 - i * 4,
  }));
  const line = (offset: number) =>
    points
      .map((p, i) => {
        if (i === 0) return `M${p.x} ${p.y + offset}`;
        const prev = points[i - 1]!;
        const mx = (prev.x + p.x) / 2;
        return `C${mx} ${prev.y + offset}, ${mx} ${p.y + offset}, ${p.x} ${p.y + offset}`;
      })
      .join(' ');
  const companionText = companions.length ? companions.join(' · ') : '곁에 있던 누군가';

  return (
    <View
      style={styles.root}
      onLayout={onLayout}
      accessible
      accessibilityLabel={`거쳐 온 곳: ${stations.join(', ') || '적지 않음'}. 그 옆을 함께 걸어 온 것: ${companionText}`}
    >
      {width > 0 && (
        <>
          <Svg width={width} height={height}>
            <Path d={line(0)} stroke={colors.ink} strokeWidth={1.25} fill="none" strokeLinecap="round" />
            <Path d={line(16)} stroke={colors.lamp} strokeWidth={1.25} fill="none" strokeLinecap="round" opacity={0.75} />
          </Svg>
          {stations.map((name, i) => {
            const p = points[i]!;
            return (
              <View key={`${name}-${i}`} style={[styles.station, { left: p.x - 3, top: p.y - 3 }]}>
                <Text
                  numberOfLines={1}
                  style={[styles.name, i === 0 ? styles.first : i === stations.length - 1 ? styles.last : styles.mid]}
                >
                  {name}
                </Text>
              </View>
            );
          })}
          <Text style={[styles.companion, { top: (points.at(-1)?.y ?? 0) + 26 }]}>곁에 있던 것 · {companionText}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: 170 },
  station: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: colors.ground, borderWidth: 1, borderColor: colors.ink },
  name: { position: 'absolute', bottom: 10, fontSize: 11, color: colors.muted, width: 90 },
  first: { left: -2 },
  mid: { left: -42, textAlign: 'center' },
  last: { right: -2, textAlign: 'right' },
  companion: { position: 'absolute', right: 0, fontSize: 12, color: colors.lampText },
});
