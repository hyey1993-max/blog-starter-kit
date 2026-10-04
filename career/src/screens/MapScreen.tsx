import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { CareerMap } from '../components/CareerMap';
import { PassageCard } from '../components/PassageCard';
import { threads } from '../domain/threads';
import type { PassageWithAffinity, ReflectionAnswers, ThreadId } from '../domain/types';
import { track } from '../lib/analytics';
import { joinKo } from '../lib/korean';
import { colors, fonts, space } from '../theme';

type Props = {
  passages: PassageWithAffinity[];
  reflection: ReflectionAnswers | null;
  onOpenPassage: (passage: PassageWithAffinity) => void;
  onStartReflection: () => void;
};

export function MapScreen({ passages, reflection, onOpenPassage, onStartReflection }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(passages[0]?.id ?? null);
  const selected = passages.find((p) => p.id === selectedId) ?? passages[0] ?? null;
  const mine = (reflection?.answers.thread.selected ?? []) as ThreadId[];

  const select = (id: string) => {
    setSelectedId(id);
    track({ name: 'passage_marker_selected', passageId: id });
  };

  return (
    <View style={styles.root}>
      <View style={styles.status} accessibilityLiveRegion="polite">
        {reflection ? (
          <Text style={styles.statusText}>
            <Text style={styles.wandering}>헤매는 중 · </Text>
            {mine.length
              ? `${joinKo(mine.map((t) => threads[t].short))} 사이 어딘가`
              : '되풀이해 온 일을 아직 고르지 않았어요'}
          </Text>
        ) : (
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, styles.flex]}>아직 지도 위에 내가 없어요. 돌아보기를 하면 흐릿하게 나타나요.</Text>
            <Button label="돌아보기" variant="quiet" onPress={onStartReflection} />
          </View>
        )}
      </View>
      <CareerMap passages={passages} selectedId={selected?.id ?? null} reflection={reflection} onSelect={select} />
      <View style={styles.legend} accessible={false}>
        <Text style={styles.legendText}>● 길을 찾은 장면   ○ 지금도 헤매는 중인 장면</Text>
      </View>
      <View style={styles.card}>
        {selected ? (
          <PassageCard passage={selected} onOpen={() => onOpenPassage(selected)} />
        ) : (
          <Text style={styles.statusText}>아직 기록된 장면이 없어요.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  status: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    minHeight: 48,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
  statusText: { fontSize: 14, lineHeight: 21, color: colors.muted },
  wandering: { color: colors.lampText, fontWeight: '600' },
  legend: { paddingHorizontal: space.lg },
  legendText: { fontSize: 12, color: colors.muted },
  card: { padding: space.md },
});
