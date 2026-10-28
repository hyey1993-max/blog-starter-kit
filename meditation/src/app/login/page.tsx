import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="shell" style={{ paddingTop: "18vh" }}>
      <h1>묵상 노트</h1>
      {process.env.APP_PASSWORD ? (
        <>
          <p className="muted">비밀번호를 입력해 주세요.</p>
          <LoginForm next={next ?? "/"} />
        </>
      ) : (
        <p className="muted">
          아직 로그인 비밀번호가 없습니다. Vercel 프로젝트의 환경 변수에 APP_PASSWORD를 넣고 다시 배포해 주세요.
        </p>
      )}
    </main>
  );
}
