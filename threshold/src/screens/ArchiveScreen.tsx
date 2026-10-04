import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { PassageCard } from '../components/PassageCard';
import type { PassageWithDistance } from '../domain/types';
import { track } from '../lib/analytics';
import { colors, fonts, space } from '../theme';

type Props = {
  passages: PassageWithDistance[];
  ordering: 'proximity' | 'editorial';
  onOpenPassage: (passage: PassageWithDistance) => void;
};

/** DISCOVER: one Passage at a time, no feed. */
export function ArchiveScreen({ passages, ordering, onOpenPassage }: Props) {
  const [index, setIndex] = useState(0);
  const passage = passages[Math.min(index, passages.length - 1)];

  useEffect(() => {
    if (passage) track({ name: 'passage_card_viewed', passageId: passage.id, position: index });
  }, [passage?.id, index]);

  if (!passage) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Archive가 아직 비어 있어요.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>
        {ordering === 'proximity' ? '가까운 순서' : '큐레이션 순서'} · {index + 1} / {passages.length}
      </Text>
      <PassageCard passage={passage} onOpen={() => onOpenPassage(passage)} large />
      <View style={styles.controls}>
        <Button
          label="이전"
          variant="secondary"
          disabled={index === 0}
          onPress={() => setIndex((i) => Math.max(0, i - 1))}
          style={styles.control}
        />
        <Button
          label="다음 Passage"
          variant="secondary"
          disabled={index >= passages.length - 1}
          onPress={() => setIndex((i) => Math.min(passages.length - 1, i + 1))}
          style={styles.control}
        />
      </View>
      <Button label="해석 읽기" onPress={() => onOpenPassage(passage)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md, maxWidth: 560, width: '100%', alignSelf: 'center' },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 1.6, color: colors.muted },
  controls: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  control: { flex: 1, paddingHorizontal: space.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  emptyText: { fontFamily: fonts.serif, fontSize: 18, color: colors.inkSoft },
});
