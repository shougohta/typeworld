export type Language = 'ja' | 'en';
export type Mode = 'practice' | 'time-attack' | 'ghost-race';
export type GhostId = 'tarou' | 'hanako' | 'alex' | 'sam' | 'watson';

export interface GhostCharacter {
  id: GhostId;
  name: string;
  emoji: string;
  wpm: number;
  level: string;
  description: string;
  color: string;
  bgColor: string;
}

export interface TypingSession {
  id: string;
  mode: Mode;
  language: Language;
  wpm: number;
  accuracy: number;
  duration: number;
  errors: number;
  keystrokes: number;
  createdAt: string;
  ghostId?: GhostId;
  won?: boolean;
}

export interface KeyError {
  key: string;
  errors: number;
  total: number;
}

export interface AbilityStats {
  speed: number;
  accuracy: number;
  stability: number;
  endurance: number;
  reaction: number;
}

export interface UserProfile {
  name: string;
  createdAt: string;
}

export interface TextEntry {
  id: string;
  text: string;
  displayText?: string;
  category: string;
}
