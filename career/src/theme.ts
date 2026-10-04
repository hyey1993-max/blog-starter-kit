/** Palette shared with 돌아보는 길: dusk-grey ground, ink, one lamp accent. */
export const colors = {
  ground: '#DCDFD8',
  sheet: '#E6E8E2',
  ink: '#23262C',
  muted: '#525752',
  hairline: '#B3B7B1',
  /** Decorative only (lines, glow). Never body text on ground. */
  lamp: '#E3AE52',
  /** Lamp tone that keeps >= 4.5:1 for text on ground. */
  lampText: '#7A5512',
  overlay: 'rgba(35, 38, 44, 0.32)',
} as const;

export const fonts = {
  serif: 'GowunBatang_400Regular',
  serifBold: 'GowunBatang_700Bold',
} as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 } as const;

export const touchTarget = 44;
