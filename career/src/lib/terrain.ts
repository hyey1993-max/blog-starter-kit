import { threadOrder } from '../domain/threads';
import type { Passage, PassageWithAffinity, ReflectionAnswers, ThreadId } from '../domain/types';

export type Point = { x: number; y: number };

/**
 * Career terrain: a non-geographic plane where each Thread is a Zone placed
 * on a ring. Positions are explainable (mean of thread anchors), not learned.
 */
export const threadAnchors: Record<ThreadId, Point> = Object.fromEntries(
  threadOrder.map((id, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / threadOrder.length;
    return [id, { x: 0.5 + 0.34 * Math.cos(angle), y: 0.5 + 0.34 * Math.sin(angle) }];
  }),
) as Record<ThreadId, Point>;

function mean(points: Point[]): Point {
  if (!points.length) return { x: 0.5, y: 0.5 };
  return {
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length,
  };
}

/** Small deterministic offset so Passages on the same threads do not overlap. */
function jitter(id: string): Point {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const angle = (h % 360) * (Math.PI / 180);
  const r = 0.035 + ((h >> 9) % 100) / 2500;
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
}

export function passagePoint(passage: Passage): Point {
  const base = mean(passage.threads.map((t) => threadAnchors[t]));
  // Pull toward the centre so points sit inside a Zone rather than on its label.
  const pulled = { x: base.x + (0.5 - base.x) * 0.22, y: base.y + (0.5 - base.y) * 0.22 };
  const j = jitter(passage.id);
  return { x: pulled.x + j.x, y: pulled.y + j.y };
}

/**
 * The Flâneur is never a pin. Their position is a fog whose radius grows
 * with how scattered they say they feel and how far apart their threads lie.
 */
export function wanderingFog(reflection: ReflectionAnswers | null): { center: Point; radius: number } | null {
  if (!reflection) return null;
  const chosen = reflection.answers.thread.selected as ThreadId[];
  const points = chosen.map((t) => threadAnchors[t]);
  const center = mean(points);
  const spread = points.length
    ? Math.max(...points.map((p) => Math.hypot(p.x - center.x, p.y - center.y)))
    : 0.2;
  const recurring = reflection.answers.recurring.selected;
  const unsettled = recurring.includes('scattered') || recurring.includes('lost_place') ? 0.05 : 0;
  return { center, radius: Math.min(0.32, 0.1 + spread * 0.6 + unsettled) };
}

/**
 * Surroundings ordering: Passages sharing more of the Flâneur's threads come
 * first, then the curated order. Explainable; never popularity.
 */
export function orderBySharedThreads(passages: Passage[], reflection: ReflectionAnswers | null): PassageWithAffinity[] {
  const mine = new Set((reflection?.answers.thread.selected ?? []) as ThreadId[]);
  const withShared = passages.map((p, index) => ({
    ...p,
    sharedThreads: p.threads.filter((t) => mine.has(t)),
    index,
  }));
  if (mine.size) withShared.sort((a, b) => b.sharedThreads.length - a.sharedThreads.length || a.index - b.index);
  return withShared.map(({ index: _index, ...rest }) => rest);
}
