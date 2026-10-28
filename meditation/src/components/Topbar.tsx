import Link from "next/link";

export function Topbar() {
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        묵상 노트
      </Link>
      <nav>
        <Link href="/">오늘의 묵상</Link>
        <Link href="/threads">줄기</Link>
      </nav>
    </header>
  );
}
