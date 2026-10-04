import { StyleSheet, Text, View } from 'react-native';
import { seuilLabels, threads } from '../domain/threads';
import type { PassageWithAffinity } from '../domain/types';
import { colors, fonts, space } from '../theme';
import { Button } from './Button';
import { Sheet } from './Sheet';

type Props = {
  passage: PassageWithAffinity | null;
  saved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
};

export function PassageDetailSheet({ passage, saved, onToggleSave, onClose }: Props) {
  if (!passage) return null;
  const seuil = seuilLabels[passage.seuil];
  return (
    <Sheet
      visible
      onClose={onClose}
      title={passage.title}
      footer={
        <Button
          label={saved ? '나의 길에 담김 · 해제하기' : '나의 길에 담기'}
          variant={saved ? 'quiet' : 'primary'}
          onPress={onToggleSave}
          accessibilityHint="이 기기의 현재 세션에만 저장됩니다"
        />
      }
    >
      <Text style={styles.kicker}>
        {seuil.label} — {seuil.description}
      </Text>
      {passage.stillWandering && (
        <Text style={styles.wandering}>이 사람은 지금도 헤매는 중이에요. 이 장면은 답이 아니라 길 위의 한 지점이에요.</Text>
      )}
      {passage.isSample && <Text style={styles.sample}>샘플 장면 · 실제 사람이 쓴 기록으로 교체될 내용이에요.</Text>}

      <Text style={styles.moment}>{passage.moment}</Text>
      <Text style={styles.narrator}>— {passage.narrator}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>거쳐 온 곳</Text>
        <Text style={styles.value}>{passage.stations.join('  —  ')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>되풀이해 온 일</Text>
        {passage.threads.map((t) => (
          <Text key={t} style={[styles.value, passage.sharedThreads.includes(t) && styles.sharedValue]}>
            {threads[t].echo}
            {passage.sharedThreads.includes(t) ? '  · 나와 겹쳐요' : ''}
          </Text>
        ))}
      </View>

      <View style={styles.carry}>
        <Text style={styles.label}>가져갈 질문</Text>
        <Text style={styles.carryText}>{passage.carry}</Text>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: 13, color: colors.muted },
  wandering: { fontSize: 14, lineHeight: 21, color: colors.lampText, marginTop: space.md },
  sample: { fontSize: 12, color: colors.muted, backgroundColor: colors.ground, padding: space.sm, marginTop: space.md },
  moment: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 32, color: colors.ink, marginTop: space.lg },
  narrator: { fontFamily: fonts.serif, fontSize: 14, color: colors.muted, marginTop: space.sm },
  section: { marginTop: space.lg, gap: space.xs },
  label: { fontSize: 12, color: colors.muted },
  value: { fontSize: 15, lineHeight: 22, color: colors.ink },
  sharedValue: { color: colors.lampText },
  carry: { marginTop: space.lg, gap: space.xs, borderLeftWidth: 1, borderLeftColor: colors.hairline, paddingLeft: space.md },
  carryText: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 28, color: colors.ink },
});
