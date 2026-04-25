'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInputState,
  InputState,
  processKey,
  buildRomajiGuide,
  getCompletedKanaEnd,
} from '@/lib/romaji-engine';
import { JaTextEntry } from '@/lib/texts';
import { calcAccuracy, calcWpm } from '@/lib/typing-utils';

export interface TypingResult {
  wpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  keystrokes: number;
}

interface Props {
  language: 'ja' | 'en';
  jaEntry?: JaTextEntry;
  text?: string;
  onComplete: (result: TypingResult) => void;
  onProgress?: (wpm: number, accuracy: number, progress: number) => void;
  onKeyStroke?: (key: string, isError: boolean) => void;
}

// ── Japanese furigana + romaji display ─────────────────────────────────────

function JaDisplay({ jaEntry, jaState, shaking, done }: {
  jaEntry: JaTextEntry; jaState: InputState; shaking: boolean; done: boolean;
}) {
  const completedKanaEnd = getCompletedKanaEnd(jaState);
  const guide = buildRomajiGuide(jaState);

  let kanaPos = 0;
  const segRanges = jaEntry.segments.map((seg) => {
    const len = seg.ruby ? seg.ruby.length : seg.text.length;
    const range = { start: kanaPos, end: kanaPos + len };
    kanaPos += len;
    return range;
  });

  return (
    <div>
      {/* Furigana text */}
      <div className="text-2xl font-bold tracking-wider mb-5 leading-loose text-center select-none">
        {jaEntry.segments.map((seg, i) => {
          const r = segRanges[i];
          let cls = 'text-gray-600';
          if (r.end <= completedKanaEnd) cls = 'text-emerald-400';
          else if (r.start <= completedKanaEnd) cls = 'text-white';

          return seg.ruby ? (
            <ruby key={i} className={cls}>
              {seg.text}
              <rt className="text-xs font-normal">{seg.ruby}</rt>
            </ruby>
          ) : (
            <span key={i} className={cls}>{seg.text}</span>
          );
        })}
        {done && <span className="ml-1 text-violet-400">✓</span>}
      </div>

      {/* Romaji guide */}
      <div
        className={`font-mono text-xl leading-relaxed tracking-wide select-none p-6 rounded-xl transition-transform ${shaking ? 'translate-x-1' : ''}`}
        style={{ background: 'var(--card)', border: `1px solid ${shaking ? '#ef4444' : 'var(--border)'}` }}
      >
        {(() => {
          let firstPending = true;
          return guide.map((g, i) => {
            let cls = 'text-gray-600';
            if (g.status === 'done') cls = 'text-emerald-400';
            else if (g.status === 'active-typed') cls = 'text-cyan-400';
            else if (g.status === 'active-pending') {
              if (firstPending) {
                firstPending = false;
                cls = shaking ? 'cursor-char text-red-400' : 'cursor-char text-white';
              } else {
                cls = 'text-gray-400';
              }
            }
            return <span key={i} className={cls}>{g.char}</span>;
          });
        })()}
      </div>
    </div>
  );
}

// ── English display ─────────────────────────────────────────────────────────

function EnDisplay({ text, typed, shaking, done }: {
  text: string; typed: string; shaking: boolean; done: boolean;
}) {
  return (
    <div
      className={`font-mono text-xl leading-relaxed tracking-wide select-none p-6 rounded-xl transition-transform ${shaking ? 'translate-x-1' : ''}`}
      style={{ background: 'var(--card)', border: `1px solid ${shaking ? '#ef4444' : 'var(--border)'}` }}
    >
      {text.split('').map((ch, i) => {
        let cls = 'text-gray-600';
        if (i < typed.length) cls = 'text-emerald-400';
        else if (i === typed.length) cls = shaking ? 'cursor-char text-red-400' : 'cursor-char text-white';
        return <span key={i} className={cls}>{ch}</span>;
      })}
      {done && <span className="ml-1 text-violet-400">✓</span>}
    </div>
  );
}

// ── Main TypingArea ─────────────────────────────────────────────────────────

export default function TypingArea({ language, jaEntry, text, onComplete, onProgress, onKeyStroke }: Props) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [done, setDone] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);

  const [jaState, setJaState] = useState<InputState | null>(null);
  const [enTyped, setEnTyped] = useState('');
  const [enErrors, setEnErrors] = useState(0);
  const [enAttempts, setEnAttempts] = useState(0);

  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setDone(false);
    setShaking(false);
    setWpmHistory([]);
    if (language === 'ja' && jaEntry) {
      setJaState(createInputState(jaEntry.kana));
    } else {
      setJaState(null);
      setEnTyped('');
      setEnErrors(0);
      setEnAttempts(0);
    }
  }, [language, jaEntry, text]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (done) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;
      e.preventDefault();

      const now = Date.now();
      if (!startRef.current) {
        startRef.current = now;
        setStartTime(now);
      }
      const elapsed = now - startRef.current;

      // ── Japanese ──
      if (language === 'ja' && jaState) {
        const { state: ns, result } = processKey(jaState, e.key);
        onKeyStroke?.(e.key, !result.ok);

        if (!result.ok) {
          setShaking(true);
          setTimeout(() => setShaking(false), 200);
          setJaState(ns);
          return;
        }

        setJaState(ns);

        if (result.atomCompleted) {
          const prog = ns.atomIndex / Math.max(1, ns.atoms.length);
          const newWpm = calcWpm(ns.atomIndex, elapsed);
          const newAcc = calcAccuracy(ns.atomIndex, ns.attempts);
          setWpm(newWpm);
          setAccuracy(newAcc);
          setWpmHistory((h) => [...h.slice(-19), newWpm]);
          onProgress?.(newWpm, newAcc, prog);

          if (result.allDone) {
            setDone(true);
            onComplete({ wpm: newWpm, accuracy: newAcc, errors: ns.errors, duration: elapsed, keystrokes: ns.attempts });
          }
        }
        return;
      }

      // ── English ──
      if (language === 'en' && text) {
        const idx = enTyped.length;
        if (idx >= text.length) return;

        const isError = e.key !== text[idx];
        const newAttempts = enAttempts + 1;
        setEnAttempts(newAttempts);
        onKeyStroke?.(e.key, isError);

        if (isError) {
          setEnErrors((n) => n + 1);
          setShaking(true);
          setTimeout(() => setShaking(false), 200);
          setWpm(calcWpm(idx, elapsed));
          setAccuracy(calcAccuracy(idx, newAttempts));
          return;
        }

        const newTyped = enTyped + e.key;
        setEnTyped(newTyped);
        const newWpm = calcWpm(newTyped.length, elapsed);
        const newAcc = calcAccuracy(newTyped.length, newAttempts);
        setWpm(newWpm);
        setAccuracy(newAcc);
        setWpmHistory((h) => [...h.slice(-19), newWpm]);
        const prog = newTyped.length / text.length;
        onProgress?.(newWpm, newAcc, prog);

        if (newTyped.length >= text.length) {
          setDone(true);
          onComplete({ wpm: newWpm, accuracy: newAcc, errors: enErrors, duration: elapsed, keystrokes: newAttempts });
        }
      }
    },
    [done, language, jaState, text, enTyped, enErrors, enAttempts, onComplete, onProgress, onKeyStroke]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const totalAtoms = jaState?.atoms.length ?? 1;
  const completedAtoms = jaState?.atomIndex ?? 0;
  const progress =
    language === 'ja' ? completedAtoms / Math.max(1, totalAtoms) : (enTyped.length / Math.max(1, text?.length ?? 1));
  const errors = language === 'ja' ? (jaState?.errors ?? 0) : enErrors;
  const maxH = Math.max(...wpmHistory, 1);

  return (
    <div className="outline-none">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>進捗</span>
          <span className="tabular-nums">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Typing display */}
      {language === 'ja' && jaEntry && jaState ? (
        <JaDisplay jaEntry={jaEntry} jaState={jaState} shaking={shaking} done={done} />
      ) : language === 'en' && text ? (
        <EnDisplay text={text} typed={enTyped} shaking={shaking} done={done} />
      ) : null}

      {/* Stats + WPM sparkline */}
      <div className="flex items-end gap-5 mt-4">
        <div className="flex flex-col items-center min-w-[3rem]">
          <span className="text-2xl font-bold text-violet-400 tabular-nums">{wpm}</span>
          <span className="text-gray-500 text-xs">WPM</span>
        </div>
        <div className="flex flex-col items-center min-w-[3rem]">
          <span className="text-2xl font-bold text-emerald-400 tabular-nums">{accuracy}%</span>
          <span className="text-gray-500 text-xs">正確性</span>
        </div>
        <div className="flex flex-col items-center min-w-[3rem]">
          <span className="text-2xl font-bold text-red-400 tabular-nums">{errors}</span>
          <span className="text-gray-500 text-xs">ミス</span>
        </div>

        {/* WPM sparkline */}
        {wpmHistory.length > 1 && (
          <div className="ml-auto flex items-end gap-px h-10" title="WPM履歴">
            {wpmHistory.map((w, i) => (
              <div
                key={i}
                className="w-1.5 rounded-sm"
                style={{
                  height: `${Math.max(4, (w / maxH) * 40)}px`,
                  background: i === wpmHistory.length - 1 ? '#a78bfa' : '#4c1d95',
                  opacity: 0.5 + (i / wpmHistory.length) * 0.5,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {!startTime && !done && (
        <p className="mt-3 text-center text-gray-500 text-sm animate-pulse">キーを押してスタート</p>
      )}
    </div>
  );
}
