import { Meditation } from "@/components/Meditation";
import { Topbar } from "@/components/Topbar";
import { listThreads } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const threads = (await listThreads())
    .filter((t) => t.status === "active")
    .map((t) => ({ id: t.id, title: t.title, summary: t.summary, entryCount: t.entry_count }));

  return (
    <main className="shell">
      <Topbar />
      <h1>오늘의 묵상</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: 32 }}>
        고민을 적고, 말씀을 펼치고, 함께 읽어 봅니다.
      </p>
      <Meditation threads={threads} />
    </main>
  );
}
