import assert from "node:assert/strict";
import { randomInt } from "node:crypto";
import { test } from "node:test";
import { drawLocation, formatRef, isValidLocation, parseRef } from "../src/lib/bible-core.ts";

// 실제 메타데이터 일부를 흉내 낸 작은 성경
const books = [
  { index: 0, name: "시편", testament: "OT", verses: [6, 12, 8] },
  { index: 1, name: "예레미야", testament: "OT", verses: [19, 37] },
  { index: 2, name: "예레미야애가", testament: "OT", verses: [22] },
  { index: 3, name: "요한복음", testament: "NT", verses: [51, 25, 36] },
  { index: 4, name: "요한일서", testament: "NT", verses: [10, 29] },
  { index: 5, name: "빌립보서", testament: "NT", verses: [30, 30, 21, 23] },
  { index: 6, name: "오바댜", testament: "OT", verses: [3] },
];

test("범위 모드: 항상 유효하고 5~10절, 장이 짧으면 장 전체", () => {
  for (let i = 0; i < 5000; i++) {
    const loc = drawLocation(books, "range", "all", randomInt);
    assert.ok(isValidLocation(books, loc), JSON.stringify(loc));
    const len = loc.verseEnd - loc.verseStart + 1;
    const count = books[loc.bookIndex].verses[loc.chapter - 1];
    if (count >= 10) assert.ok(len >= 5 && len <= 10, `len ${len}`);
    else assert.ok(len >= Math.min(5, count) && len <= count);
  }
});

test("구약/신약만 펼치기", () => {
  for (let i = 0; i < 1000; i++) {
    assert.equal(books[drawLocation(books, "range", "NT", randomInt).bookIndex].testament, "NT");
    assert.equal(books[drawLocation(books, "verse", "OT", randomInt).bookIndex].testament, "OT");
  }
});

test("한 장 / 한 절 모드", () => {
  for (let i = 0; i < 500; i++) {
    const ch = drawLocation(books, "chapter", "all", randomInt);
    assert.equal(ch.verseStart, 1);
    assert.equal(ch.verseEnd, books[ch.bookIndex].verses[ch.chapter - 1]);
    const v = drawLocation(books, "verse", "all", randomInt);
    assert.equal(v.verseStart, v.verseEnd);
  }
});

test("모든 책이 고르게 나온다 (특정 책으로 쏠리지 않음)", () => {
  const counts = new Array(books.length).fill(0);
  const n = 70000;
  for (let i = 0; i < n; i++) counts[drawLocation(books, "range", "all", randomInt).bookIndex]++;
  for (const c of counts) assert.ok(Math.abs(c / n - 1 / books.length) < 0.01, counts.join(","));
});

test("참조 표기 해석", () => {
  assert.deepEqual(parseRef(books, "빌립보서 3:12-16"), { bookIndex: 5, chapter: 3, verseStart: 12, verseEnd: 16 });
  assert.deepEqual(parseRef(books, "예레미야 2:36-37"), { bookIndex: 1, chapter: 2, verseStart: 36, verseEnd: 37 });
  assert.deepEqual(parseRef(books, "시편 2편"), { bookIndex: 0, chapter: 2, verseStart: 1, verseEnd: 12 });
  assert.deepEqual(parseRef(books, "요한복음 3장 16절"), { bookIndex: 3, chapter: 3, verseStart: 16, verseEnd: 16 });
  assert.deepEqual(parseRef(books, "요한복음 1:1~5"), { bookIndex: 3, chapter: 1, verseStart: 1, verseEnd: 5 });
  assert.deepEqual(parseRef(books, "빌립 1:3"), { bookIndex: 5, chapter: 1, verseStart: 3, verseEnd: 3 });
  assert.equal(parseRef(books, "요한 1:1"), null, "요한복음/요한일서 중 하나로 좁혀지지 않음");
  assert.equal(parseRef(books, "빌립보서 5:1"), null);
  assert.equal(parseRef(books, "빌립보서 3:20-40"), null);
  assert.equal(parseRef(books, "아무말"), null);
});

test("참조 표기 만들기", () => {
  assert.equal(formatRef(books, { bookIndex: 5, chapter: 3, verseStart: 12, verseEnd: 16 }), "빌립보서 3:12-16");
  assert.equal(formatRef(books, { bookIndex: 0, chapter: 2, verseStart: 1, verseEnd: 12 }), "시편 2편");
  assert.equal(formatRef(books, { bookIndex: 3, chapter: 2, verseStart: 1, verseEnd: 25 }), "요한복음 2장");
  assert.equal(formatRef(books, { bookIndex: 3, chapter: 3, verseStart: 16, verseEnd: 16 }), "요한복음 3:16");
});
