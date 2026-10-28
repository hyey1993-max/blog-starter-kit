import { randomInt } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  type BookMeta,
  type DrawMode,
  type DrawScope,
  type PassageLocation,
  drawLocation,
  formatRef,
  isValidLocation,
} from "./bible-core";

export type Verse = { n: number; text: string };
export type Passage = PassageLocation & { bookName: string; ref: string; verses: Verse[] };

const dataDir = path.join(process.cwd(), "data", "krv");

let booksPromise: Promise<BookMeta[]> | undefined;
const chapterCache = new Map<number, Promise<string[][]>>();

export function getBooks(): Promise<BookMeta[]> {
  booksPromise ??= readFile(path.join(dataDir, "meta.json"), "utf8").then(
    (text) => JSON.parse(text).books as BookMeta[],
  );
  return booksPromise;
}

function getBookText(index: number): Promise<string[][]> {
  let cached = chapterCache.get(index);
  if (!cached) {
    cached = readFile(path.join(dataDir, `${index}.json`), "utf8").then((t) => JSON.parse(t));
    chapterCache.set(index, cached);
  }
  return cached;
}

export async function getPassage(loc: PassageLocation): Promise<Passage | null> {
  const books = await getBooks();
  if (!isValidLocation(books, loc)) return null;
  const chapters = await getBookText(loc.bookIndex);
  const verses: Verse[] = [];
  for (let n = loc.verseStart; n <= loc.verseEnd; n++) {
    verses.push({ n, text: chapters[loc.chapter - 1][n - 1] });
  }
  return { ...loc, bookName: books[loc.bookIndex].name, ref: formatRef(books, loc), verses };
}

export async function drawPassage(mode: DrawMode, scope: DrawScope): Promise<Passage> {
  const books = await getBooks();
  const passage = await getPassage(drawLocation(books, mode, scope, randomInt));
  if (!passage) throw new Error("본문을 펼치지 못했습니다");
  return passage;
}

export function passageToText(passage: Pick<Passage, "verses">): string {
  return passage.verses.map((v) => `${v.n} ${v.text}`).join("\n");
}
