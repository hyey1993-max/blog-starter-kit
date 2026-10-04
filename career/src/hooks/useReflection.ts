import { useCallback, useState } from 'react';
import { MAX_STATIONS, reflectionQuestions } from '../data/reflection';
import type { Answer, QuestionKey, ReflectionAnswers, Trace } from '../domain/types';
import { createId, track } from '../lib/analytics';

export type ReflectionState =
  | { stage: 'intro' }
  | { stage: 'asking'; step: number; stationsStep: boolean; draft: ReflectionAnswers }
  /** Finished but not yet kept: the unsaved state. */
  | { stage: 'result'; draft: ReflectionAnswers };

const emptyAnswer = (): Answer => ({ selected: [], own: null });

function emptyDraft(): ReflectionAnswers {
  const answers = Object.fromEntries(reflectionQuestions.map((q) => [q.key, emptyAnswer()])) as Record<QuestionKey, Answer>;
  return { stations: [''], answers };
}

export const cleanStations = (stations: string[]) => stations.map((s) => s.trim()).filter(Boolean);

/** Why "다음" is unavailable, or null when the step can be completed. */
export function blockingReason(state: ReflectionState): string | null {
  if (state.stage !== 'asking') return null;
  if (state.stationsStep) {
    return cleanStations(state.draft.stations).length ? null : '거쳐 온 곳을 한 곳 이상 적어 주세요.';
  }
  const answer = state.draft.answers[reflectionQuestions[state.step]!.key];
  if (answer.own !== null && !answer.own.trim()) return "'직접 적기' 칸이 비어 있어요. 내용을 적거나 체크를 해제해 주세요.";
  if (!answer.selected.length && !answer.own?.trim()) {
    return "하나 이상 골라 주세요. 맞는 답이 없으면 '직접 적기'에 적어도 돼요.";
  }
  return null;
}

export function useReflection() {
  const [state, setState] = useState<ReflectionState>({ stage: 'intro' });

  const start = useCallback(() => {
    track({ name: 'reflection_started' });
    setState({ stage: 'asking', step: 0, stationsStep: false, draft: emptyDraft() });
  }, []);

  const updateAnswer = useCallback((update: (answer: Answer) => Answer) => {
    setState((s) => {
      if (s.stage !== 'asking' || s.stationsStep) return s;
      const key = reflectionQuestions[s.step]!.key;
      return { ...s, draft: { ...s.draft, answers: { ...s.draft.answers, [key]: update(s.draft.answers[key]) } } };
    });
  }, []);

  const toggle = useCallback(
    (optionId: string) =>
      updateAnswer((a) => ({
        ...a,
        selected: a.selected.includes(optionId) ? a.selected.filter((x) => x !== optionId) : [...a.selected, optionId],
      })),
    [updateAnswer],
  );

  const setOwn = useCallback((own: string | null) => updateAnswer((a) => ({ ...a, own })), [updateAnswer]);

  const setStations = useCallback((stations: string[]) => {
    setState((s) =>
      s.stage === 'asking' ? { ...s, draft: { ...s.draft, stations: stations.slice(0, MAX_STATIONS) } } : s,
    );
  }, []);

  const next = useCallback(() => {
    if (blockingReason(state) || state.stage !== 'asking') return;
    const question = reflectionQuestions[state.step]!;
    if (state.stationsStep) {
      setState({ ...state, stationsStep: false, draft: { ...state.draft, stations: cleanStations(state.draft.stations) } });
      return;
    }
    const answer = state.draft.answers[question.key];
    track({
      name: 'reflection_step_completed',
      step: question.number,
      selectedCount: answer.selected.length,
      usedOwn: !!answer.own?.trim(),
    });
    const draft = answer.own !== null
      ? { ...state.draft, answers: { ...state.draft.answers, [question.key]: { ...answer, own: answer.own.trim() } } }
      : state.draft;
    if (state.step === reflectionQuestions.length - 1) {
      track({
        name: 'reflection_finished',
        stationCount: draft.stations.length,
        threadCount: draft.answers.thread.selected.length + (draft.answers.thread.own ? 1 : 0),
      });
      setState({ stage: 'result', draft });
      return;
    }
    const upcoming = reflectionQuestions[state.step + 1]!;
    setState({ stage: 'asking', step: state.step + 1, stationsStep: !!upcoming.stations, draft });
  }, [state]);

  const back = useCallback(() => {
    setState((s) => {
      if (s.stage !== 'asking') return s;
      const question = reflectionQuestions[s.step]!;
      if (!s.stationsStep && question.stations) return { ...s, stationsStep: true };
      if (s.step === 0) return s;
      return { ...s, step: s.step - 1, stationsStep: false };
    });
  }, []);

  const discard = useCallback(() => {
    if (state.stage !== 'intro') {
      track({ name: 'reflection_discarded', step: state.stage === 'asking' ? state.step + 1 : 8 });
    }
    setState({ stage: 'intro' });
  }, [state]);

  const keep = useCallback((): Trace | null => {
    if (state.stage !== 'result') return null;
    const trace = { id: createId('trace'), createdAt: Date.now(), reflection: state.draft };
    track({ name: 'trace_saved', traceId: trace.id });
    setState({ stage: 'intro' });
    return trace;
  }, [state]);

  return { state, start, toggle, setOwn, setStations, next, back, discard, keep };
}
