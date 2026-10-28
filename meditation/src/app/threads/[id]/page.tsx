import Link from "next/link";
import { notFound } from "next/navigation";
import { SetupNeeded } from "@/components/SetupNeeded";
import { Topbar } from "@/components/Topbar";
import { isDbConfigured } from "@/lib/db";
import { formatDate } from "@/lib/context";
import { getThread, isId, listEntries } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  if (!isDbConfigured()) return <SetupNeeded />;
  const { id } = await params;
  const { saved } = await searchParams;
  if (!isId(id)) notFound();
  const thread = await getThread(id);
  if (!thread) notFound();
  const entries = await listEntries(id);

  return (
    <main className="shell">
      <Topbar />
      <h1>
        {thread.title}
        {thread.status === "closed" && <span className="badge">마무리</span>}
      </h1>
      <p className="small">
        {formatDate(thread.created_at)}부터 · 묵상 {entries.length}번
      </p>
      {saved && <p className="notice">오늘의 묵상을 저장했어요.</p>}

      {thread.summary ? (
        <div className="summary">{thread.summary}</div>
      ) : (
        <p className="small" style={{ margin: "14px 0 28px" }}>
          줄기 요약은 묵상이 쌓이면 자동으로 정리됩니다.
        </p>
      )}

      <ol className="timeline">
        {entries.map((e) => (
          <li key={e.id}>
            <Link href={`/entries/${e.id}`} style={{ textDecoration: "none" }}>
              <div className="date">{formatDate(e.created_at)}</div>
              <div style={{ fontWeight: 600 }}>{e.passage_ref}</div>
              {e.interpretation?.anchor_sentence && (
                <p style={{ margin: "6px 0" }} className="muted">
                  {e.interpretation.anchor_sentence}
                </p>
              )}
              {e.my_response && <p style={{ margin: "6px 0" }}>{e.my_response}</p>}
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
