import Link from "next/link";
import { notFound } from "next/navigation";
import { InterpretationView } from "@/components/InterpretationView";
import { PassageView, versesFromText } from "@/components/PassageView";
import { SetupNeeded } from "@/components/SetupNeeded";
import { Topbar } from "@/components/Topbar";
import { isDbConfigured } from "@/lib/db";
import { formatDate } from "@/lib/context";
import { getEntry, getThread, isId } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) return <SetupNeeded />;
  const { id } = await params;
  if (!isId(id)) notFound();
  const entry = await getEntry(id);
  if (!entry) notFound();
  const thread = await getThread(entry.thread_id);

  return (
    <main className="shell">
      <Topbar />
      <p className="small">
        <Link href={`/threads/${entry.thread_id}`}>{thread?.title}</Link> · {formatDate(entry.created_at)}
        {entry.reroll_count > 0 && ` · 다시 펼침 ${entry.reroll_count}번`}
      </p>

      <section className="step">
        <div className="step-label">고민과 상황</div>
        <p className="prewrap" style={{ margin: 0 }}>
          {entry.concern}
        </p>
      </section>

      <section className="step">
        <div className="step-label">받은 말씀</div>
        <PassageView refText={entry.passage_ref} verses={versesFromText(entry.passage_text)} />
      </section>

      {entry.interpretation?.raw && (
        <section className="step">
          <div className="step-label">해석</div>
          <InterpretationView raw={entry.interpretation.raw} />
        </section>
      )}

      {entry.my_response && (
        <section className="step">
          <div className="step-label">나의 응답</div>
          <p className="prewrap" style={{ margin: 0 }}>
            {entry.my_response}
          </p>
        </section>
      )}
    </main>
  );
}
