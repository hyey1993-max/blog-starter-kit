import { StyleSheet, Text, View } from 'react-native';
import type { ReflectionAnswers } from '../domain/types';
import { companionLabels, composeLetter } from '../lib/letter';
import { colors, fonts, space } from '../theme';
import { PathFigure } from './PathFigure';

export function Letter({ reflection }: { reflection: ReflectionAnswers }) {
  const sections = composeLetter(reflection);
  return (
    <View style={styles.root}>
      {sections.map((section) => (
        <View key={section.key} style={styles.section}>
          {section.paragraphs.map((p, i) => (
            <Text key={i} style={styles.paragraph}>
              {p}
            </Text>
          ))}
          {section.practices && section.practices.length > 0 && (
            <View style={styles.practices}>
              {section.practices.map((p, i) => (
                <Text key={i} style={styles.practice}>
                  {p}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
      <PathFigure stations={reflection.stations} companions={companionLabels(reflection)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.xl },
  section: { gap: space.md },
  paragraph: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 34, color: colors.ink },
  practices: { gap: space.md, marginTop: space.sm },
  practice: {
    fontFamily: fonts.serif,
    fontSize: 16,
    lineHeight: 29,
    color: colors.ink,
    borderLeftWidth: 1,
    borderLeftColor: colors.hairline,
    paddingLeft: space.md,
  },
});
