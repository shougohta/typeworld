import { AbilityStats, KeyError, TypingSession } from '@/types';

export function calcWpm(chars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return Math.round((chars / 5) / (elapsedMs / 60000));
}

export function calcAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 1000) / 10;
}

export function calcAbilityStats(sessions: TypingSession[], keyErrors: KeyError[]): AbilityStats {
  if (sessions.length === 0) {
    return { speed: 0, accuracy: 0, stability: 0, endurance: 0, reaction: 0 };
  }

  const WORLD_RECORD_WPM = 320;
  const wpms = sessions.map((s) => s.wpm);
  const maxWpm = Math.max(...wpms);
  const avgAccuracy = sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length;

  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
  const variance = wpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpms.length;
  const stdDev = Math.sqrt(variance);
  const stabilityRaw = Math.max(0, 100 - (stdDev / mean) * 100);

  const longSessions = sessions.filter((s) => s.duration > 30000);
  const enduranceRaw =
    longSessions.length > 0
      ? (longSessions.reduce((a, s) => a + s.wpm, 0) / longSessions.length / maxWpm) * 100
      : 50;

  const totalErrors = keyErrors.reduce((a, k) => a + k.errors, 0);
  const totalKeystrokes = keyErrors.reduce((a, k) => a + k.total, 0);
  const errorRate = totalKeystrokes > 0 ? totalErrors / totalKeystrokes : 0;
  const reactionRaw = Math.max(0, 100 - errorRate * 200);

  return {
    speed: Math.min(100, Math.round((maxWpm / WORLD_RECORD_WPM) * 100)),
    accuracy: Math.min(100, Math.round(avgAccuracy)),
    stability: Math.min(100, Math.round(stabilityRaw)),
    endurance: Math.min(100, Math.round(enduranceRaw)),
    reaction: Math.min(100, Math.round(reactionRaw)),
  };
}

export function updateKeyErrors(
  prev: KeyError[],
  key: string,
  isError: boolean
): KeyError[] {
  const existing = prev.find((k) => k.key === key);
  if (existing) {
    return prev.map((k) =>
      k.key === key
        ? { ...k, total: k.total + 1, errors: k.errors + (isError ? 1 : 0) }
        : k
    );
  }
  return [...prev, { key, total: 1, errors: isError ? 1 : 0 }];
}

export function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
