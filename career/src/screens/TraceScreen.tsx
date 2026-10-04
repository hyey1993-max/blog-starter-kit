import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Letter } from '../components/Letter';
import { PassageCard } from '../components/PassageCard';
import { Sheet } from '../components/Sheet';
import { threads } from '../domain/threads';
import type { PassageWithAffinity, ThreadId, Trace } from '../domain/types';
import { colors, fonts, space, touchTarget } from '../theme';

type Props = {
  traces: Trace[];
  saved: PassageWithAffinity[];
  onOpenPassage: (passage: PassageWithAffinity) => void;
};

const dateLabel = (ms: number) =>
  new Date(ms).toLocaleString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' });

/** 나의 길: kept reflections and saved moments (session-only in Phase 1). */
export function TraceScreen({ traces, saved, onOpenPassage }: Props) {
  const [open, setOpen] = useState<Trace | null>(null);
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>남긴 회고</Text>
      {traces.length === 0 ? (
        <Text style={styles.empty}>아직 남긴 회고가 없어요. 돌아보기에서 일곱 걸음을 걸어 보세요.</Text>
      ) : (
        traces.map((trace) => {
          const chosen = trace.reflection.answers.thread.selected as ThreadId[];
          return (
            <Pressable
              key={trace.id}
              onPress={() => setOpen(trace)}
              accessibilityRole="button"
              accessibilityLabel={`${dateLabel(trace.createdAt)}의 회고 열기`}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.rowTitle}>{dateLabel(trace.createdAt)}</Text>
              <Text style={styles.rowMeta} numberOfLines={2}>
                {trace.reflection.stations.join(' — ') || '거쳐 온 곳 없음'}
                {chosen.length ? `  ·  ${chosen.map((t) => threads[t].short).join(', ')}` : ''}
              </Text>
            </Pressable>
          );
        })
      )}

      <Text style={[styles.kicker, styles.gap]}>담아 둔 장면</Text>
      {saved.length === 0 ? (
        <Text style={styles.empty}>담아 둔 장면이 없어요.</Text>
      ) : (
        <View style={styles.saved}>
          {saved.map((p) => (
            <PassageCard key={p.id} passage={p} onOpen={() => onOpenPassage(p)} />
          ))}
        </View>
      )}
      <Text style={styles.fine}>지금은 이 기기의 현재 세션에만 남아요. 계정과 영구 저장은 다음 단계에서 연결돼요.</Text>

      {open && (
        <Sheet visible onClose={() => setOpen(null)} title={dateLabel(open.createdAt)}>
          <Letter reflection={open.reflection} />
        </Sheet>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, paddingTop: space.xl, gap: space.sm, maxWidth: 560, width: '100%', alignSelf: 'center' },
  kicker: { fontSize: 13, color: colors.muted },
  gap: { marginTop: space.lg },
  empty: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 27, color: colors.ink },
  row: {
    minHeight: touchTarget + 16,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    paddingVertical: space.sm,
  },
  rowTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink },
  rowMeta: { fontSize: 13, lineHeight: 20, color: colors.muted, marginTop: 2 },
  saved: { gap: space.sm },
  fine: { fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: space.lg },
});
