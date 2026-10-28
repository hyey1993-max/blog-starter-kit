import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="shell" style={{ paddingTop: "18vh" }}>
      <h1>묵상 노트</h1>
      <p className="muted">비밀번호를 입력해 주세요.</p>
      <LoginForm next={next ?? "/"} />
    </main>
  );
}
