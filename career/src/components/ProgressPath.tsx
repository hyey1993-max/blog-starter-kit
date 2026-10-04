import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';

/** A dotted path ahead and a walked line behind, as in 돌아보는 길. */
export function ProgressPath({ done, total }: { done: number; total: number }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const y = (i: number) => 22 + Math.sin(i * 1.1) * 8;
  const x = (i: number) => 8 + (i / total) * (width - 16);
  const d = (from: number, to: number) => {
    let s = `M${x(from)} ${y(from)}`;
    for (let i = from + 1; i <= to; i += 1) {
      const mx = (x(i - 1) + x(i)) / 2;
      s += ` C${mx} ${y(i - 1)}, ${mx} ${y(i)}, ${x(i)} ${y(i)}`;
    }
    return s;
  };
  return (
    <View
      style={styles.root}
      onLayout={onLayout}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`진행 상황: ${total}단계 중 ${done}단계 완료`}
    >
      {width > 0 && (
        <Svg width={width} height={44}>
          <Path d={d(0, total)} stroke={colors.hairline} strokeWidth={1} strokeDasharray="2 6" fill="none" />
          {done > 0 && <Path d={d(0, done)} stroke={colors.ink} strokeWidth={1.25} strokeLinecap="round" fill="none" />}
          <Circle cx={x(done)} cy={y(done)} r={3.5} fill={colors.ink} />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ root: { height: 44 } });
