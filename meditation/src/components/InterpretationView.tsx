import { Fragment } from "react";
import { splitSections } from "@/lib/interpret-core";

/** **굵게** 정도만 살리고 나머지는 글자 그대로 보여 준다. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

function Body({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim());
  return (
    <>
      {blocks.map((block, i) => {
        if (/^\s*(?:[-•*]|\d+[.)])\s/.test(block)) {
          const items = block
            .split(/\n(?=\s*(?:[-•*]|\d+[.)])\s)/)
            .map((item) => item.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, ""));
          return (
            <ul key={i}>
              {items.map((item, j) => (
                <li key={j} className="prewrap">
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="prewrap">
            <Inline text={block} />
          </p>
        );
      })}
    </>
  );
}

export function InterpretationView({ raw, streaming = false }: { raw: string; streaming?: boolean }) {
  const sections = splitSections(raw);
  return (
    <div className="interp">
      {sections.map((s, i) => (
        <section key={i} className={s.key === "care" ? "care" : undefined}>
          {s.title && <h3>{s.title}</h3>}
          {s.key === "anchor_sentence" ? (
            <p className="anchor">
              <Inline text={s.body} />
            </p>
          ) : (
            <Body text={s.body} />
          )}
        </section>
      ))}
      {streaming && <p className="small pulse">{sections.length ? "이어서 쓰는 중…" : "본문을 읽고 있어요…"}</p>}
    </div>
  );
}
