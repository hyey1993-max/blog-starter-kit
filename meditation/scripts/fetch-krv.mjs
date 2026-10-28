// 개역한글(1961, 저작권 만료) 본문을 고정된 커밋에서 받아 해시를 확인한 뒤
// data/krv/ 아래에 책별 JSON과 메타데이터로 나눠 저장한다.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_COMMIT = "df0860fe0921b5b899d1b554041900ab072cd4c4";
const SOURCE_URL = `https://raw.githubusercontent.com/thiagobodruk/bible/${SOURCE_COMMIT}/json/ko_krv.json`;
const SOURCE_SHA256 = "5b76e6372773aca94806042de7874d2ae9e1f45b581bf5d0f2b3d0fb12e93d49";

// 원본의 약칭 표기를 개역한글 성경의 책 이름으로 맞춘다.
const NAME_FIXES = { "요한2서": "요한이서", "요한3서": "요한삼서" };

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "..", "data", "krv");
const metaPath = path.join(outDir, "meta.json");

if (existsSync(metaPath)) {
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  if (meta.source === SOURCE_SHA256) process.exit(0);
}

const res = await fetch(SOURCE_URL);
if (!res.ok) throw new Error(`개역한글 본문을 받지 못했습니다: ${res.status} ${SOURCE_URL}`);
const raw = Buffer.from(await res.arrayBuffer());
const digest = createHash("sha256").update(raw).digest("hex");
if (digest !== SOURCE_SHA256) {
  throw new Error(`개역한글 본문 해시가 다릅니다 (기대 ${SOURCE_SHA256}, 실제 ${digest})`);
}

const books = JSON.parse(raw.toString("utf8").replace(/^﻿/, ""));
if (books.length !== 66) throw new Error(`책 수가 66이 아닙니다: ${books.length}`);

mkdirSync(outDir, { recursive: true });
const meta = {
  source: SOURCE_SHA256,
  books: books.map((book, i) => ({
    index: i,
    name: NAME_FIXES[book.name] ?? book.name,
    testament: i < 39 ? "OT" : "NT",
    verses: book.chapters.map((chapter) => chapter.length),
  })),
};
books.forEach((book, i) => {
  writeFileSync(path.join(outDir, `${i}.json`), JSON.stringify(book.chapters));
});
writeFileSync(metaPath, JSON.stringify(meta));
console.log(`개역한글 본문 준비 완료: ${books.length}권 → ${outDir}`);
