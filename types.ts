
export type Language = 'pt' | 'en' | 'es';

export interface Lever {
  id: string;
  text: string;
}

export interface Goal {
  id: string;
  area: string;
  levers: Lever[];
  color: string;
}

export type LeverStatus = boolean[];

export interface DailyLog {
  [date: string]: {
    [goalId: string]: LeverStatus;
  };
}

export enum ViewMode {
  TODAY = 'TODAY',
  STATS = 'STATS',
  SETTINGS = 'SETTINGS'
}
