# THE THRESHOLD · 커리어의 지도

도시 산책 판(`../threshold`)과 같은 생각으로 만든 커리어 판 Expo/React Native MVP입니다. 다른 사람들이 헤맨 장면을 발견하고, [돌아보는 길]의 일곱 질문으로 내가 걸어온 길을 돌아봅니다. 목적지를 정해 주지 않고, 지금 헤매는 중임을 지도 위에 흐릿한 영역으로 드러냅니다.

기준 문서는 [`AGENTS.md`](./AGENTS.md)와 [`docs/`](./docs/), 공통 원칙은 [`../threshold/docs/`](../threshold/docs/)에 있습니다.

## 실행

```bash
pnpm install
pnpm start      # Expo Go
pnpm web
pnpm typecheck
```

## 구현 범위

- 돌아보기: 일곱 질문(성경 요소 제외), 여러 개 선택과 직접 적기, 거쳐 온 곳 입력·순서 바꾸기, 진행 길, 그만두기 확인
- 결과 편지: 돌아보는 길의 문장 틀과 한국어 조사 처리, 다음 자리를 위한 실천, 거쳐 온 곳과 "곁에 있던 것" 길 그림
- 지도: 되풀이해 온 일 여섯 가지를 Zone으로 둔 비지리적 지형, 장면 점(● 길을 찾은 / ○ 지금도 헤매는), 나의 위치는 등불색 안개와 헤매는 궤적
- 발견: 장면 한 장씩, 나와 겹치는 일 순서(회고 전에는 큐레이션 순서)
- 장면 상세: Seuil, 거쳐 온 곳, 겹치는 일, 가져갈 질문, 나의 길에 담기
- 나의 길: 남긴 회고 다시 읽기, 담아 둔 장면 (현재 세션 메모리에만 저장)
- 분석 이벤트 타입: [`docs/analytics/event-taxonomy.md`](./docs/analytics/event-taxonomy.md)

## 데이터

`src/data/passages.ts`의 장면 8개는 **실제 사람의 이야기가 아닌 샘플**이며 화면에도 샘플로 표시됩니다. 출시 전에 본인이 쓴 기록으로 교체해야 합니다. 질문과 결과 문장은 `src/data/reflection.ts`, `src/lib/letter.ts`에 있습니다.

## 아직 없는 것

- Figma 시안 반영 (파일 접근 권한 필요)
- Supabase 스키마, 계정, 영구 저장, 결과 공유
