import type { SeuilKind, ThreadId } from './types';

export const threadOrder: ThreadId[] = [
  'set_criteria',
  'reveal_hidden',
  'structure_confusion',
  'make_first',
  'grow_people',
  'translate_between',
];

/** Labels and echoes come from the 돌아보는 길 question set. */
export const threads: Record<ThreadId, { label: string; echo: string; short: string }> = {
  set_criteria: {
    label: '근거 없이 흔들리는 결정에 기준을 세우는 일',
    echo: '흔들리는 결정에 기준을 세우는 일',
    short: '기준 세우기',
  },
  structure_confusion: {
    label: '사람들이 헤매는 지점을 찾아 구조로 정리하는 일',
    echo: '사람들이 헤매는 지점을 구조로 정리하는 일',
    short: '구조로 정리하기',
  },
  reveal_hidden: {
    label: '가려진 진짜 원인이나 편향을 찾아내는 일',
    echo: '가려진 진짜 원인을 찾아내는 일',
    short: '진짜 원인 찾기',
  },
  translate_between: {
    label: '입장이 다른 사람들 사이에서 말을 옮기고 잇는 일',
    echo: '입장이 다른 사람들을 잇는 일',
    short: '사람 사이 잇기',
  },
  grow_people: {
    label: '사람을 챙기고 성장하도록 돕는 일',
    echo: '사람을 챙기고 성장하도록 돕는 일',
    short: '성장 돕기',
  },
  make_first: {
    label: '없던 것을 처음 만들어 내는 일',
    echo: '없던 것을 처음 만들어 내는 일',
    short: '처음 만들기',
  },
};

export const seuilLabels: Record<SeuilKind, { label: string; description: string }> = {
  first: { label: '첫발', description: '처음 일의 세계로 들어서던 문턱' },
  leaving: { label: '떠남', description: '머물던 곳을 떠나던 문턱' },
  switching: { label: '건너감', description: '다른 분야나 역할로 건너가던 문턱' },
  pause: { label: '멈춤', description: '잠시 멈추어 서 있던 문턱' },
  returning: { label: '되돌아감', description: '떠나왔던 길로 다시 돌아가던 문턱' },
};
