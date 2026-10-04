import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { ObservationList } from '../components/ObservationList';
import { Sheet } from '../components/Sheet';
import { SubjectiveMap } from '../components/SubjectiveMap';
import { TraceStats } from '../components/TraceSummary';
import type { Coordinates, PassageWithDistance, Trace } from '../domain/types';
import type { useDerive } from '../hooks/useDerive';
import { estimateSteps } from '../lib/derive';
import { colors, fonts, space } from '../theme';

type Props = {
  derive: ReturnType<typeof useDerive>;
  passages: PassageWithDistance[];
  flaneur: Coordinates | null;
  center: Coordinates;
  locationGranted: boolean;
  onArchive: (trace: Trace) => void;
};

type Pending = 'finish' | 'discardDrifting' | 'discardReview' | null;

/** WALK tab: Dérive → Tracé. */
export function DeriveScreen({ derive, passages, flaneur, center, locationGranted, onArchive }: Props) {
  const { state } = derive;
  const [pending, setPending] = useState<Pending>(null);
  const [composing, setComposing] = useState(false);
  const [note, setNote] = useState('');
  const [photoError, setPhotoError] = useState<string | null>(null);

  const addPhoto = async (source: 'camera' | 'library') => {
    setPhotoError(null);
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setPhotoError('카메라 권한이 없어요. 앨범에서 고를 수 있어요.');
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset) derive.addObservation({ kind: 'photo', uri: asset.uri });
    } catch {
      setPhotoError('사진을 가져오지 못했어요. 다시 시도해 주세요.');
    }
  };

  const saveNote = () => {
    const text = note.trim();
    if (text) derive.addObservation({ kind: 'text', text });
    setNote('');
    setComposing(false);
  };

  if (state.stage === 'idle') {
    return (
      <ScrollView contentContainerStyle={styles.intro}>
        <Text style={styles.kicker}>DÉRIVE</Text>
        <Text style={styles.heading}>목적지 없이 걸으며{'\n'}눈에 띈 것을 남겨요.</Text>
        <Text style={styles.body}>
          걸은 길은 Tracé로 남고, 사진과 메모는 그 위에 관찰로 쌓여요. 길 안내는 하지 않아요.
        </Text>
        {!locationGranted && (
          <Text style={styles.notice}>
            위치 권한이 없어 경로와 거리는 기록되지 않아요. 시간과 관찰은 남길 수 있어요.
          </Text>
        )}
        <Button label="Dérive 시작" onPress={derive.start} />
        <Text style={styles.fine}>화면을 켜 둔 동안만 위치를 기록해요. 기록은 이 기기 세션에만 남아요.</Text>
      </ScrollView>
    );
  }

  if (state.stage === 'review') {
    const { trace } = state;
    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.review}>
          <Text style={styles.kicker}>TRACÉ</Text>
          <Text style={styles.heading}>이번 Dérive</Text>
          <TraceStats
            durationSeconds={trace.durationSeconds}
            distanceMeters={trace.distanceMeters}
            steps={trace.stepEstimate}
            hasPath={trace.path.length > 1}
          />
          {trace.path.length > 1 && (
            <View style={styles.reviewMap}>
              <SubjectiveMap passages={[]} selectedId={null} flaneur={null} trace={trace.path} onSelect={() => {}} center={center} />
            </View>
          )}
          <Text style={styles.section}>관찰 {trace.observations.length}</Text>
          <ObservationList observations={trace.observations} />
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label="Tracé 저장"
            onPress={() => {
              const saved = derive.save();
              if (saved) onArchive(saved);
            }}
          />
          <Button label="저장하지 않기" variant="quiet" onPress={() => setPending('discardReview')} />
        </View>
        <ConfirmSheet
          visible={pending === 'discardReview'}
          title="Tracé를 버릴까요?"
          message="저장하지 않으면 이번 Dérive의 경로와 관찰이 사라져요."
          confirmLabel="버리기"
          onConfirm={() => {
            setPending(null);
            derive.discard();
          }}
          onCancel={() => setPending(null)}
        />
      </View>
    );
  }

  // Drifting
  const hasPath = state.path.length > 1;
  return (
    <View style={styles.root}>
      <View style={styles.liveMap}>
        <SubjectiveMap
          passages={passages}
          selectedId={null}
          flaneur={flaneur}
          trace={state.path}
          onSelect={() => {}}
          center={center}
        />
      </View>
      <ScrollView contentContainerStyle={styles.live}>
        <TraceStats
          durationSeconds={derive.elapsedSeconds}
          distanceMeters={derive.liveDistance}
          steps={estimateSteps(derive.liveDistance)}
          hasPath={hasPath}
        />
        {state.gps === 'unavailable' && (
          <Text style={styles.notice}>위치를 받을 수 없어 경로 없이 기록 중이에요.</Text>
        )}
        <View style={styles.actions}>
          <Button label="메모" variant="secondary" onPress={() => setComposing(true)} style={styles.action} />
          {Platform.OS !== 'web' && (
            <Button label="촬영" variant="secondary" onPress={() => void addPhoto('camera')} style={styles.action} />
          )}
          <Button label="사진" variant="secondary" onPress={() => void addPhoto('library')} style={styles.action} />
        </View>
        {photoError && (
          <Text style={styles.error} accessibilityRole="alert">
            {photoError}
          </Text>
        )}
        <ObservationList observations={state.observations} />
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Dérive 마치기" onPress={() => setPending('finish')} />
        <Button label="기록하지 않고 그만두기" variant="quiet" onPress={() => setPending('discardDrifting')} />
      </View>

      <Sheet
        visible={composing}
        onClose={() => setComposing(false)}
        title="무엇이 눈에 띄었나요?"
        footer={<Button label="관찰 남기기" onPress={saveNote} disabled={!note.trim()} />}
      >
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="빛, 소리, 냄새, 사람들의 속도…"
          placeholderTextColor={colors.muted}
          multiline
          autoFocus
          accessibilityLabel="관찰 메모"
          style={styles.input}
        />
      </Sheet>
      <ConfirmSheet
        visible={pending === 'finish'}
        title="Dérive를 마칠까요?"
        message="지금까지의 경로와 관찰로 Tracé를 만들어요. 저장 전에 한 번 더 확인할 수 있어요."
        confirmLabel="마치기"
        onConfirm={() => {
          setPending(null);
          derive.finish();
        }}
        onCancel={() => setPending(null)}
      />
      <ConfirmSheet
        visible={pending === 'discardDrifting'}
        title="기록 없이 그만둘까요?"
        message={`지금까지의 경로와 관찰 ${state.observations.length}개가 저장되지 않고 사라져요.`}
        confirmLabel="그만두기"
        onConfirm={() => {
          setPending(null);
          derive.discard();
        }}
        onCancel={() => setPending(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  intro: { padding: space.lg, paddingTop: space.xl, gap: space.md, maxWidth: 560, width: '100%', alignSelf: 'center' },
  review: { padding: space.lg, gap: space.md, maxWidth: 560, width: '100%', alignSelf: 'center' },
  kicker: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 1.6, color: colors.muted },
  heading: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 38, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 24, color: colors.inkSoft },
  notice: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.inkSoft,
    backgroundColor: colors.paperDeep,
    padding: space.sm,
  },
  fine: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.muted },
  liveMap: { height: '38%', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  reviewMap: { height: 220, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  live: { padding: space.lg, gap: space.md },
  actions: { flexDirection: 'row', gap: space.sm },
  action: { flex: 1, paddingHorizontal: space.sm },
  section: { fontFamily: fonts.sansMedium, fontSize: 11, letterSpacing: 1.6, color: colors.muted, marginTop: space.sm },
  footer: {
    padding: space.md,
    gap: space.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.paper,
  },
  error: { fontFamily: fonts.sans, fontSize: 13, color: colors.flaneur },
  input: {
    minHeight: 120,
    fontFamily: fonts.serif,
    fontSize: 17,
    lineHeight: 26,
    color: colors.ink,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: space.md,
    textAlignVertical: 'top',
  },
});
