import type { Passage } from '../domain/types';

/**
 * Sample Passages for prototype development only.
 *
 * Placeholders, not real people or real careers. Each moment is neutral
 * third-person sample copy marked [샘플]. Replace with Passages written by
 * the people who lived them before launch. Do not present this text as
 * anyone's actual experience.
 */
export const samplePassages: Passage[] = [
  {
    id: 'sample-planning-to-data',
    title: '기획에서 데이터로 건너가던 해',
    moment:
      '[샘플] 회의마다 감으로 정해지던 결정에 숫자를 붙여 보다가, 그 일이 직무 이름보다 오래 남는다는 걸 알게 된 장면. 실제 기록으로 교체될 자리.',
    carry: '직함과 상관없이 내가 계속 하고 있던 일은 무엇인가?',
    threads: ['set_criteria', 'reveal_hidden'],
    seuil: 'switching',
    stillWandering: true,
    stations: ['광고 대행사', '스타트업 기획', '데이터 분석 과정'],
    narrator: '샘플 기록자',
    isSample: true,
  },
  {
    id: 'sample-eight-months',
    title: '공백 여덟 달',
    moment:
      '[샘플] 이력서의 빈칸을 설명하려 애쓰다가, 그 시간에 동생의 취업 준비를 도우며 가장 오래 몰입했다는 걸 깨닫는 장면. 실제 기록으로 교체될 자리.',
    carry: '아무도 일이라고 부르지 않던 시간에, 나는 무엇에 몰입했나?',
    threads: ['grow_people', 'translate_between'],
    seuil: 'pause',
    stillWandering: true,
    stations: ['교육 회사', '공백', '커뮤니티 운영'],
    narrator: '샘플 기록자',
    isSample: true,
  },
  {
    id: 'sample-first-year-exit',
    title: '첫 회사를 1년 만에 나온 날',
    moment:
      '[샘플] 실패라고 생각했던 퇴사 메일을 다시 읽으며, 그 1년 동안 팀의 흩어진 문서를 혼자 정리해 왔다는 사실이 보이는 장면. 실제 기록으로 교체될 자리.',
    carry: '떠난 곳에 내가 남기고 온 구조는 무엇인가?',
    threads: ['structure_confusion'],
    seuil: 'leaving',
    stillWandering: false,
    stations: ['첫 회사', '두 번째 회사'],
    narrator: '샘플 기록자',
    isSample: true,
  },
  {
    id: 'sample-designer-pm-back',
    title: '디자이너에서 PM으로, 그리고 다시',
    moment:
      '[샘플] 더 큰 역할이라 믿고 건너갔다가, 화면을 직접 만들 때만 시간이 빨리 갔다는 걸 인정하고 돌아오는 장면. 실제 기록으로 교체될 자리.',
    carry: '더 높아 보이는 자리와 더 살아 있는 자리는 같은가?',
    threads: ['make_first', 'translate_between'],
    seuil: 'returning',
    stillWandering: true,
    stations: ['디자인 스튜디오', '플랫폼 PM', '프로덕트 디자인'],
    narrator: '샘플 기록자',
    isSample: true,
  },
  {
    id: 'sample-kept-major',
    title: '전공을 바꾸지 않기로 한 결정',
    moment:
      '[샘플] 모두가 다른 길을 권할 때, 무엇을 기준으로 남을지 스스로 적어 본 첫 번째 목록이 떠오르는 장면. 실제 기록으로 교체될 자리.',
    carry: '남의 기준이 아닌 내 기준을 처음 세운 순간은 언제였나?',
    threads: ['set_criteria'],
    seuil: 'first',
    stillWandering: false,
    stations: ['학부', '연구 인턴'],
    narrator: '샘플 기록자',
    isSample: true,
  },
  {
    id: 'sample-declined-lead',
    title: '팀장 제안을 거절한 뒤',
    moment:
      '[샘플] 거절 이후 불안해하면서도, 후배가 처음 혼자 발표를 마친 날이 그해 가장 기뻤다는 걸 알게 되는 장면. 실제 기록으로 교체될 자리.',
    carry: '나는 무엇을 위해 일할 때 가장 가벼워지나?',
    threads: ['grow_people'],
    seuil: 'pause',
    stillWandering: true,
    stations: ['컨설팅', '인하우스 전략팀'],
    narrator: '샘플 기록자',
    isSample: true,
  },
  {
    id: 'sample-side-to-main',
    title: '사이드 프로젝트가 본업이 되기까지',
    moment:
      '[샘플] 퇴근 후 혼자 만들던 도구를 누군가 처음 써 준 날, 흩어진 경험들이 하나의 일로 연결되는 장면. 실제 기록으로 교체될 자리.',
    carry: '내가 처음 만들어 세상에 내놓은 것은 무엇이었나?',
    threads: ['make_first', 'structure_confusion'],
    seuil: 'switching',
    stillWandering: false,
    stations: ['SI 개발', '사이드 프로젝트', '1인 창업'],
    narrator: '샘플 기록자',
    isSample: true,
  },
  {
    id: 'sample-lab-to-field',
    title: '연구실을 떠나 현장으로',
    moment:
      '[샘플] 논문 대신 현장의 말을 연구자에게 옮기는 일을 하며, 두 세계 사이에 서 있는 것이 약점이 아니었음을 보는 장면. 실제 기록으로 교체될 자리.',
    carry: '나는 어떤 두 세계 사이에서 말을 옮겨 왔나?',
    threads: ['reveal_hidden', 'translate_between'],
    seuil: 'leaving',
    stillWandering: true,
    stations: ['대학원 연구실', '리서치 회사', '공공 프로젝트'],
    narrator: '샘플 기록자',
    isSample: true,
  },
];
