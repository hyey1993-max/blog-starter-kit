/**
 * Career-map domain. Same language as the city version, re-grounded:
 * a Passage is a moment of someone's career wandering, Zones are the
 * Threads people keep repeating, and a Dérive is the reflection walk.
 */

/** Work a Flâneur keeps returning to regardless of title or company. */
export type ThreadId =
  | 'set_criteria'
  | 'structure_confusion'
  | 'reveal_hidden'
  | 'translate_between'
  | 'grow_people'
  | 'make_first';

/** The kind of threshold crossed at a career transition. */
export type SeuilKind = 'first' | 'leaving' | 'switching' | 'pause' | 'returning';

export type Passage = {
  id: string;
  title: string;
  /** The observed moment, written by the person who lived it. */
  moment: string;
  /** One question the reader can carry into their own path. */
  carry: string;
  threads: ThreadId[];
  seuil: SeuilKind;
  /** Wandering is shown, not hidden. */
  stillWandering: boolean;
  /** The narrator's stations, in order. */
  stations: string[];
  narrator: string;
  isSample: boolean;
};

export type PassageWithAffinity = Passage & {
  /** Threads shared with the Flâneur's own reflection; empty when unknown. */
  sharedThreads: ThreadId[];
};

export type QuestionKey = 'recurring' | 'hope' | 'evidence' | 'thread' | 'burning' | 'companions' | 'return';

export type Answer = {
  selected: string[];
  /** '직접 적기' text; null when not used. */
  own: string | null;
};

export type ReflectionAnswers = {
  stations: string[];
  answers: Record<QuestionKey, Answer>;
};

/** The archived result of a reflection Dérive. */
export type Trace = {
  id: string;
  createdAt: number;
  reflection: ReflectionAnswers;
};

export type TabKey = 'derive' | 'map' | 'archive' | 'trace';
