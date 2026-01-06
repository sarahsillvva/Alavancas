
import { Goal } from './types';

export const INITIAL_GOALS: Goal[] = [];

export const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'
];

// Função para converter HSL para Hex
export const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const getGoalStyles = (hexColor: string) => {
  return {
    border: { borderColor: `${hexColor}40` }, // 25% opacity
    bg: { backgroundColor: `${hexColor}15` }, // 10% opacity
    text: { color: hexColor },
    bar: hexColor
  };
};

export const getMotivations = (count: number) => {
  if (count === 0) return "O dia apenas começou. Pequenos movimentos importam.";
  if (count < 3) return "Consistência em construção. Continue movendo as alavancas.";
  if (count < 6) return "Ritmo sólido. Cada ação mínima fortalece seu processo.";
  return "Excelente fluxo! O poder está na repetição e presença.";
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
