// 파일·DB에 의존하지 않는 성경 관련 순수 함수들. 본문 선택은 반드시 여기서 코드의 난수로 한다.

export type Testament = "OT" | "NT";
export type DrawMode = "range" | "chapter" | "verse";
export type DrawScope = "all" | Testament;

export type BookMeta = {
  index: number;
  name: string;
  testament: Testament;
  /** 장별 절 수. verses[0]이 1장. */
  verses: number[];
};

export type PassageLocation = {
  bookIndex: number;
  chapter: number;
  verseStart: number;
  verseEnd: number;
};

/** [min, max) 범위의 정수를 돌려주는 난수 함수. 서버에서는 crypto.randomInt를 넘긴다. */
export type RandomInt = (min: number, max: number) => number;

export const RANGE_MIN = 5;
export const RANGE_MAX = 10;

export function drawLocation(
  books: BookMeta[],
  mode: DrawMode,
  scope: DrawScope,
  randomInt: RandomInt,
): PassageLocation {
  const pool = scope === "all" ? books : books.filter((b) => b.testament === scope);
  const book = pool[randomInt(0, pool.length)];
  const chapter = randomInt(1, book.verses.length + 1);
  const count = book.verses[chapter - 1];

  if (mode === "chapter") return { bookIndex: book.index, chapter, verseStart: 1, verseEnd: count };
  if (mode === "verse") {
    const v = randomInt(1, count + 1);
    return { bookIndex: book.index, chapter, verseStart: v, verseEnd: v };
  }

  const length = randomInt(RANGE_MIN, RANGE_MAX + 1);
  if (count <= length) return { bookIndex: book.index, chapter, verseStart: 1, verseEnd: count };
  const start = randomInt(1, count - length + 2);
  return { bookIndex: book.index, chapter, verseStart: start, verseEnd: start + length - 1 };
}

export function isValidLocation(books: BookMeta[], loc: PassageLocation): boolean {
  const book = books[loc.bookIndex];
  if (!book || !Number.isInteger(loc.chapter)) return false;
  const count = book.verses[loc.chapter - 1];
  return (
    count !== undefined &&
    Number.isInteger(loc.verseStart) &&
    Number.isInteger(loc.verseEnd) &&
    loc.verseStart >= 1 &&
    loc.verseStart <= loc.verseEnd &&
    loc.verseEnd <= count
  );
}

export function formatRef(books: BookMeta[], loc: PassageLocation): string {
  const book = books[loc.bookIndex];
  const count = book.verses[loc.chapter - 1];
  const unit = book.name === "시편" ? "편" : "장";
  if (loc.verseStart === 1 && loc.verseEnd === count) return `${book.name} ${loc.chapter}${unit}`;
  if (loc.verseStart === loc.verseEnd) return `${book.name} ${loc.chapter}:${loc.verseStart}`;
  return `${book.name} ${loc.chapter}:${loc.verseStart}-${loc.verseEnd}`;
}

/**
 * "빌립보서 3:12-16", "예레미야 51:36", "시편 23편", "요한복음 3장 16절" 같은 표기를 위치로 바꾼다.
 * 책 이름은 정확히 같거나, 한 권으로만 좁혀지는 앞부분이면 받아들인다.
 */
export function parseRef(books: BookMeta[], input: string): PassageLocation | null {
  const m = input
    .trim()
    .match(/^(.+?)\s*(\d+)\s*(?:[장편:]\s*(?:(\d+)\s*절?\s*(?:[-~–]\s*(\d+)\s*절?)?)?)?$/);
  if (!m) return null;
  const name = m[1].replace(/\s+/g, "");
  const book =
    books.find((b) => b.name === name) ??
    (() => {
      const matches = books.filter((b) => b.name.startsWith(name));
      return matches.length === 1 ? matches[0] : undefined;
    })();
  if (!book) return null;

  const chapter = Number(m[2]);
  const count = book.verses[chapter - 1];
  if (count === undefined) return null;
  const verseStart = m[3] ? Number(m[3]) : 1;
  const verseEnd = m[4] ? Number(m[4]) : m[3] ? verseStart : count;
  const loc = { bookIndex: book.index, chapter, verseStart, verseEnd };
  return isValidLocation(books, loc) ? loc : null;
}
