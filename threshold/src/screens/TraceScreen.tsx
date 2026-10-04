import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ObservationList } from '../components/ObservationList';
import { PassageCard } from '../components/PassageCard';
import { Sheet } from '../components/Sheet';
import { SubjectiveMap } from '../components/SubjectiveMap';
import { TraceStats, traceTitle } from '../components/TraceSummary';
import type { Coordinates, PassageWithDistance, Trace } from '../domain/types';
import { formatDuration } from '../lib/derive';
import { formatDistance } from '../lib/geo';
import { colors, fonts, space, touchTarget } from '../theme';

type Props = {
  traces: Trace[];
  saved: PassageWithDistance[];
  center: Coordinates;
  onOpenPassage: (passage: PassageWithDistance) => void;
};

/** MY tab: the Flâneur's archived Tracés and saved Passages (session-only in Phase 1). */
export function TraceScreen({ traces, saved, center, onOpenPassage }: Props) {
  const [openTrace, setOpenTrace] = useState<Trace | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>TRACÉ</Text>
      {traces.length === 0 ? (
        <Text style={styles.empty}>아직 남긴 Tracé가 없어요. WALK에서 Dérive를 시작해 보세요.</Text>
      ) : (
        traces.map((trace) => (
          <Pressable
            key={trace.id}
            onPress={() => setOpenTrace(trace)}
            accessibilityRole="button"
            accessibilityLabel={`${traceTitle(trace)} Tracé, ${formatDuration(trace.durationSeconds)}, 관찰 ${trace.observations.length}개`}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.rowTitle}>{traceTitle(trace)}</Text>
            <Text style={styles.rowMeta}>
              {formatDuration(trace.durationSeconds)}
              {trace.path.length > 1 ? ` · ${formatDistance(trace.distanceMeters)}` : ''} · 관찰{' '}
              {trace.observations.length}
            </Text>
          </Pressable>
        ))
      )}

      <Text style={[styles.kicker, styles.gap]}>저장한 Passage</Text>
      {saved.length === 0 ? (
        <Text style={styles.empty}>저장한 Passage가 없어요.</Text>
      ) : (
        <View style={styles.saved}>
          {saved.map((passage) => (
            <PassageCard key={passage.id} passage={passage} onOpen={() => onOpenPassage(passage)} />
          ))}
        </View>
      )}
      <Text style={styles.fine}>
        지금은 이 기기의 현재 세션에만 남아요. 계정과 큐레이션 저장은 다음 단계에서 연결돼요.
      </Text>

      {openTrace && (
        <Sheet visible onClose={() => setOpenTrace(null)} title={traceTitle(openTrace)}>
          <TraceStats
            durationSeconds={openTrace.durationSeconds}
            distanceMeters={openTrace.distanceMeters}
            steps={openTrace.stepEstimate}
            hasPath={openTrace.path.length > 1}
          />
          {openTrace.path.length > 1 && (
            <View style={styles.map}>
              <SubjectiveMap
                passages={[]}
                selectedId={null}
                flaneur={null}
                trace={openTrace.path}
                onSelect={() => {}}
                center={center}
              />
            </View>
          )}
          <View style={styles.gap}>
            <ObservationList observations={openTrace.observations} />
          </View>
        </Sheet>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.sm, maxWidth: 560, width: '100%', alignSelf: 'center' },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 1.6, color: colors.muted },
  gap: { marginTop: space.lg },
  empty: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 25, color: colors.inkSoft },
  row: {
    minHeight: touchTarget + 16,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    paddingVertical: space.sm,
  },
  rowTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink },
  rowMeta: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 2 },
  saved: { gap: space.sm },
  map: { height: 220, marginTop: space.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  fine: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: space.lg },
});
