import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { PassageCard } from '../components/PassageCard';
import type { PassageWithAffinity } from '../domain/types';
import { track } from '../lib/analytics';
import { colors, space } from '../theme';

type Props = {
  passages: PassageWithAffinity[];
  ordering: 'shared' | 'editorial';
  onOpenPassage: (passage: PassageWithAffinity) => void;
};

/** 발견: one wandering moment at a time. No feed, no ranking. */
export function ArchiveScreen({ passages, ordering, onOpenPassage }: Props) {
  const [index, setIndex] = useState(0);
  const passage = passages[Math.min(index, passages.length - 1)];

  useEffect(() => {
    if (passage) track({ name: 'passage_card_viewed', passageId: passage.id, position: index });
  }, [passage?.id, index]);

  if (!passage) {
    return (
      <View style={styles.empty}>
        <Text style={styles.kicker}>아직 기록된 장면이 없어요.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>
        {ordering === 'shared' ? '나와 겹치는 일이 많은 순서' : '큐레이션 순서'} · {index + 1} / {passages.length}
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
          label="다음 장면"
          variant="secondary"
          disabled={index >= passages.length - 1}
          onPress={() => setIndex((i) => Math.min(passages.length - 1, i + 1))}
          style={styles.control}
        />
      </View>
      <Button label="가져갈 질문 보기" onPress={() => onOpenPassage(passage)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingTop: space.xl, gap: space.md, maxWidth: 560, width: '100%', alignSelf: 'center' },
  kicker: { fontSize: 13, color: colors.muted },
  controls: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  control: { flex: 1, paddingHorizontal: space.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
});
