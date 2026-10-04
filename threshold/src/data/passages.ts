import type { Passage } from '../domain/types';

/**
 * Sample Passages for prototype development only.
 *
 * These are placeholders, not real curation: names are generic, coordinates are
 * approximate points in central Seoul, and observations are neutral sample copy.
 * Replace with curator-written Passages (Supabase `passages`) before launch.
 * Do not present this text as a real person's experience.
 */
export const samplePassages: Passage[] = [
  {
    id: 'sample-seochon-stairs',
    name: '골목 끝의 돌계단',
    zone: '서촌',
    coordinates: { latitude: 37.5803, longitude: 126.9688 },
    seuil: 2,
    observation:
      '[샘플] 큰길에서 두 번 꺾어 들어가면 계단이 나타난다. 오후에는 계단 위로 그림자가 길게 눕는다. 큐레이터의 실제 관찰로 교체될 자리.',
    curator: '샘플 큐레이터',
    contextTags: ['오후의 그림자', '머무는 계단', '소리 낮은 골목'],
    practical: { accessibility: '계단만 있음, 휠체어 접근 어려움' },
    isSample: true,
  },
  {
    id: 'sample-ikseon-courtyard',
    name: '안쪽 마당',
    zone: '익선동',
    coordinates: { latitude: 37.5741, longitude: 126.9897 },
    seuil: 3,
    observation:
      '[샘플] 좁은 입구를 지나면 하늘이 열리는 작은 마당. 입구는 지나치기 쉽다. 큐레이터의 실제 관찰로 교체될 자리.',
    curator: '샘플 큐레이터',
    contextTags: ['열리는 하늘', '좁은 입구'],
    practical: { hours: '운영 시간 확인 필요', accessibility: '입구 턱 있음' },
    isSample: true,
  },
  {
    id: 'sample-euljiro-window',
    name: '2층 창가',
    zone: '을지로',
    coordinates: { latitude: 37.5663, longitude: 126.9910 },
    seuil: 2,
    observation:
      '[샘플] 인쇄소 골목을 내려다보는 높이. 기계 소리가 리듬처럼 올라온다. 큐레이터의 실제 관찰로 교체될 자리.',
    curator: '샘플 큐레이터',
    contextTags: ['내려다보는 거리', '작업의 소리'],
    practical: { hours: '운영 시간 확인 필요', accessibility: '엘리베이터 없음' },
    isSample: true,
  },
  {
    id: 'sample-jeongdong-wall',
    name: '돌담 아래 벤치',
    zone: '정동',
    coordinates: { latitude: 37.5658, longitude: 126.9737 },
    seuil: 1,
    observation:
      '[샘플] 길을 따라 이어지는 담장 아래, 걸음을 늦추게 되는 구간. 큐레이터의 실제 관찰로 교체될 자리.',
    curator: '샘플 큐레이터',
    contextTags: ['느려지는 걸음', '담장의 결'],
    practical: { accessibility: '평지, 접근 쉬움' },
    isSample: true,
  },
  {
    id: 'sample-naksan-edge',
    name: '성곽길 가장자리',
    zone: '낙산',
    coordinates: { latitude: 37.5806, longitude: 127.0075 },
    seuil: 1,
    observation:
      '[샘플] 해 질 무렵 도시의 불빛이 하나씩 켜지는 것을 볼 수 있는 경사. 큐레이터의 실제 관찰로 교체될 자리.',
    curator: '샘플 큐레이터',
    contextTags: ['해 질 녘', '도시의 윤곽'],
    practical: { accessibility: '경사로, 일부 계단' },
    isSample: true,
  },
];

/** Used to frame the map when the Flâneur location is unavailable. */
export const archiveCenter = { latitude: 37.5734, longitude: 126.9871 };
