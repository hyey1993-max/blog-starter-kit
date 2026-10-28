"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { saveEntry } from "@/app/actions";
import type { DrawMode, DrawScope } from "@/lib/bible-core";
import type { Passage } from "@/lib/bible";
import { InterpretationView } from "./InterpretationView";
import { PassageView } from "./PassageView";

export type ThreadOption = { id: string; title: string; summary: string; entryCount: number };

type Draft = {
  threadChoice: string; // 줄기 id 또는 "new"
  newTitle: string;
  concern: string;
  passage: Passage | null;
  drawMode: DrawMode | "fixed";
  draws: number;
  raw: string;
  myResponse: string;
};

const DRAFT_KEY = "mn_draft_v1";
const SETTINGS_KEY = "mn_draw_settings_v1";
const ERROR_MARK = "[[ERROR]]";

const MODE_LABELS: [DrawMode, string][] = [
  ["range", "5~10절"],
  ["chapter", "한 장"],
  ["verse", "한 절"],
];
const SCOPE_LABELS: [DrawScope, string][] = [
  ["all", "전체"],
  ["OT", "구약"],
  ["NT", "신약"],
];

function emptyDraft(threads: ThreadOption[]): Draft {
  return {
    threadChoice: threads[0]?.id ?? "new",
    newTitle: "",
    concern: "",
    passage: null,
    drawMode: "range",
    draws: 0,
    raw: "",
    myResponse: "",
  };
}

function readStorage<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장소를 못 쓰는 환경(사생활 보호 모드 등)에서는 초안 보관만 포기한다.
  }
}

export function Meditation({ threads }: { threads: ThreadOption[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(threads));
  const [mode, setMode] = useState<DrawMode>("range");
  const [scope, setScope] = useState<DrawScope>("all");
  const [restored, setRestored] = useState(false);
  const [busy, setBusy] = useState<"draw" | "interpret" | "save" | null>(null);
  const [message, setMessage] = useState<{ step: number; text: string } | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualRef, setManualRef] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // 휴대폰에서 탭이 다시 열려도 쓰던 내용이 남도록 초안을 기기에 보관한다.
  useEffect(() => {
    const saved = readStorage<Draft>(DRAFT_KEY);
    if (saved) {
      const threadExists = saved.threadChoice === "new" || threads.some((t) => t.id === saved.threadChoice);
      setDraft({ ...saved, threadChoice: threadExists ? saved.threadChoice : emptyDraft(threads).threadChoice });
    }
    const settings = readStorage<{ mode: DrawMode; scope: DrawScope }>(SETTINGS_KEY);
    if (settings) {
      setMode(settings.mode);
      setScope(settings.scope);
    }
    setRestored(true);
  }, [threads]);

  useEffect(() => {
    if (restored) writeStorage(DRAFT_KEY, draft);
  }, [draft, restored]);

  useEffect(() => {
    if (restored) writeStorage(SETTINGS_KEY, { mode, scope });
  }, [mode, scope, restored]);

  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const selectedThread = threads.find((t) => t.id === draft.threadChoice);
  const threadReady = draft.threadChoice !== "new" || draft.newTitle.trim().length > 0;
  const concernReady = threadReady && draft.concern.trim().length > 0;
  const [interpretation, interpError] = draft.raw.split(ERROR_MARK);

  async function draw() {
    setBusy("draw");
    setMessage(null);
    try {
      const res = await fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, scope }),
      });
      if (!res.ok) throw new Error();
      const passage: Passage = await res.json();
      update({ passage, drawMode: mode, draws: draft.draws + 1, raw: "" });
    } catch {
      setMessage({ step: 2, text: "본문을 펼치지 못했어요. 다시 눌러 주세요." });
    } finally {
      setBusy(null);
    }
  }

  async function openManual() {
    setBusy("draw");
    setMessage(null);
    try {
      const res = await fetch("/api/passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: manualRef }),
      });
      const body = await res.json();
      if (!res.ok) {
        setMessage({ step: 2, text: body.error });
        return;
      }
      update({ passage: body, drawMode: "fixed", raw: "" });
      setManualOpen(false);
    } finally {
      setBusy(null);
    }
  }

  async function interpret() {
    if (!draft.passage) return;
    setBusy("interpret");
    setMessage(null);
    update({ raw: "" });
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          threadId: draft.threadChoice === "new" ? undefined : draft.threadChoice,
          newThreadTitle: draft.threadChoice === "new" ? draft.newTitle : undefined,
          concern: draft.concern,
          passage: draft.passage,
        }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        setMessage({ step: 3, text: body.error ?? "해석을 받지 못했어요." });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        update({ raw: acc });
      }
    } catch (err) {
      if (!controller.signal.aborted) setMessage({ step: 3, text: "연결이 끊겼어요. 다시 받아 주세요." });
    } finally {
      abortRef.current = null;
      setBusy(null);
    }
  }

  async function save() {
    if (!draft.passage) return;
    setBusy("save");
    setMessage(null);
    try {
      const result = await saveEntry({
        threadId: draft.threadChoice === "new" ? undefined : draft.threadChoice,
        newThreadTitle: draft.threadChoice === "new" ? draft.newTitle : undefined,
        concern: draft.concern,
        passage: draft.passage,
        drawMode: draft.drawMode,
        rerollCount: Math.max(0, draft.draws - 1),
        interpretationRaw: interpretation ?? "",
        myResponse: draft.myResponse,
      });
      if ("error" in result) {
        setMessage({ step: 4, text: result.error });
        return;
      }
      writeStorage(DRAFT_KEY, null);
      router.push(`/threads/${result.threadId}?saved=${result.entryId}`);
    } catch {
      setMessage({ step: 4, text: "저장하지 못했어요. 잠시 뒤 다시 눌러 주세요. (쓴 내용은 이 기기에 남아 있어요)" });
    } finally {
      setBusy(null);
    }
  }

  function startOver() {
    abortRef.current?.abort();
    setDraft({ ...emptyDraft(threads), threadChoice: draft.threadChoice });
    setMessage(null);
  }

  const notice = (step: number) =>
    message?.step === step ? <p className="notice error">{message.text}</p> : null;

  return (
    <div>
      <section className="step">
        <div className="step-label">1 · 고민과 상황</div>
        <div className="choices" role="group" aria-label="고민 줄기">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              className="choice"
              aria-pressed={draft.threadChoice === t.id}
              onClick={() => update({ threadChoice: t.id })}
            >
              {t.title}
            </button>
          ))}
          <button
            type="button"
            className="choice"
            aria-pressed={draft.threadChoice === "new"}
            onClick={() => update({ threadChoice: "new" })}
          >
            + 새 줄기
          </button>
        </div>
        {draft.threadChoice === "new" ? (
          <input
            type="text"
            placeholder="줄기 이름 (예: 이직과 커리어 방향)"
            value={draft.newTitle}
            maxLength={100}
            onChange={(e) => update({ newTitle: e.target.value })}
            style={{ marginBottom: 12 }}
          />
        ) : (
          selectedThread && (
            <p className="small">
              이 줄기의 {selectedThread.entryCount + 1}번째 묵상입니다. 줄기 요약과 최근 묵상 3개가 해석에 이어집니다.
            </p>
          )
        )}
        <textarea
          placeholder="지금 붙잡고 있는 고민과 상황을 적어 주세요."
          value={draft.concern}
          onChange={(e) => update({ concern: e.target.value })}
          rows={7}
        />
      </section>

      <section className="step">
        <div className="step-label">2 · 말씀 펼치기</div>
        <div className="row" style={{ marginBottom: 12 }}>
          <div className="seg" role="group" aria-label="펼치는 범위">
            {MODE_LABELS.map(([value, label]) => (
              <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}>
                {label}
              </button>
            ))}
          </div>
          <div className="seg" role="group" aria-label="구약·신약">
            {SCOPE_LABELS.map(([value, label]) => (
              <button key={value} type="button" aria-pressed={scope === value} onClick={() => setScope(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="row">
          <button type="button" onClick={draw} disabled={!concernReady || busy !== null}>
            {draft.passage ? "다시 펼치기" : "말씀 펼치기"}
          </button>
          <button type="button" className="link" onClick={() => setManualOpen((v) => !v)}>
            본문 직접 정하기
          </button>
        </div>
        {draft.draws > 1 && <p className="small">다시 펼친 횟수 {draft.draws - 1}번</p>}
        {manualOpen && (
          <div className="row" style={{ marginTop: 12 }}>
            <input
              type="text"
              placeholder="예: 빌립보서 3:12-16"
              value={manualRef}
              onChange={(e) => setManualRef(e.target.value)}
              style={{ flex: "1 1 200px" }}
            />
            <button type="button" className="secondary" onClick={openManual} disabled={!manualRef.trim() || busy !== null}>
              펴기
            </button>
          </div>
        )}
        {notice(2)}
        {draft.passage && <PassageView refText={draft.passage.ref} verses={draft.passage.verses} />}
      </section>

      {draft.passage && (
        <section className="step">
          <div className="step-label">3 · 해석</div>
          {!draft.raw && busy !== "interpret" && (
            <button type="button" onClick={interpret} disabled={!concernReady || busy !== null}>
              해석 받기
            </button>
          )}
          {(draft.raw || busy === "interpret") && (
            <InterpretationView raw={interpretation ?? ""} streaming={busy === "interpret"} />
          )}
          {interpError && <p className="notice error">{interpError.trim()}</p>}
          {draft.raw && busy === null && (
            <button type="button" className="link" onClick={interpret}>
              해석 다시 받기
            </button>
          )}
          {notice(3)}
        </section>
      )}

      {draft.passage && (
        <section className="step">
          <div className="step-label">4 · 나의 응답</div>
          <textarea
            className="short"
            placeholder="오늘 붙잡은 것, 짧은 기도"
            value={draft.myResponse}
            onChange={(e) => update({ myResponse: e.target.value })}
            rows={3}
          />
          <div className="row" style={{ marginTop: 12 }}>
            <button type="button" onClick={save} disabled={!concernReady || busy !== null}>
              {busy === "save" ? "저장 중…" : "묵상 저장"}
            </button>
            <button type="button" className="link" onClick={startOver} disabled={busy === "save"}>
              처음부터
            </button>
          </div>
          {notice(4)}
        </section>
      )}
    </div>
  );
}
