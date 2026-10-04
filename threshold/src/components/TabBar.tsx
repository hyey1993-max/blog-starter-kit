import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TabKey } from '../domain/types';
import { colors, fonts, touchTarget } from '../theme';

/** Visible labels follow the approved Figma design; keys are domain states. */
const tabs: { key: TabKey; label: string; a11y: string }[] = [
  { key: 'derive', label: 'WALK', a11y: 'Dérive, 산책' },
  { key: 'map', label: 'MAP', a11y: '지도' },
  { key: 'archive', label: 'DISCOVER', a11y: 'Archive, 발견' },
  { key: 'trace', label: 'MY', a11y: '나의 Tracé와 저장한 Passage' },
];

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  driftingIndicator: boolean;
  bottomInset: number;
};

export function TabBar({ active, onChange, driftingIndicator, bottomInset }: Props) {
  return (
    <View accessibilityRole="tablist" style={[styles.bar, { paddingBottom: Math.max(bottomInset, 8) }]}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        const showDot = tab.key === 'derive' && driftingIndicator;
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
    borderTopColor: colors.line,
    backgroundColor: colors.paper,
    paddingTop: 4,
  },
  tab: { flex: 1, minHeight: touchTarget + 8, alignItems: 'center', justifyContent: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontFamily: fonts.sansMedium, fontSize: 12, letterSpacing: 1.6, color: colors.muted },
  labelActive: { color: colors.ink },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.flaneur, marginLeft: 6 },
  underline: { marginTop: 6, height: 1, width: 18, backgroundColor: 'transparent' },
  underlineActive: { backgroundColor: colors.ink },
});
