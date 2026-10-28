import { Topbar } from "./Topbar";

/** DB가 아직 연결되지 않았을 때 오류 화면 대신 보여 준다. */
export function SetupNeeded() {
  return (
    <main className="shell">
      <Topbar />
      <h1>설정이 조금 남았어요</h1>
      <p className="muted">
        기록을 저장할 데이터베이스가 아직 연결되지 않았습니다. Vercel 프로젝트의 Storage에서 Neon Postgres를 연결하면
        DATABASE_URL이 자동으로 들어갑니다. 연결한 뒤 다시 배포하면 이 화면이 사라집니다.
      </p>
    </main>
  );
}
