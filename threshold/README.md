# THE THRESHOLD

Figma node `126:4723`과 $0 API 사용자 여정을 바탕으로 만든 Expo/React Native MVP입니다.

제품·디자인·아키텍처의 기준은 [`AGENTS.md`](./AGENTS.md)와 [`docs/`](./docs/)에 분리되어 있습니다.

## 실행

```bash
pnpm install
pnpm start      # Expo Go: QR 스캔, 또는 i / a 로 시뮬레이터
pnpm web        # Leaflet 지도가 포함된 웹 버전
pnpm typecheck
```

웹 지도 타일 URL은 `.env.example`을 참고해 `EXPO_PUBLIC_TILE_URL`로 바꿀 수 있습니다. 기본 OpenStreetMap 타일은 개발용입니다.

## 구현 범위

- 기기 GPS 위치 권한 및 위치 없는 탐색 (거부 시 큐레이션 순서)
- 네이티브: 정적 잉크 드로잉 기반의 주관적 지도, Passage 점, 현재 위치, Tracé 선
- 웹: Leaflet 지도, Passage 점, 현재 위치 및 Dérive의 GPS Tracé 선
- Haversine 직선거리 계산과 거리순 정렬 (인기순 없음)
- DISCOVER 싱글 카드 탐색과 Passage 상세 해석 (Seuil 메타데이터 포함)
- WALK: Dérive 시작, 경과 시간, 추정 거리/걸음, 사진·메모 관찰, 완료 요약, 저장 전 확인
- MY: 저장한 Tracé와 Passage (현재 세션 메모리에만 저장)
- 네이버 지도 / 카카오맵 선택 시트와 딥링크, 앱 미설치 시 웹/스토어 fallback
- PT Serif 및 Inter 폰트
- 분석 이벤트 타입 정의: [`docs/analytics/event-taxonomy.md`](./docs/analytics/event-taxonomy.md)

## 데이터

앱의 샘플 Passage는 `src/data/passages.ts`에 있습니다. **실제 큐레이션이 아닌 자리표시자**이며 화면에도 샘플로 표시됩니다. 출시 전 큐레이터가 작성한 Passage로 교체해야 합니다.

- `supabase/migrations/001_zero_api_places.sql`: PostGIS 기반 장소 테이블과 거리 정렬 RPC
- `supabase/migrations/002_core_domain.sql`: 프로필, 큐레이션, 저장, 산책 및 관찰 기록의 정규화 스키마와 RLS
- `supabase/migrations/003_ubiquitous_language.sql`: Flâneur, Passage, Seuil, Tracé 도메인 언어로 전환, `nearby_passages` RPC

현재 Dérive는 전경 GPS 좌표를 Tracé 선과 거리/걸음 추정치로 표시합니다. Supabase 영구 저장, 인증, 백그라운드 추적은 다음 연동 단계입니다.

## 아직 없는 것

- Figma 내보내기 지도 에셋(`assets/figma/`): 네이티브 지도는 임시 잉크 드로잉을 사용합니다.
- `docs/product/principles.md`, `docs/design/map-principles.md`, `docs/analytics/north-star.md`, `skills/`
