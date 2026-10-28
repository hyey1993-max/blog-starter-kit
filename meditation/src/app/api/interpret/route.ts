import Anthropic from "@anthropic-ai/sdk";
import { getPassage, passageToText } from "@/lib/bible";
import { loadThreadContext } from "@/lib/context";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/interpret-core";
import { isId } from "@/lib/repo";

export const maxDuration = 300;

const MODEL = "claude-sonnet-5-5";
/** 스트림 끝에 붙는 오류 표시. 화면에서 이 줄을 찾아 안내로 바꾼다. */
const ERROR_MARK = "\n\n[[ERROR]] ";

function errorMessage(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return "Anthropic API 키가 올바르지 않아요.";
  if (err instanceof Anthropic.RateLimitError) return "요청이 많아 잠시 막혔어요. 조금 뒤에 다시 시도해 주세요.";
  if (err instanceof Anthropic.APIError) return `해석 서버 오류 (${err.status ?? "연결"}). 다시 시도해 주세요.`;
  return "해석을 받는 중 문제가 생겼어요. 다시 시도해 주세요.";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const concern = typeof body?.concern === "string" ? body.concern.trim() : "";
  const threadId = isId(body?.threadId) ? body.threadId : null;
  const newTitle = typeof body?.newThreadTitle === "string" ? body.newThreadTitle.trim() : "";
  const loc = body?.passage;
  if (!concern || concern.length > 8000 || (!threadId && !newTitle) || typeof loc !== "object" || !loc) {
    return Response.json({ error: "고민과 본문을 먼저 정해 주세요." }, { status: 400 });
  }

  const passage = await getPassage({
    bookIndex: Number(loc.bookIndex),
    chapter: Number(loc.chapter),
    verseStart: Number(loc.verseStart),
    verseEnd: Number(loc.verseEnd),
  });
  const thread = await loadThreadContext(threadId, newTitle);
  if (!passage || !thread) return Response.json({ error: "본문이나 줄기를 찾지 못했어요." }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY가 아직 설정되지 않아 해석을 받을 수 없어요. 묵상은 해석 없이도 저장할 수 있어요." },
      { status: 503 },
    );
  }

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    // 안전 분류기가 거절하면 서버가 다른 모델로 이어서 답하게 한다.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium" },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: buildUserMessage({
          threadTitle: thread.title,
          threadSummary: thread.summary,
          recentEntries: thread.recent,
          concern,
          passageRef: passage.ref,
          passageText: passageToText(passage),
        }),
      },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode(`${ERROR_MARK}이번 고민과 본문으로는 해석을 만들지 못했어요.`));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode(`${ERROR_MARK}해석이 너무 길어 중간에 끊겼어요.`));
        }
      } catch (err) {
        console.error("interpret failed", err);
        controller.enqueue(encoder.encode(`${ERROR_MARK}${errorMessage(err)}`));
      }
      controller.close();
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
