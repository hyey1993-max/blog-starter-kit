// 해석 요청의 시스템 프롬프트, 맥락 구성, 결과 파싱. 외부 의존 없음.

export type Interpretation = {
  care?: string;
  background: string;
  meaning: string;
  application: string[];
  anchor_sentence: string;
  question: string;
  prayer?: string;
};

/** 모델이 쓰는 단락 제목과 저장 필드의 대응. 순서가 화면 표시 순서다. */
export const SECTIONS = [
  { key: "care", title: "먼저, 마음을 살피며" },
  { key: "background", title: "배경" },
  { key: "meaning", title: "본문의 원래 의미" },
  { key: "application", title: "내 상황에 비추어" },
  { key: "anchor_sentence", title: "오늘 붙잡을 한 문장" },
  { key: "question", title: "나에게 던지는 질문" },
  { key: "prayer", title: "짧은 기도" },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

export const SYSTEM_PROMPT = `당신은 한 사람의 개인 묵상 노트 안에서 성경 본문을 함께 읽어 주는 동반자입니다. 이 사람은 몇 주씩 이어지는 고민을 "줄기"로 묶어 기록하고, 성경을 무작위로 펼쳐 나온 본문을 오늘의 말씀으로 받습니다. 본문은 코드의 난수로 골라졌으니, 본문이 이 상황을 위해 "선택되었다"고 말하지 마세요.

당신의 역할은 해석을 내려 주는 것이 아니라 읽기를 제안하는 것입니다. 분별은 이 사람이 합니다.

## 지켜야 할 것

- 하나님의 뜻을 단정하지 않습니다. "하나님은 당신이 ~하길 원하십니다", "이것이 하나님의 응답입니다" 같은 말을 하지 않습니다.
- 본문의 원래 의미와 오늘의 적용을 분명히 나눕니다. 적용이 본문의 맥락을 벗어나면 벗어난다고 말합니다. 예를 들어 시편의 원수를 향한 탄원을 직장 동료를 향한 저주로 읽거나, 이스라엘 민족에게 주신 약속을 개인의 성공 보장으로 읽지 않도록 짚어 줍니다. 본문이 이 고민과 직접 맞닿지 않으면 억지로 잇지 말고 그렇다고 말한 뒤, 본문이 실제로 말하는 것 가운데 곱씹을 만한 것을 건넵니다.
- "이 말씀이 나왔으니 이렇게 될 것"이라는 예언형, 점괘형 해석을 하지 않습니다.
- 위로만 하지 않습니다. 본문이 이 사람에게 도전하는 지점이 있으면 정직하고 따뜻하게 말합니다.
- 이전 묵상의 맥락이 주어지면 이어서 읽습니다. 그동안 받은 말씀이나 붙잡은 문장과 오늘 본문이 이어지는 지점이 있으면 짚되, 억지로 만들지 않습니다.
- 고민 속에 자해나 자살에 대한 생각, 극심한 무력감, 학대 같은 위험 신호가 보이면 해석보다 마음을 먼저 살핍니다. 그때는 맨 앞에 "먼저, 마음을 살피며" 단락을 두고, 지금의 마음을 알아주고, 믿을 만한 사람이나 전문가(한국: 자살예방상담전화 109, 정신건강위기상담 1577-0199)와 이야기하도록 권합니다. 위험 신호가 없으면 이 단락을 쓰지 않습니다.

## 쓰는 방식

한국어 존댓말로, 차분하고 담백하게 씁니다. 휴대폰 한두 화면 분량이면 충분합니다. 이모지는 쓰지 않습니다. 본문을 길게 다시 옮겨 적지 말고, 필요한 구절만 짧게 인용합니다(본문은 개역한글입니다).

아래 단락 제목을 정확히 이 형식(### 제목)과 순서로 쓰고, 단락 제목 앞뒤에 다른 말을 붙이지 않습니다.

### 배경
책의 저자, 시대, 처음 들은 사람들, 이 장의 앞뒤 흐름을 3~5문장으로.

### 본문의 원래 의미
처음 들은 사람들에게 이 말이 무슨 뜻이었는지. 핵심 단어가 있으면 원어(히브리어·헬라어)의 뜻을 짧게.

### 내 상황에 비추어
줄기의 맥락과 오늘의 고민을 바탕으로 적용 가능성 2~3가지를 "- "로 시작하는 항목으로. 각 항목은 "~로 읽을 수 있어요", "~를 생각해 볼 수 있어요"처럼 제안형으로 씁니다. 본문 맥락을 벗어나기 쉬운 읽기가 있다면 여기서 짚습니다.

### 오늘 붙잡을 한 문장
한 문장. 본문 구절이어도, 본문에서 길어 올린 문장이어도 좋습니다.

### 나에게 던지는 질문
질문 하나.

### 짧은 기도
3~4줄.`;

export type RecentEntry = {
  date: string;
  passageRef: string;
  concern: string;
  anchorSentence?: string;
  myResponse?: string;
};

export type InterpretContext = {
  threadTitle: string;
  threadSummary: string;
  recentEntries: RecentEntry[];
  concern: string;
  passageRef: string;
  passageText: string;
};

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max)}…` : text);
const attr = (text: string) => text.replace(/"/g, "'");

export function buildUserMessage(ctx: InterpretContext): string {
  const parts: string[] = [`<thread title="${attr(ctx.threadTitle)}">`];
  if (ctx.threadSummary.trim()) parts.push(`<summary>\n${ctx.threadSummary.trim()}\n</summary>`);
  if (ctx.recentEntries.length) {
    parts.push("<recent_entries>");
    for (const e of ctx.recentEntries) {
      parts.push(
        [
          `<entry date="${e.date}" passage="${e.passageRef}">`,
          `고민: ${clip(e.concern, 600)}`,
          e.anchorSentence ? `붙잡은 문장: ${e.anchorSentence}` : "",
          e.myResponse ? `나의 응답: ${clip(e.myResponse, 400)}` : "",
          "</entry>",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
    parts.push("</recent_entries>");
  } else {
    parts.push("(이 줄기의 첫 묵상입니다)");
  }
  parts.push("</thread>");
  parts.push(`<today_concern>\n${ctx.concern.trim()}\n</today_concern>`);
  parts.push(`<passage ref="${ctx.passageRef}" translation="개역한글">\n${ctx.passageText}\n</passage>`);
  parts.push("오늘의 고민과 줄기의 맥락을 바탕으로 이 본문을 함께 읽어 주세요.");
  return parts.join("\n\n");
}

/** "### 제목" 단락으로 나뉜 텍스트를 단락 목록으로. 스트리밍 중간 상태에도 쓴다. */
export function splitSections(raw: string): { key: SectionKey | null; title: string; body: string }[] {
  const out: { key: SectionKey | null; title: string; body: string }[] = [];
  const lines = raw.split("\n");
  let current: { key: SectionKey | null; title: string; lines: string[] } | null = null;
  for (const line of lines) {
    const m = line.match(/^#{2,3}\s*(.+?)\s*$/);
    if (m) {
      if (current) out.push({ key: current.key, title: current.title, body: current.lines.join("\n").trim() });
      const title = m[1];
      const section = SECTIONS.find((s) => title.replace(/\s/g, "").startsWith(s.title.replace(/\s/g, "")));
      current = { key: section?.key ?? null, title: section?.title ?? title, lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else if (line.trim()) {
      current = { key: null, title: "", lines: [line] };
    }
  }
  if (current) out.push({ key: current.key, title: current.title, body: current.lines.join("\n").trim() });
  return out;
}

export function parseInterpretation(raw: string): Interpretation {
  const result: Interpretation = { background: "", meaning: "", application: [], anchor_sentence: "", question: "" };
  for (const s of splitSections(raw)) {
    if (!s.key) continue;
    if (s.key === "application") {
      result.application = s.body
        .split(/\n(?=\s*(?:[-•*]|\d+[.)])\s)/)
        .map((item) => item.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, "").trim())
        .filter(Boolean);
    } else {
      result[s.key] = s.body;
    }
  }
  return result;
}
