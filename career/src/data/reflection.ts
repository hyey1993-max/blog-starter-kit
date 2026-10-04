import { threadOrder, threads } from '../domain/threads';
import type { QuestionKey } from '../domain/types';

/**
 * The seven questions of 돌아보는 길, without the scripture layer.
 * Copy is the author's own; keep edits in sync with that survey.
 */
export type ReflectionOption = { id: string; label: string; echo?: string; short?: string };

export type ReflectionQuestion = {
  number: number;
  key: QuestionKey;
  question: string;
  options: ReflectionOption[];
  /** Question 4 first asks for the stations walked through. */
  stations?: { question: string; hint: string };
};

export const reflectionIntro = {
  title: '돌아보는 길',
  subtitle: '지나온 커리어를 되짚는 일곱 가지 질문',
  intro: '다음 목적지를 찾기 전에, 지금까지 걸어온 길을 먼저 돌아보세요.',
  duration: '약 7분',
  privacy: '답은 이 기기의 현재 세션에만 남아요.',
};

export const MAX_STATIONS = 7;

export const reflectionQuestions: ReflectionQuestion[] = [
  {
    number: 1,
    key: 'recurring',
    question: '요즘 일을 생각하면, 머릿속에 자주 맴도는 말은 무엇인가요?',
    options: [
      { id: 'lost_place', label: '이만큼 했는데, 아직도 내 자리가 어딘지 모르겠다' },
      { id: 'must_prove', label: '뭔가를 더 보여 줘야 인정받을 것 같다' },
      { id: 'scattered', label: '갈 수 있는 길이 너무 많아서 오히려 방향을 못 잡겠다' },
      { id: 'ending_weighs', label: '지난 회사를 떠난 방식이 계속 마음에 걸린다' },
    ],
  },
  {
    number: 2,
    key: 'hope',
    question: '마지막으로 일한 곳에서, 가장 크게 기대했던 것은 무엇이었나요?',
    options: [
      { id: 'recognition', label: '인정받고 더 큰 역할을 맡게 되는 것', echo: '인정받고 더 큰 역할을 맡는 것' },
      { id: 'rooted', label: '내가 만든 일하는 방식이 팀에 자리 잡는 것', echo: '직접 만든 일하는 방식이 팀에 자리 잡는 것' },
      { id: 'belonging', label: '함께 일한 사람들과 오래 가는 것' },
      { id: 'certainty', label: '그곳이 내 커리어의 확실한 답이 되는 것', echo: '그곳이 커리어의 확실한 답이 되는 것' },
    ],
  },
  {
    number: 3,
    key: 'evidence',
    question: '기대한 모습은 아니었어도, 돌아보면 이미 이뤄 낸 것은 무엇인가요?',
    options: [
      { id: 'followed', label: '내 방식을 실제로 따라 준 동료들', echo: '일하는 방식을 따라 준 동료들' },
      { id: 'results', label: '내 판단으로 만들어 낸 성과와 숫자', echo: '직접 판단해서 만들어 낸 성과와 숫자' },
      { id: 'changed_someone', label: '나와 일하면서 생각이 바뀐 사람', echo: '함께 일하며 생각이 바뀐 사람' },
      {
        id: 'finished_alongside',
        label: '일하면서 끝까지 해낸 다른 일 (공부, 개인 프로젝트 등)',
        echo: '일하면서 끝까지 해낸 다른 일',
      },
      { id: 'titled', label: '이미 맡고 있던 역할과 직책' },
    ],
  },
  {
    number: 4,
    key: 'thread',
    question: '자리는 달라도, 어디에서든 되풀이해 온 일은 무엇이었나요?',
    stations: {
      question: '지금까지 거쳐 온 곳을 순서대로 적어 보세요.',
      hint: '학교, 회사, 프로젝트 무엇이든 괜찮아요. 일곱 곳까지 적을 수 있어요.',
    },
    options: threadOrder.map((id) => ({ id, label: threads[id].label, echo: threads[id].echo })),
  },
  {
    number: 5,
    key: 'burning',
    question: '그때는 그냥 일이었는데, 돌아보니 가장 가슴 뛰었던 순간은 언제였나요?',
    options: [
      {
        id: 'wrong_then_saw',
        label: '내 생각이 틀렸다는 걸 알고, 비로소 제대로 보게 된 순간',
        echo: '생각이 틀렸다는 걸 알고 비로소 제대로 보게 된 순간',
      },
      { id: 'someone_saw_self', label: '누군가 자기 강점을 스스로 알아차린 순간' },
      { id: 'pieces_connected', label: '흩어져 있던 것들이 하나로 연결된 순간' },
      { id: 'made_something', label: '처음 만든 것을 세상에 내놓은 순간' },
      { id: 'was_praised', label: '인정받고 칭찬받은 순간' },
    ],
  },
  {
    number: 6,
    key: 'companions',
    question: '혼자 버텼다고 생각했지만, 사실 곁에서 힘이 되어 준 것은 무엇이었나요?',
    options: [
      { id: 'colleagues', label: '실수했을 때도 다시 믿어 준 동료', short: '다시 믿어 준 동료' },
      { id: 'teachers', label: '배우는 자리에서 만난 선생님과 선배', short: '선생님과 선배' },
      { id: 'words', label: '힘들 때 붙잡고 있던 말이나 신념', echo: '힘들 때 붙잡고 있던 말과 신념', short: '붙잡고 있던 말' },
      { id: 'family_friends', label: '지친 날 곁에 있어 준 가족과 친구', short: '가족과 친구' },
    ],
  },
  {
    number: 7,
    key: 'return',
    question: '다음 커리어를 고를 때, 무엇을 다르게 해 보고 싶나요?',
    options: [
      { id: 'choose_role_not_title', label: '더 높은 직함보다, 내가 잘해 온 일을 할 수 있는 자리를 고른다' },
      { id: 'choose_trusting_org', label: '실수해도 다시 믿어 주는 사람들이 있는 곳을 고른다' },
      { id: 'work_for_opening', label: '인정받기보다, 누군가 새롭게 깨닫는 순간을 위해 일한다' },
      { id: 'ending_as_start', label: '지난 회사를 떠난 일을 실패가 아니라 새 출발로 받아들인다' },
    ],
  },
];

export const questionByKey = Object.fromEntries(reflectionQuestions.map((q) => [q.key, q])) as Record<
  QuestionKey,
  ReflectionQuestion
>;
