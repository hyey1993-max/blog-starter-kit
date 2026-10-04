import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { PTSerif_400Regular } from '@expo-google-fonts/pt-serif/400Regular';
import { PTSerif_400Regular_Italic } from '@expo-google-fonts/pt-serif/400Regular_Italic';
import { PTSerif_700Bold } from '@expo-google-fonts/pt-serif/700Bold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocationNotice } from './src/components/LocationNotice';
import { NavigationChooser } from './src/components/NavigationChooser';
import { PassageDetailSheet } from './src/components/PassageDetailSheet';
import { TabBar } from './src/components/TabBar';
import { archiveCenter, samplePassages } from './src/data/passages';
import type { Passage, TabKey, Trace } from './src/domain/types';
import { useDerive } from './src/hooks/useDerive';
import { useFlaneurLocation } from './src/hooks/useFlaneurLocation';
import { track } from './src/lib/analytics';
import { orderPassages } from './src/lib/geo';
import { ArchiveScreen } from './src/screens/ArchiveScreen';
import { DeriveScreen } from './src/screens/DeriveScreen';
import { MapScreen } from './src/screens/MapScreen';
import { TraceScreen } from './src/screens/TraceScreen';
import { colors, fonts, space } from './src/theme';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PTSerif_400Regular,
    PTSerif_400Regular_Italic,
    PTSerif_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {fontsLoaded || fontError ? (
        <Threshold />
      ) : (
        <View style={styles.loading} accessibilityLabel="불러오는 중">
          <ActivityIndicator color={colors.ink} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

function Threshold() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('map');
  const { location, coords, retry } = useFlaneurLocation();
  const derive = useDerive({ locationGranted: location.status === 'granted', lastKnown: coords });
  const [traces, setTraces] = useState<Trace[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [navigating, setNavigating] = useState<Passage | null>(null);

  useEffect(() => track({ name: 'app_opened' }), []);

  const passages = useMemo(() => orderPassages(samplePassages, coords), [coords]);
  const center = coords ?? archiveCenter;
  const detail = passages.find((p) => p.id === detailId) ?? null;

  const changeTab = (next: TabKey) => {
    setTab(next);
    track({ name: 'tab_changed', tab: next });
  };

  const openPassage = (source: 'map' | 'archive' | 'trace') => (passage: Passage) => {
    setDetailId(passage.id);
    track({ name: 'passage_detail_opened', passageId: passage.id, source });
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
      </View>
      <LocationNotice location={location} onRetry={() => void retry()} />

      <View style={styles.body}>
        {tab === 'map' && (
          <MapScreen passages={passages} flaneur={coords} center={center} onOpenPassage={openPassage('map')} />
        )}
        {tab === 'archive' && (
          <ArchiveScreen
            passages={passages}
            ordering={coords ? 'proximity' : 'editorial'}
            onOpenPassage={openPassage('archive')}
          />
        )}
        {tab === 'derive' && (
          <DeriveScreen
            derive={derive}
            passages={passages}
            flaneur={coords}
            center={center}
            locationGranted={location.status === 'granted'}
            onArchive={(trace) => {
              setTraces((list) => [trace, ...list]);
              changeTab('trace');
            }}
          />
        )}
        {tab === 'trace' && (
          <TraceScreen
            traces={traces}
            saved={passages.filter((p) => savedIds.includes(p.id))}
            center={center}
            onOpenPassage={openPassage('trace')}
          />
        )}
      </View>

      <TabBar
        active={tab}
        onChange={changeTab}
        driftingIndicator={derive.state.stage !== 'idle'}
        bottomInset={insets.bottom}
      />

      <PassageDetailSheet
        passage={detail}
        saved={detail ? savedIds.includes(detail.id) : false}
        onToggleSave={() => detail && toggleSave(detail.id)}
        onNavigate={() => {
          if (!detail) return;
          track({ name: 'navigation_chooser_opened', passageId: detail.id });
          setDetailId(null);
          setNavigating(detail);
        }}
        onClose={() => setDetailId(null)}
      />
      <NavigationChooser passage={navigating} origin={coords} onClose={() => setNavigating(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  root: { flex: 1, backgroundColor: colors.paper },
  header: { paddingHorizontal: space.lg, paddingVertical: space.sm + 2 },
  wordmark: { fontFamily: fonts.serif, fontSize: 17, letterSpacing: 3, color: colors.ink },
  body: { flex: 1 },
});
