export const colors = {
  paper: '#F4EFE2',
  paperDeep: '#EAE3D2',
  ink: '#1C1B18',
  inkSoft: '#4A4740',
  // Muted text keeps >= 4.5:1 contrast on paper.
  muted: '#625E55',
  line: '#D3CBB8',
  flaneur: '#8A3B2E',
  trace: '#8A3B2E',
  overlay: 'rgba(28, 27, 24, 0.32)',
} as const;

export const fonts = {
  serif: 'PTSerif_400Regular',
  serifItalic: 'PTSerif_400Regular_Italic',
  serifBold: 'PTSerif_700Bold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
} as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 } as const;

/** Minimum comfortable touch target. */
export const touchTarget = 44;
