import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TabKey } from '../domain/types';
import { colors, touchTarget } from '../theme';

const tabs: { key: TabKey; label: string; a11y: string }[] = [
  { key: 'derive', label: '돌아보기', a11y: '돌아보기, 일곱 걸음의 회고' },
  { key: 'map', label: '지도', a11y: '커리어 지도' },
  { key: 'archive', label: '발견', a11y: '발견, 다른 사람들이 헤맨 장면' },
  { key: 'trace', label: '나의 길', a11y: '나의 길, 남긴 Tracé와 저장한 장면' },
];

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  inProgress: boolean;
  bottomInset: number;
};

export function TabBar({ active, onChange, inProgress, bottomInset }: Props) {
  return (
    <View accessibilityRole="tablist" style={[styles.bar, { paddingBottom: Math.max(bottomInset, 8) }]}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        const showDot = tab.key === 'derive' && inProgress;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={showDot ? `${tab.a11y}, 진행 중` : tab.a11y}
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.key)}
            style={styles.tab}
          >
            <View style={styles.labelRow}>
              <Text style={[styles.label, selected && styles.labelActive]}>{tab.label}</Text>
              {showDot && <View style={styles.dot} />}
            </View>
            <View style={[styles.underline, selected && styles.underlineActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    backgroundColor: colors.ground,
    paddingTop: 4,
  },
  tab: { flex: 1, minHeight: touchTarget + 8, alignItems: 'center', justifyContent: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 13, color: colors.muted },
  labelActive: { color: colors.ink, fontWeight: '600' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lamp, marginLeft: 6 },
  underline: { marginTop: 6, height: 1, width: 18, backgroundColor: 'transparent' },
  underlineActive: { backgroundColor: colors.ink },
});
