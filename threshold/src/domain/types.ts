export type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Seuil: how much of a threshold a Flâneur crosses to enter a Passage.
 * 1 = open to the street, 2 = half-open, 3 = hidden behind a boundary.
 * Detail metadata only; not a main-screen filter (see product-decisions.md).
 */
export type SeuilLevel = 1 | 2 | 3;

export type Passage = {
  id: string;
  name: string;
  zone: string;
  coordinates: Coordinates;
  seuil: SeuilLevel;
  /** Human curator observation, written by the curator. */
  observation: string;
  curator: string;
  contextTags: string[];
  practical: {
    hours?: string;
    accessibility?: string;
  };
  /** Placeholder content that must be replaced by real curation before launch. */
  isSample: boolean;
};

export type PassageWithDistance = Passage & {
  /** Straight-line meters, null when the Flâneur location is unknown. */
  distanceMeters: number | null;
};

export type TraceObservation =
  | { id: string; kind: 'text'; text: string; recordedAt: number; at: Coordinates | null }
  | { id: string; kind: 'photo'; uri: string; recordedAt: number; at: Coordinates | null };

/** The archived trace produced by a Dérive. */
export type Trace = {
  id: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  distanceMeters: number;
  stepEstimate: number;
  path: Coordinates[];
  observations: TraceObservation[];
};

/** Internal tab states; visible labels follow the Figma design. */
export type TabKey = 'derive' | 'map' | 'archive' | 'trace';
