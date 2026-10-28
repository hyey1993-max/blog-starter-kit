import { db } from "./db";
import type { Interpretation } from "./interpret-core";

export type ThreadStatus = "active" | "closed";

export type Thread = {
  id: string;
  title: string;
  status: ThreadStatus;
  summary: string;
  created_at: Date;
  updated_at: Date;
};

export type ThreadListItem = Thread & { entry_count: number; last_entry_at: Date | null };

export type Entry = {
  id: string;
  thread_id: string;
  created_at: Date;
  concern: string;
  passage_ref: string;
  book_index: number;
  chapter: number;
  verse_start: number;
  verse_end: number;
  passage_text: string | null;
  draw_mode: string;
  reroll_count: number;
  interpretation: (Interpretation & { raw?: string }) | null;
  my_response: string;
};

export const isId = (value: unknown): value is string =>
  typeof value === "string" && /^\d{1,18}$/.test(value);

export async function listThreads(): Promise<ThreadListItem[]> {
  const sql = await db();
  return sql<ThreadListItem[]>`
    SELECT t.*, count(e.id)::int AS entry_count, max(e.created_at) AS last_entry_at
    FROM threads t LEFT JOIN entries e ON e.thread_id = t.id
    GROUP BY t.id
    ORDER BY (t.status = 'active') DESC, t.updated_at DESC`;
}

export async function getThread(id: string): Promise<Thread | null> {
  const sql = await db();
  const [row] = await sql<Thread[]>`SELECT * FROM threads WHERE id = ${id}`;
  return row ?? null;
}

export async function createThread(title: string): Promise<Thread> {
  const sql = await db();
  const [row] = await sql<Thread[]>`INSERT INTO threads (title) VALUES (${title}) RETURNING *`;
  return row;
}

export async function listEntries(threadId: string, limit?: number): Promise<Entry[]> {
  const sql = await db();
  return sql<Entry[]>`
    SELECT * FROM entries WHERE thread_id = ${threadId}
    ORDER BY created_at DESC
    ${limit ? sql`LIMIT ${limit}` : sql``}`;
}

export async function getEntry(id: string): Promise<Entry | null> {
  const sql = await db();
  const [row] = await sql<Entry[]>`SELECT * FROM entries WHERE id = ${id}`;
  return row ?? null;
}

export type NewEntry = Omit<Entry, "id" | "created_at">;

export async function insertEntry(entry: NewEntry): Promise<Entry> {
  const sql = await db();
  return sql.begin(async (tx) => {
    const [row] = await tx<Entry[]>`
      INSERT INTO entries (
        thread_id, concern, passage_ref, book_index, chapter, verse_start, verse_end,
        passage_text, draw_mode, reroll_count, interpretation, my_response
      ) VALUES (
        ${entry.thread_id}, ${entry.concern}, ${entry.passage_ref}, ${entry.book_index},
        ${entry.chapter}, ${entry.verse_start}, ${entry.verse_end}, ${entry.passage_text},
        ${entry.draw_mode}, ${entry.reroll_count},
        ${entry.interpretation ? tx.json(entry.interpretation) : null}, ${entry.my_response}
      ) RETURNING *`;
    await tx`UPDATE threads SET updated_at = now() WHERE id = ${entry.thread_id}`;
    return row;
  });
}
