import { questionByKey } from '../data/reflection';
import { threads } from '../domain/threads';
import type { Answer, QuestionKey, ReflectionAnswers, ThreadId } from '../domain/types';
import { fill, joinKo, quote, withJosa } from './korean';

/** Result templates from 돌아보는 길 (scripture lines removed). */
const t = {
  recurring: {
    quoted: '요즘 머릿속에 {quotes}이라는 말이 자주 맴돌았어요.',
    turn: '그런데 그 실마리는 방금 고른 답들 안에 이미 있었어요.',
    none: '요즘 말로 다 하기 어려운 생각을 안고 있었어요. 그런데 그 실마리는 방금 고른 답들 안에 이미 있었어요.',
  },
  hope: {
    recognition:
      '인정받기를 기대했지만, 인정은 이미 받고 있었어요. {where}. 무너진 건 인정이 아니라, 그다음에 올 거라 믿었던 기회였을 거예요.',
    rooted: '팀에 자리 잡기를 바랐던 방식은, 동료들이 실제로 따라 준 그때 이미 뿌리내리고 있었어요.',
    belonging: '오래 함께하길 바랐던 관계는 {traces}에게 이미 흔적을 남겼어요. 함께한 시간이 끝났다고 그 흔적까지 사라지지는 않아요.',
    certainty: '확실한 답을 원했지만, 지금까지 쌓아 온 것들은 한 회사의 확실함보다 더 오래가는 무언가를 가리키고 있어요.',
    fallback: '기대했던 건 {hopes}이었지만, 실제로 곁에는 {evidence}이 있었어요. 기대한 모습은 아니어도 이미 가지고 있던 것들이에요.',
    noEvidence: '이뤄 낸 것이 아직 떠오르지 않는다면, 없어서가 아니라 기대한 모습으로 오지 않아서일 수도 있어요.',
  },
  path: {
    across: '이름도 하는 일도 달랐지만, 어디에서든 비슷한 일을 되풀이해 왔어요.',
    acrossOne: '한 곳이었지만, 그 안에서도 모습을 바꿔 가며 비슷한 일을 되풀이해 왔어요.',
    acrossNoStations: '처음부터 돌아보면, 어느 자리에서든 비슷한 일을 되풀이해 왔어요.',
    threads: '바로 {threads}이에요.',
    revealAndCriteria: '진짜 원인을 찾아내야 흔들리지 않는 기준을 세울 수 있으니, 이 둘은 사실 하나로 이어진 일이에요.',
    many: '따로 떨어진 재주처럼 보여도, 같은 관심이 자리마다 다른 모습으로 드러난 거예요.',
    one: '자리가 바뀌어도 이 일만큼은 늘 곁에 있었어요.',
    none: '되풀이해 온 일이 아직 잘 보이지 않는다면, 거쳐 온 곳들을 하나씩 떠올리며 그때 무슨 일을 했는지 적어 보세요. 자주 겹치는 말이 보일 거예요.',
  },
  burning: {
    mismatch: '기대한 건 인정이었는데, 정작 가슴이 뛰었던 건 칭찬받을 때가 아니라 {moments}이었어요.',
    mismatchClose: '이 차이 안에 일을 계속하게 만드는 진짜 이유가 있어요.',
    withPraise: '인정받은 순간도 분명 큰 힘이 됐어요. 그리고 {moments}도 똑같이 가슴을 뛰게 했어요.',
    praiseOnly: '인정받은 순간이 힘이 된 건 자연스러운 일이에요. 다만 무엇을 해서 인정받았는지 떠올려 보면, 그 안에 되풀이해 온 일이 있어요.',
    general: '기대한 건 {hopes}이었지만, 정작 가슴이 뛰었던 건 {moments}이었어요.',
    generalNoHope: '돌아보니 가슴이 뛰었던 건 {moments}이었어요.',
    generalClose: '기대한 것과 가슴 뛰었던 것 사이를 들여다보면, 어떤 일을 할 때 가장 살아 있는지가 보여요.',
    eyesBoth: '둘 다 무언가를 새롭게 깨닫는 순간이에요. 나 자신도, 다른 사람도요.',
    eyesSelf: '무언가를 새롭게 깨닫게 된 순간이었어요.',
    eyesOther: '누군가 무언가를 새롭게 깨닫는 순간이었어요.',
    none: '가슴 뛰었던 순간이 바로 떠오르지 않아도 괜찮아요. 한참 지나서야 알게 되는 순간도 있으니까요.',
  },
  return: {
    companions: '혼자 버텼다고 생각했겠지만, 곁에는 {companions}이 있었어요.',
    noCompanions: '혼자 버텨 왔다고 느낀다면 그것도 솔직한 답이에요. 다만 여기까지 오는 동안 누군가의 도움이 닿은 순간도 있었을 거예요.',
    lead: '이제 다음 자리를 고를 때 해 볼 수 있는 것들이에요.',
    practices: {
      choose_role_not_title: '채용 공고를 볼 때 직함보다 먼저, 그 자리에서 {thread}을 할 수 있는지 확인해 보세요.',
      choose_trusting_org:
        "면접 마지막에 이렇게 물어보세요. '최근 팀에서 잘못된 결정이 있었을 때, 그 뒤에 어떻게 대처했나요?' 대답을 들어 보면 그곳이 실수를 탓하는 곳인지, 다시 기회를 주는 곳인지 알 수 있어요.",
      work_for_opening: "새 일터에서 한 주를 마칠 때마다 스스로에게 물어보세요. '이번 주에 누가 무엇을 새롭게 깨달았지?'",
      ending_as_start:
        "'왜 그만두셨어요?'라는 질문에는 변명 대신 이렇게 답해 보세요. '그곳에서 제가 꾸준히 잘해 온 일이 무엇인지 분명히 알게 됐어요. 그 일을 더 믿고 맡겨 주는 곳에서 이어 가고 싶습니다.'",
    } as Record<string, string>,
    threadFallback: '지금까지 되풀이해 온 일',
    custom: '직접 적은 다짐, {quoted}. 이 문장을 이번 주 다이어리 첫 줄에 적어 두세요.',
  },
};

export type LetterSection = { key: string; paragraphs: string[]; practices?: string[] };

const echoOf = (key: QuestionKey, id: string) => {
  const option = questionByKey[key].options.find((o) => o.id === id);
  return option?.echo ?? option?.label ?? id;
};

/** Selected option echoes plus the quoted own text. */
function echoes(key: QuestionKey, answer: Answer, exclude: string[] = []): string[] {
  const list = answer.selected.filter((id) => !exclude.includes(id)).map((id) => echoOf(key, id));
  if (answer.own) list.push(quote(answer.own));
  return list;
}

export function composeLetter({ stations, answers }: ReflectionAnswers): LetterSection[] {
  const has = (key: QuestionKey, id: string) => answers[key].selected.includes(id);
  const sections: LetterSection[] = [];

  // 1. What keeps circling.
  const recurring = [
    ...answers.recurring.selected.map((id) => quote(echoOf('recurring', id))),
    ...(answers.recurring.own ? [quote(answers.recurring.own)] : []),
  ];
  sections.push({
    key: 'recurring',
    paragraphs: recurring.length
      ? [fill(t.recurring.quoted, { quotes: recurring.join(', ') }) + ' ' + t.recurring.turn]
      : [t.recurring.none],
  });

  // 2–3. What was hoped for, and what was already there.
  const hope: string[] = [];
  const handled = new Set<string>();
  if (has('hope', 'recognition')) {
    const where = [
      has('evidence', 'titled') ? '맡고 있던 역할' : null,
      has('evidence', 'followed') ? '일하는 방식을 따라 준 동료들' : null,
    ].filter((x): x is string => !!x);
    if (where.length) {
      const whereText =
        where.length === 2
          ? `${where[0]}도, ${where[1]}도 그 증거예요`
          : `${withJosa(where[0]!, '이')} 그 증거예요`;
      hope.push(fill(t.hope.recognition, { where: whereText }));
      handled.add('recognition');
    }
  }
  if (has('hope', 'rooted') && has('evidence', 'followed')) {
    hope.push(t.hope.rooted);
    handled.add('rooted');
  }
  if (has('hope', 'belonging')) {
    const traces = [
      has('evidence', 'followed') ? '일하는 방식을 따라 준 동료들' : null,
      has('evidence', 'changed_someone') ? '함께 일하며 생각이 바뀐 사람' : null,
    ].filter((x): x is string => !!x);
    if (traces.length) {
      hope.push(fill(t.hope.belonging, { traces: joinKo(traces) }));
      handled.add('belonging');
    }
  }
  if (has('hope', 'certainty')) {
    hope.push(t.hope.certainty);
    handled.add('certainty');
  }
  const evidence = echoes('evidence', answers.evidence);
  const leftoverHopes = echoes('hope', answers.hope, [...handled]);
  if (leftoverHopes.length && evidence.length) {
    hope.push(fill(t.hope.fallback, { hopes: joinKo(leftoverHopes), evidence: joinKo(evidence) }));
  }
  if (!evidence.length) hope.push(t.hope.noEvidence);
  sections.push({ key: 'hope', paragraphs: hope });

  // 4. Stations and the threads repeated across them.
  const chosenThreads = answers.thread.selected as ThreadId[];
  const threadTexts = echoes('thread', answers.thread);
  const path: string[] = [];
  if (stations.length) path.push(`${stations.join(', ')}.`);
  if (threadTexts.length) {
    const across = stations.length >= 2 ? t.path.across : stations.length === 1 ? t.path.acrossOne : t.path.acrossNoStations;
    path.push(`${across} ${fill(t.path.threads, { threads: joinKo(threadTexts) })}`);
    if (chosenThreads.includes('reveal_hidden') && chosenThreads.includes('set_criteria')) path.push(t.path.revealAndCriteria);
    else path.push(threadTexts.length >= 2 ? t.path.many : t.path.one);
  } else {
    path.push(t.path.none);
  }
  sections.push({ key: 'path', paragraphs: path });

  // 5. What actually made the heart beat.
  const praised = has('burning', 'was_praised');
  const moments = echoes('burning', answers.burning, ['was_praised']);
  const hopes = echoes('hope', answers.hope);
  const burning: string[] = [];
  if (!moments.length) {
    burning.push(praised ? t.burning.praiseOnly : t.burning.none);
  } else if (has('hope', 'recognition') && !praised) {
    burning.push(`${fill(t.burning.mismatch, { moments: joinKo(moments) })} ${t.burning.mismatchClose}`);
  } else if (praised) {
    burning.push(fill(t.burning.withPraise, { moments: joinKo(moments) }));
  } else {
    const line = hopes.length
      ? fill(t.burning.general, { hopes: joinKo(hopes), moments: joinKo(moments) })
      : fill(t.burning.generalNoHope, { moments: joinKo(moments) });
    burning.push(`${line} ${t.burning.generalClose}`);
  }
  const self = has('burning', 'wrong_then_saw');
  const other = has('burning', 'someone_saw_self');
  if (self && other) burning.push(t.burning.eyesBoth);
  else if (self) burning.push(t.burning.eyesSelf);
  else if (other) burning.push(t.burning.eyesOther);
  sections.push({ key: 'burning', paragraphs: burning });

  // 6–7. Who was there, and what to try next.
  const companions = echoes('companions', answers.companions);
  const firstThread = chosenThreads[0] ? threads[chosenThreads[0]].echo : t.return.threadFallback;
  const practices = answers.return.selected
    .map((id) => t.return.practices[id])
    .filter((x): x is string => !!x)
    .map((line) => fill(line, { thread: firstThread }));
  if (answers.return.own) practices.push(fill(t.return.custom, { quoted: quote(answers.return.own) }));
  sections.push({
    key: 'return',
    paragraphs: [
      companions.length ? fill(t.return.companions, { companions: joinKo(companions) }) : t.return.noCompanions,
      ...(practices.length ? [t.return.lead] : []),
    ],
    practices,
  });

  return sections;
}

/** Short labels for the companion line drawn beside the walked path. */
export function companionLabels(reflection: ReflectionAnswers): string[] {
  const { companions } = reflection.answers;
  const options = questionByKey.companions.options;
  const labels = companions.selected.map((id) => {
    const o = options.find((x) => x.id === id);
    return o?.short ?? o?.label ?? id;
  });
  if (companions.own) labels.push(companions.own);
  return labels;
}
