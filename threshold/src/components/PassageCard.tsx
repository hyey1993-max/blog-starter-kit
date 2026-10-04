import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PassageWithDistance } from '../domain/types';
import { formatDistance } from '../lib/geo';
import { colors, fonts, space } from '../theme';

type Props = {
  passage: PassageWithDistance;
  onOpen: () => void;
  /** Larger editorial layout used by DISCOVER. */
  large?: boolean;
};

export function PassageCard({ passage, onOpen, large }: Props) {
  const distance = formatDistance(passage.distanceMeters);
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${passage.name}, ${passage.zone}, ${distance}`}
      accessibilityHint="Passage 해석을 엽니다"
      style={({ pressed }) => [styles.card, large && styles.cardLarge, pressed && { opacity: 0.85 }]}
    >
      {large && (
        // Placeholder plate until curator images (passage_images) exist.
        <View style={styles.plate} accessible={false}>
          <Text style={styles.plateZone}>{passage.zone}</Text>
          <Text style={styles.plateNote}>이미지 준비 중</Text>
        </View>
      )}
      <View style={styles.meta}>
        <Text style={styles.zone}>{passage.zone.toUpperCase()}</Text>
        <Text style={styles.distance}>{distance}</Text>
      </View>
      <Text style={[styles.name, large && styles.nameLarge]}>{passage.name}</Text>
      <Text style={styles.tags} numberOfLines={1}>
        {passage.contextTags.join('  ·  ')}
      </Text>
      {large && (
        <Text style={styles.excerpt} numberOfLines={3}>
          {passage.observation}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: space.md,
    gap: space.xs,
  },
  cardLarge: { padding: 0, borderWidth: 0, gap: space.sm },
  plate: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.paperDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  plateZone: { fontFamily: fonts.serifItalic, fontSize: 30, color: colors.inkSoft },
  plateNote: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginTop: space.xs },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  zone: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 1.6, color: colors.muted },
  distance: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  name: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 27, color: colors.ink },
  nameLarge: { fontSize: 28, lineHeight: 36 },
  tags: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkSoft },
  excerpt: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 26, color: colors.inkSoft, marginTop: space.xs },
});
