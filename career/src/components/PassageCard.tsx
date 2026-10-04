import { Pressable, StyleSheet, Text, View } from 'react-native';
import { seuilLabels, threads } from '../domain/threads';
import type { PassageWithAffinity } from '../domain/types';
import { colors, fonts, space } from '../theme';

type Props = { passage: PassageWithAffinity; onOpen: () => void; large?: boolean };

export function PassageCard({ passage, onOpen, large }: Props) {
  const seuil = seuilLabels[passage.seuil].label;
  const shared = passage.sharedThreads.length;
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${passage.title}, ${seuil}${passage.stillWandering ? ', 지금도 헤매는 중' : ''}`}
      accessibilityHint="장면 전체를 엽니다"
      style={({ pressed }) => [styles.card, large && styles.cardLarge, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.meta}>
        <Text style={styles.kicker}>
          {seuil}
          {passage.stillWandering ? '  ·  지금도 헤매는 중' : ''}
        </Text>
        {shared > 0 && <Text style={styles.shared}>겹치는 일 {shared}</Text>}
      </View>
      <Text style={[styles.title, large && styles.titleLarge]}>{passage.title}</Text>
      <Text style={styles.threads} numberOfLines={1}>
        {passage.threads.map((t) => threads[t].short).join('  ·  ')}
      </Text>
      {large && (
        <>
          <Text style={styles.moment}>{passage.moment}</Text>
          <Text style={styles.stations}>{passage.stations.join('  —  ')}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.sheet,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    padding: space.md,
    gap: space.xs,
  },
  cardLarge: { backgroundColor: 'transparent', borderWidth: 0, padding: 0, gap: space.sm },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  kicker: { fontSize: 12, color: colors.muted, flexShrink: 1 },
  shared: { fontSize: 12, color: colors.lampText },
  title: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 28, color: colors.ink },
  titleLarge: { fontSize: 28, lineHeight: 40 },
  threads: { fontSize: 13, color: colors.muted },
  moment: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 30, color: colors.ink, marginTop: space.sm },
  stations: { fontSize: 13, color: colors.muted, marginTop: space.xs },
});
