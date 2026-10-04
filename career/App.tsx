import { GowunBatang_400Regular } from '@expo-google-fonts/gowun-batang/400Regular';
import { GowunBatang_700Bold } from '@expo-google-fonts/gowun-batang/700Bold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PassageDetailSheet } from './src/components/PassageDetailSheet';
import { TabBar } from './src/components/TabBar';
import { samplePassages } from './src/data/passages';
import type { Passage, TabKey, Trace } from './src/domain/types';
import { useReflection } from './src/hooks/useReflection';
import { track } from './src/lib/analytics';
import { orderBySharedThreads } from './src/lib/terrain';
import { ArchiveScreen } from './src/screens/ArchiveScreen';
import { DeriveScreen } from './src/screens/DeriveScreen';
import { MapScreen } from './src/screens/MapScreen';
import { TraceScreen } from './src/screens/TraceScreen';
import { colors, fonts, space } from './src/theme';

export default function App() {
  const [loaded, error] = useFonts({ GowunBatang_400Regular, GowunBatang_700Bold });
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {loaded || error ? (
        <CareerThreshold />
      ) : (
        <View style={styles.loading} accessibilityLabel="불러오는 중">
          <ActivityIndicator color={colors.ink} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

function CareerThreshold() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('map');
  const reflection = useReflection();
  const [traces, setTraces] = useState<Trace[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => track({ name: 'app_opened' }), []);

  /** The latest kept reflection, or the finished-but-unsaved one, places the Flâneur. */
  const current =
    reflection.state.stage === 'result' ? reflection.state.draft : (traces[0]?.reflection ?? null);
  const passages = useMemo(() => orderBySharedThreads(samplePassages, current), [current]);
  const detail = passages.find((p) => p.id === detailId) ?? null;

  const changeTab = (next: TabKey) => {
    setTab(next);
    track({ name: 'tab_changed', tab: next });
  };

  const openPassage = (source: 'map' | 'archive' | 'trace') => (p: Passage) => {
    setDetailId(p.id);
    track({ name: 'passage_detail_opened', passageId: p.id, source });
  };

  const toggleSave = (id: string) => {
    const saved = !savedIds.includes(id);
    setSavedIds((ids) => (saved ? [...ids, id] : ids.filter((x) => x !== id)));
    track({ name: 'passage_save_toggled', passageId: id, saved });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.wordmark} accessibilityRole="header">
          THE THRESHOLD
        </Text>
        <Text style={styles.edition}>커리어의 지도</Text>
      </View>

      <View style={styles.body}>
        {tab === 'map' && (
          <MapScreen
            passages={passages}
            reflection={current}
            onOpenPassage={openPassage('map')}
            onStartReflection={() => changeTab('derive')}
          />
        )}
        {tab === 'archive' && (
          <ArchiveScreen passages={passages} ordering={current ? 'shared' : 'editorial'} onOpenPassage={openPassage('archive')} />
        )}
        {tab === 'derive' && (
          <DeriveScreen
            reflection={reflection}
            onKeep={(trace) => {
              setTraces((list) => [trace, ...list]);
              changeTab('map');
            }}
          />
        )}
        {tab === 'trace' && (
          <TraceScreen
            traces={traces}
            saved={passages.filter((p) => savedIds.includes(p.id))}
            onOpenPassage={openPassage('trace')}
          />
        )}
      </View>

      <TabBar
        active={tab}
        onChange={changeTab}
        inProgress={reflection.state.stage !== 'intro'}
        bottomInset={insets.bottom}
      />

      <PassageDetailSheet
        passage={detail}
        saved={detail ? savedIds.includes(detail.id) : false}
        onToggleSave={() => detail && toggleSave(detail.id)}
        onClose={() => setDetailId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ground },
  root: { flex: 1, backgroundColor: colors.ground },
  header: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.sm + 2 },
  wordmark: { fontFamily: fonts.serif, fontSize: 16, letterSpacing: 3, color: colors.ink },
  edition: { fontSize: 12, color: colors.muted },
  body: { flex: 1 },
});
