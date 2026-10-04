import { StyleSheet, Text, View } from 'react-native';
import { seuilLabels } from '../domain/seuil';
import type { PassageWithDistance } from '../domain/types';
import { formatDistance, walkingMinutes } from '../lib/geo';
import { colors, fonts, space } from '../theme';
import { Button } from './Button';
import { Sheet } from './Sheet';

type Props = {
  passage: PassageWithDistance | null;
  saved: boolean;
  onToggleSave: () => void;
  onNavigate: () => void;
  onClose: () => void;
};

export function PassageDetailSheet({ passage, saved, onToggleSave, onNavigate, onClose }: Props) {
  if (!passage) return null;
  const seuil = seuilLabels[passage.seuil];
  const distance =
    passage.distanceMeters === null
      ? '위치를 허용하면 거리를 볼 수 있어요'
      : `직선거리 ${formatDistance(passage.distanceMeters)} · 걸어서 약 ${walkingMinutes(passage.distanceMeters)}분 (추정)`;

  return (
    <Sheet
      visible
      onClose={onClose}
      title={passage.name}
      footer={
        <>
          <Button label="길 찾기" onPress={onNavigate} accessibilityHint="네이버 지도 또는 카카오맵을 고릅니다" />
          <Button
            label={saved ? '저장됨 · 해제하기' : '저장하기'}
            variant="quiet"
            onPress={onToggleSave}
            accessibilityHint="이 기기의 현재 세션에만 저장됩니다"
          />
        </>
      }
    >
      <Text style={styles.zone}>{passage.zone.toUpperCase()}</Text>
      <Text style={styles.distance}>{distance}</Text>

      {passage.isSample && (
        <Text style={styles.sample}>샘플 Passage · 실제 큐레이션으로 교체될 내용이에요.</Text>
      )}

      <Text style={styles.observation}>{passage.observation}</Text>
      <Text style={styles.curator}>— {passage.curator}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>맥락</Text>
        <View style={styles.tags}>
          {passage.contextTags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Seuil</Text>
        <Text style={styles.value}>
          {seuil.label} — {seuil.description}
        </Text>
      </View>

      {(passage.practical.hours || passage.practical.accessibility) && (
        <View style={styles.section}>
          <Text style={styles.label}>알아두면 좋은 것</Text>
          {passage.practical.hours && <Text style={styles.value}>{passage.practical.hours}</Text>}
          {passage.practical.accessibility && <Text style={styles.value}>{passage.practical.accessibility}</Text>}
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  zone: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 1.6, color: colors.muted },
  distance: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: space.xs },
  sample: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.inkSoft,
    backgroundColor: colors.paperDeep,
    padding: space.sm,
    marginTop: space.md,
  },
  observation: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 30, color: colors.ink, marginTop: space.lg },
  curator: { fontFamily: fonts.serifItalic, fontSize: 14, color: colors.inkSoft, marginTop: space.sm },
  section: { marginTop: space.lg, gap: space.xs },
  label: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 1.6, color: colors.muted },
  value: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tag: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
});
