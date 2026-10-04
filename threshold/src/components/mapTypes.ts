import type { Coordinates, PassageWithDistance } from '../domain/types';

export type SubjectiveMapProps = {
  passages: PassageWithDistance[];
  selectedId: string | null;
  flaneur: Coordinates | null;
  /** Live or archived Tracé line. */
  trace?: Coordinates[];
  onSelect: (passageId: string) => void;
  /** Framing fallback when there is no Flâneur position. */
  center: Coordinates;
};
