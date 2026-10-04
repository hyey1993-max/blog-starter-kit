/** Final-consonant index of the last spoken syllable: 0 none, 8 = ㄹ. */
function finalConsonant(word: string): number {
  const trimmed = word.replace(/[\s'"’”)\].,!?…]+$/u, '');
  const ch = trimmed.at(-1);
  if (!ch) return 0;
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28;
  // Sino-Korean readings of digits: 영 일 이 삼 사 오 육 칠 팔 구
  const digitFinals: Record<string, number> = { '0': 21, '1': 8, '2': 0, '3': 16, '4': 0, '5': 0, '6': 1, '7': 8, '8': 8, '9': 0 };
  if (ch in digitFinals) return digitFinals[ch]!;
  return 0;
}

const pairs = {
  을: ['을', '를'],
  를: ['을', '를'],
  이: ['이', '가'],
  가: ['이', '가'],
  은: ['은', '는'],
  는: ['은', '는'],
  과: ['과', '와'],
  와: ['과', '와'],
  이에요: ['이에요', '예요'],
  예요: ['이에요', '예요'],
  이었: ['이었', '였'],
  였: ['이었', '였'],
  이라는: ['이라는', '라는'],
  라는: ['이라는', '라는'],
} as const;

export type Josa = keyof typeof pairs | '으로' | '로';

export function withJosa(word: string, josa: Josa): string {
  const final = finalConsonant(word);
  if (josa === '으로' || josa === '로') return word + (final === 0 || final === 8 ? '로' : '으로');
  const [withFinal, withoutFinal] = pairs[josa];
  return word + (final === 0 ? withoutFinal : withFinal);
}

/** Fills `{key}` placeholders, correcting a particle written right after one. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(
    /\{(\w+)\}(이라는|라는|이에요|예요|이었|였|으로|로|을|를|이|가|은|는|과|와)?/g,
    (_, key: string, josa?: Josa) => {
      const value = values[key] ?? '';
      return josa ? withJosa(value, josa) : value;
    },
  );
}

/** "A", "A와 B", "A, B와 C" */
export function joinKo(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  const head = items.slice(0, -1);
  const last = head.pop()!;
  return [...head, withJosa(last, '와')].join(', ') + ' ' + items.at(-1);
}

export const quote = (text: string) => `'${text}'`;
