"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_DAYS, checkPassword, createSessionToken } from "@/lib/auth";
import { getPassage, passageToText } from "@/lib/bible";
import { parseInterpretation } from "@/lib/interpret-core";
import { createThread, getThread, insertEntry, isId } from "@/lib/repo";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const password = process.env.APP_PASSWORD;
  if (!password) return "APP_PASSWORD가 설정되지 않았어요.";
  if (!(await checkPassword(String(formData.get("password") ?? ""), password))) {
    await new Promise((r) => setTimeout(r, 800));
    return "비밀번호가 맞지 않아요.";
  }
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export type SaveEntryInput = {
  threadId?: string;
  newThreadTitle?: string;
  concern: string;
  passage: { bookIndex: number; chapter: number; verseStart: number; verseEnd: number };
  drawMode: string;
  rerollCount: number;
  interpretationRaw: string;
  myResponse: string;
};

export async function saveEntry(input: SaveEntryInput): Promise<{ error: string } | { entryId: string; threadId: string }> {
  const concern = input.concern?.trim() ?? "";
  if (!concern) return { error: "고민과 상황을 적어 주세요." };

  const passage = await getPassage(input.passage);
  if (!passage) return { error: "본문을 다시 펼쳐 주세요." };

  let threadId: string;
  if (isId(input.threadId)) {
    if (!(await getThread(input.threadId))) return { error: "줄기를 찾지 못했어요." };
    threadId = input.threadId;
  } else {
    const title = input.newThreadTitle?.trim();
    if (!title) return { error: "줄기를 고르거나 새로 만들어 주세요." };
    threadId = (await createThread(title.slice(0, 100))).id;
  }

  const raw = (input.interpretationRaw ?? "").split("[[ERROR]]")[0].trim();
  const entry = await insertEntry({
    thread_id: threadId,
    concern,
    passage_ref: passage.ref,
    book_index: passage.bookIndex,
    chapter: passage.chapter,
    verse_start: passage.verseStart,
    verse_end: passage.verseEnd,
    passage_text: passageToText(passage),
    draw_mode: ["range", "chapter", "verse", "fixed"].includes(input.drawMode) ? input.drawMode : "range",
    reroll_count: Math.max(0, Math.floor(Number(input.rerollCount) || 0)),
    interpretation: raw ? { ...parseInterpretation(raw), raw } : null,
    my_response: (input.myResponse ?? "").trim(),
  });
  return { entryId: entry.id, threadId };
}
