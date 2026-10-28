import type { RecentEntry } from "./interpret-core";
import { getThread, listEntries } from "./repo";

export const RECENT_ENTRY_COUNT = 3;

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(date);
}

/** 해석에 보낼 줄기 맥락: 줄기 요약 + 최근 묵상 3개 (오래된 것부터). */
export async function loadThreadContext(threadId: string | null, newTitle: string) {
  if (!threadId) return { title: newTitle, summary: "", recent: [] as RecentEntry[] };
  const thread = await getThread(threadId);
  if (!thread) return null;
  const entries = await listEntries(threadId, RECENT_ENTRY_COUNT);
  const recent: RecentEntry[] = entries.reverse().map((e) => ({
    date: formatDate(e.created_at),
    passageRef: e.passage_ref,
    concern: e.concern,
    anchorSentence: e.interpretation?.anchor_sentence || undefined,
    myResponse: e.my_response || undefined,
  }));
  return { title: thread.title, summary: thread.summary, recent };
}
