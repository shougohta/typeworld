'use client';

import { KeyError, Language, TypingSession, UserProfile } from '@/types';

const KEYS = {
  user: 'tw_user',
  sessions: 'tw_sessions',
  keyErrors: 'tw_key_errors',
  language: 'tw_language',
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getUser: (): UserProfile | null => read<UserProfile | null>(KEYS.user, null),
  setUser: (user: UserProfile) => write(KEYS.user, user),
  clearUser: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(KEYS.user);
  },

  getSessions: (): TypingSession[] => read<TypingSession[]>(KEYS.sessions, []),
  addSession: (session: TypingSession) => {
    const sessions = read<TypingSession[]>(KEYS.sessions, []);
    write(KEYS.sessions, [session, ...sessions].slice(0, 500));
  },

  getKeyErrors: (): KeyError[] => read<KeyError[]>(KEYS.keyErrors, []),
  setKeyErrors: (errors: KeyError[]) => write(KEYS.keyErrors, errors),

  getLanguage: (): Language => read<Language>(KEYS.language, 'ja'),
  setLanguage: (lang: Language) => write(KEYS.language, lang),
};
