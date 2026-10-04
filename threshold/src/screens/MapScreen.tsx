import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PassageCard } from '../components/PassageCard';
import { SubjectiveMap } from '../components/SubjectiveMap';
import type { Coordinates, PassageWithDistance } from '../domain/types';
import { track } from '../lib/analytics';
import { colors, fonts, space } from '../theme';

/** Beyond this, Surroundings are considered empty and we say so plainly. */
const NEARBY_LIMIT_METERS = 3000;

type Props = {
  passages: PassageWithDistance[];
  flaneur: Coordinates | null;
  center: Coordinates;
  onOpenPassage: (passage: PassageWithDistance) => void;
};

export function MapScreen({ passages, flaneur, center, onOpenPassage }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(passages[0]?.id ?? null);
  const selected = passages.find((p) => p.id === selectedId) ?? passages[0] ?? null;
  const nearest = passages[0];
  const nothingNearby =
    nearest !== undefined && nearest.distanceMeters !== null && nearest.distanceMeters > NEARBY_LIMIT_METERS;

  useEffect(() => {
    if (!selectedId && passages[0]) setSelectedId(passages[0].id);
  }, [passages, selectedId]);

  const select = (id: string) => {
    setSelectedId(id);
    track({ name: 'passage_marker_selected', passageId: id });
  };

  return (
    <View style={styles.root}>
      <SubjectiveMap
        passages={passages}
        selectedId={selected?.id ?? null}
        flaneur={flaneur}
        onSelect={select}
        center={center}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        {nothingNearby && (
          <Text style={styles.note} accessibilityLiveRegion="polite">
            가까운 Passage가 아직 없어요. 가장 가까운 곳부터 보여드려요.
          </Text>
        )}
        {selected ? (
          <PassageCard passage={selected} onOpen={() => onOpenPassage(selected)} />
        ) : (
          <Text style={styles.note}>아직 기록된 Passage가 없어요.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { position: 'absolute', left: space.md, right: space.md, bottom: space.md, gap: space.sm },
  note: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    backgroundColor: colors.paper,
    padding: space.sm,
    alignSelf: 'flex-start',
  },
});
