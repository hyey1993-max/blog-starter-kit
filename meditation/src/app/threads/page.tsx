import Link from "next/link";
import { SetupNeeded } from "@/components/SetupNeeded";
import { Topbar } from "@/components/Topbar";
import { isDbConfigured } from "@/lib/db";
import { formatDate } from "@/lib/context";
import { listThreads } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function ThreadsPage() {
  if (!isDbConfigured()) return <SetupNeeded />;
  const threads = await listThreads();
  return (
    <main className="shell">
      <Topbar />
      <h1>고민 줄기</h1>
      {threads.length === 0 ? (
        <p className="muted">
          아직 줄기가 없어요. <Link href="/">오늘의 묵상</Link>에서 첫 줄기를 만들어 보세요.
        </p>
      ) : (
        <ul className="card-list">
          {threads.map((t) => (
            <li key={t.id}>
              <Link href={`/threads/${t.id}`}>
                <div>
                  {t.title}
                  {t.status === "closed" && <span className="badge">마무리</span>}
                </div>
                <div className="small">
                  묵상 {t.entry_count}번{t.last_entry_at ? ` · 마지막 ${formatDate(t.last_entry_at)}` : ""}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
