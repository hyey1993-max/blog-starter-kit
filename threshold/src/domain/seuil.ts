import type { SeuilLevel } from './types';

export const seuilLabels: Record<SeuilLevel, { label: string; description: string }> = {
  1: { label: '열린 Seuil', description: '거리에서 바로 이어지는 곳' },
  2: { label: '반쯤 열린 Seuil', description: '골목이나 계단 하나를 지나야 닿는 곳' },
  3: { label: '숨은 Seuil', description: '문턱을 넘어야 비로소 보이는 곳' },
};
