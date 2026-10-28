import assert from "node:assert/strict";
import { test } from "node:test";
import { buildUserMessage, parseInterpretation, splitSections } from "../src/lib/interpret-core.ts";

const sample = `### 배경
바울이 감옥에서 빌립보 교회에 쓴 편지입니다.

### 본문의 원래 의미
"좇아가노라"(디오코)는 달리기 경주의 말입니다.

### 내 상황에 비추어
- 구조조정을 "뒤에 있는 것"으로 읽을 수 있어요.
여러 줄로 이어지는 설명입니다.
- 15절을 기다림으로 읽을 수 있어요.

### 오늘 붙잡을 한 문장
하나님이 이것도 너희에게 나타내시리라

### 나에게 던지는 질문
지금 무엇을 붙잡으려고 좇아가고 있나요?

### 짧은 기도
주님, 뒤에 있는 것을 내려놓게 하소서.`;

test("단락을 필드로 나눈다", () => {
  const r = parseInterpretation(sample);
  assert.match(r.background, /빌립보 교회/);
  assert.match(r.meaning, /디오코/);
  assert.equal(r.application.length, 2);
  assert.match(r.application[0], /여러 줄로/);
  assert.equal(r.anchor_sentence, "하나님이 이것도 너희에게 나타내시리라");
  assert.match(r.question, /좇아가고/);
  assert.match(r.prayer, /주님/);
  assert.equal(r.care, undefined);
});

test("마음 살피기 단락과 스트리밍 중간 상태", () => {
  const r = parseInterpretation("### 먼저, 마음을 살피며\n많이 지치셨겠어요.\n\n### 배경\n예레미야는");
  assert.match(r.care, /지치셨/);
  assert.equal(r.background, "예레미야는");
  const partial = splitSections("### 배경\n바울이 감");
  assert.deepEqual(partial.map((s) => s.key), ["background"]);
});

test("맥락 메시지에 줄기 요약, 최근 묵상, 오늘 본문이 들어간다", () => {
  const msg = buildUserMessage({
    threadTitle: '이직과 "커리어"',
    threadSummary: "구조조정 이후 방향을 찾는 중",
    recentEntries: [{ date: "2026-10-20", passageRef: "시편 23편", concern: "불안", anchorSentence: "부족함이 없으리로다" }],
    concern: "오늘의 고민",
    passageRef: "빌립보서 3:12-16",
    passageText: "12 내가 이미 얻었다 함도 아니요",
  });
  assert.match(msg, /<thread title="이직과 '커리어'">/);
  assert.match(msg, /<summary>\n구조조정/);
  assert.match(msg, /붙잡은 문장: 부족함이 없으리로다/);
  assert.match(msg, /<passage ref="빌립보서 3:12-16" translation="개역한글">/);
  const first = buildUserMessage({ threadTitle: "t", threadSummary: "", recentEntries: [], concern: "c", passageRef: "r", passageText: "p" });
  assert.match(first, /첫 묵상/);
  assert.doesNotMatch(first, /<summary>/);
});
