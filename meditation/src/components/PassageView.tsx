export function PassageView({ refText, verses }: { refText: string; verses: { n: number; text: string }[] }) {
  return (
    <div className="passage">
      <div className="ref">{refText}</div>
      {verses.map((v) => (
        <p key={v.n}>
          <sup>{v.n}</sup>
          {v.text}
        </p>
      ))}
      <div className="small">개역한글</div>
    </div>
  );
}

/** DB에 저장된 "12 내가 …" 줄 형식을 절 목록으로 되돌린다. */
export function versesFromText(text: string | null): { n: number; text: string }[] {
  if (!text) return [];
  return text.split("\n").flatMap((line) => {
    const m = line.match(/^(\d+)\s(.*)$/);
    return m ? [{ n: Number(m[1]), text: m[2] }] : [];
  });
}
