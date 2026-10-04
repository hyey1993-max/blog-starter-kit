import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { ConfirmSheet } from '../components/ConfirmSheet';
import { Letter } from '../components/Letter';
import { ProgressPath } from '../components/ProgressPath';
import { MAX_STATIONS, reflectionIntro, reflectionQuestions } from '../data/reflection';
import type { Trace } from '../domain/types';
import { blockingReason, type useReflection } from '../hooks/useReflection';
import { colors, fonts, space, touchTarget } from '../theme';

type Props = {
  reflection: ReturnType<typeof useReflection>;
  onKeep: (trace: Trace) => void;
};

/** 돌아보기: the reflection Dérive, seven questions without scripture. */
export function DeriveScreen({ reflection, onKeep }: Props) {
  const { state } = reflection;
  const [confirm, setConfirm] = useState<'discard' | null>(null);

  if (state.stage === 'intro') {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.title} accessibilityRole="header">
          {reflectionIntro.title}
        </Text>
        <Text style={styles.subtitle}>{reflectionIntro.subtitle}</Text>
        <Text style={styles.intro}>{reflectionIntro.intro}</Text>
        <Text style={styles.fact}>{reflectionIntro.duration}</Text>
        <Text style={styles.fact}>{reflectionIntro.privacy}</Text>
        <Text style={styles.fact}>다 마치면 커리어 지도 위에 지금의 내가 흐릿한 영역으로 나타나요. 정답 지점은 없어요.</Text>
        <View style={styles.actions}>
          <Button label="시작하기" onPress={reflection.start} />
        </View>
      </ScrollView>
    );
  }

  if (state.stage === 'result') {
    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.page}>
          <Text style={styles.kicker}>돌아본 길</Text>
          <Letter reflection={state.draft} />
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label="나의 길에 남기기"
            onPress={() => {
              const trace = reflection.keep();
              if (trace) onKeep(trace);
            }}
          />
          <Button label="남기지 않기" variant="quiet" onPress={() => setConfirm('discard')} />
        </View>
        <ConfirmSheet
          visible={confirm === 'discard'}
          title="이 회고를 버릴까요?"
          message="남기지 않으면 지금까지의 답이 모두 지워지고, 지도 위의 내 영역도 사라져요."
          confirmLabel="버리기"
          onConfirm={() => {
            setConfirm(null);
            reflection.discard();
          }}
          onCancel={() => setConfirm(null)}
        />
      </View>
    );
  }

  const question = reflectionQuestions[state.step]!;
  const reason = blockingReason(state);
  const answer = state.draft.answers[question.key];
  const done = state.step;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>
          {question.number} / {reflectionQuestions.length}
        </Text>
        {state.stationsStep && question.stations ? (
          <StationsEditor
            question={question.stations.question}
            hint={question.stations.hint}
            stations={state.draft.stations}
            onChange={reflection.setStations}
          />
        ) : (
          <>
            {question.key !== 'recurring' && state.draft.stations.length > 0 && question.number > 4 && (
              <Text style={styles.recap}>거쳐 온 곳 · {state.draft.stations.join('  —  ')}</Text>
            )}
            <Text style={styles.question} accessibilityRole="header">
              {question.question}
            </Text>
            <Text style={styles.hint}>여러 개 골라도 괜찮아요.</Text>
            <View style={styles.choices}>
              {question.options.map((option) => {
                const checked = answer.selected.includes(option.id);
                return (
                  <Choice key={option.id} label={option.label} checked={checked} onPress={() => reflection.toggle(option.id)} />
                );
              })}
              <Choice
                label="직접 적기"
                checked={answer.own !== null}
                onPress={() => reflection.setOwn(answer.own === null ? '' : null)}
              />
              {answer.own !== null && (
                <TextInput
                  value={answer.own}
                  onChangeText={(text) => reflection.setOwn(text)}
                  placeholder="한 줄로 적어 주세요"
                  placeholderTextColor={colors.muted}
                  maxLength={80}
                  autoFocus
                  accessibilityLabel="직접 적은 답"
                  style={styles.lineInput}
                  onSubmitEditing={reflection.next}
                />
              )}
            </View>
          </>
        )}
        <View style={styles.actions}>
          {state.step === 0 && !state.stationsStep ? (
            <Button label="그만두기" variant="quiet" onPress={() => setConfirm('discard')} />
          ) : (
            <Button label="이전" variant="quiet" onPress={reflection.back} />
          )}
          <Button
            label="다음"
            onPress={reflection.next}
            disabled={!!reason}
            accessibilityHint={reason ?? undefined}
          />
        </View>
        <Text style={styles.reason} accessibilityLiveRegion="polite">
          {reason && (answer.selected.length || answer.own !== null || state.stationsStep) ? reason : ''}
        </Text>
      </ScrollView>
      <View style={styles.progress}>
        <ProgressPath done={done} total={reflectionQuestions.length} />
      </View>
      <ConfirmSheet
        visible={confirm === 'discard'}
        title="여기서 그만둘까요?"
        message="지금까지 고른 답이 지워져요."
        confirmLabel="그만두기"
        onConfirm={() => {
          setConfirm(null);
          reflection.discard();
        }}
        onCancel={() => setConfirm(null)}
      />
    </View>
  );
}

function Choice({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={styles.choice}
    >
      <View style={[styles.mark, checked && styles.markChecked]}>{checked && <Text style={styles.check}>✓</Text>}</View>
      <Text style={styles.choiceLabel}>{label}</Text>
    </Pressable>
  );
}

function StationsEditor({
  question,
  hint,
  stations,
  onChange,
}: {
  question: string;
  hint: string;
  stations: string[];
  onChange: (stations: string[]) => void;
}) {
  const list = stations.length ? stations : [''];
  const set = (i: number, value: string) => onChange(list.map((s, j) => (j === i ? value : s)));
  const move = (i: number, by: number) => {
    const next = [...list];
    const [item] = next.splice(i, 1);
    next.splice(i + by, 0, item!);
    onChange(next);
  };
  return (
    <>
      <Text style={styles.question} accessibilityRole="header">
        {question}
      </Text>
      <Text style={styles.hint}>{hint}</Text>
      <View style={styles.stations}>
        {list.map((value, i) => (
          <View key={i} style={styles.station}>
            <Text style={styles.stationNumber}>{i + 1}</Text>
            <TextInput
              value={value}
              onChangeText={(text) => set(i, text)}
              placeholder={i === 0 ? '예: 첫 회사, 전공, 프로젝트' : '그다음 거쳐 온 곳'}
              placeholderTextColor={colors.muted}
              maxLength={30}
              accessibilityLabel={`${i + 1}번째로 거쳐 온 곳`}
              style={[styles.lineInput, styles.stationInput]}
            />
            <View style={styles.tools}>
              <Tool label="위로" onPress={() => move(i, -1)} disabled={i === 0} />
              <Tool label="아래로" onPress={() => move(i, 1)} disabled={i === list.length - 1} />
              <Tool label="삭제" onPress={() => onChange(list.filter((_, j) => j !== i))} disabled={list.length === 1} />
            </View>
          </View>
        ))}
      </View>
      {list.length < MAX_STATIONS ? (
        <Button label="한 곳 더 추가" variant="secondary" onPress={() => onChange([...list, ''])} style={styles.add} />
      ) : (
        <Text style={styles.hint}>일곱 곳을 모두 적었어요.</Text>
      )}
    </>
  );
}

function Tool({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  if (disabled) return <View style={styles.toolSpacer} />;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.tool} hitSlop={4}>
      <Text style={styles.toolText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  page: { padding: space.lg, paddingTop: space.xl, paddingBottom: space.xl, maxWidth: 560, width: '100%', alignSelf: 'center' },
  title: { fontFamily: fonts.serifBold, fontSize: 36, lineHeight: 48, color: colors.ink },
  subtitle: { fontFamily: fonts.serif, fontSize: 16, color: colors.muted, marginTop: space.xs },
  intro: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 36, color: colors.ink, marginTop: space.xl, marginBottom: space.lg },
  fact: { fontSize: 14, lineHeight: 22, color: colors.muted },
  kicker: { fontSize: 13, color: colors.muted, marginBottom: space.md },
  recap: { fontSize: 13, lineHeight: 22, color: colors.muted, marginBottom: space.md },
  question: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 42, color: colors.ink },
  hint: { fontSize: 14, color: colors.muted, marginTop: space.sm },
  choices: { marginTop: space.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  choice: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.md,
    minHeight: touchTarget + 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  mark: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 2,
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markChecked: { backgroundColor: colors.ink, borderColor: colors.ink },
  check: { color: colors.ground, fontSize: 12, lineHeight: 14 },
  choiceLabel: { flex: 1, fontSize: 16, lineHeight: 24, color: colors.ink },
  lineInput: {
    fontSize: 16,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
    paddingVertical: 8,
    marginTop: space.sm,
  },
  stations: { marginTop: space.lg, gap: space.xs },
  station: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  stationNumber: { width: 18, fontSize: 13, color: colors.muted, paddingBottom: 10 },
  stationInput: { flex: 1 },
  tools: { flexDirection: 'row' },
  tool: { minHeight: touchTarget, minWidth: touchTarget, alignItems: 'center', justifyContent: 'center' },
  toolSpacer: { minWidth: touchTarget },
  toolText: { fontSize: 12, color: colors.muted, textDecorationLine: 'underline' },
  add: { marginTop: space.lg, alignSelf: 'flex-start' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space.xl },
  reason: { minHeight: 22, fontSize: 13, color: colors.muted, textAlign: 'right', marginTop: space.sm },
  progress: { paddingHorizontal: space.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  footer: { padding: space.md, gap: space.xs, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
});
