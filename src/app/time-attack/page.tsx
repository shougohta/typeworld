'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import TypingArea, { TypingResult } from '@/components/TypingArea';
import { store } from '@/lib/store';
import { Language } from '@/types';
import { getRandomJaText, getRandomEnText, JaTextEntry, EnTextEntry } from '@/lib/texts';
import { generateId, updateKeyErrors } from '@/lib/typing-utils';

const TIME_LIMIT = 60000;

export default function TimeAttackPage() {
  const [language, setLanguage] = useState<Language>(() => store.getLanguage());
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAcc, setLiveAcc] = useState(100);
  const [jaEntry, setJaEntry] = useState<JaTextEntry>(() => getRandomJaText());
  const [enText, setEnText] = useState<string>(() => getRandomEnText().text);
  const [textKey, setTextKey] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);

  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const startGame = useCallback(() => {
    setPhase('playing');
    setTimeLeft(TIME_LIMIT);
    setScore(0);
    setBestWpm(0);
    setLiveWpm(0);
    setLiveAcc(100);
    setTotalErrors(0);
    setTotalKeystrokes(0);
    startRef.current = Date.now();
    if (language === 'ja') setJaEntry(getRandomJaText());
    else setEnText(getRandomEnText().text);
    setTextKey((k) => k + 1);

    timerRef.current = setInterval(() => {
      const left = Math.max(0, TIME_LIMIT - (Date.now() - startRef.current));
      setTimeLeft(left);
      if (left === 0 && phaseRef.current === 'playing') {
        setPhase('done');
        clearInterval(timerRef.current!);
      }
    }, 100);
  }, [language]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleComplete = useCallback((result: TypingResult) => {
    if (phaseRef.current !== 'playing') return;
    setScore((s) => s + result.keystrokes - result.errors);
    setBestWpm((b) => Math.max(b, result.wpm));
    setTotalErrors((n) => n + result.errors);
    setTotalKeystrokes((n) => n + result.keystrokes);
    if (language === 'ja') setJaEntry(getRandomJaText());
    else setEnText(getRandomEnText().text);
    setTextKey((k) => k + 1);
  }, [language]);

  const handleProgress = useCallback((wpm: number, acc: number) => {
    setLiveWpm(wpm);
    setLiveAcc(acc);
  }, []);

  const handleKeyStroke = useCallback((k: string, isError: boolean) => {
    store.setKeyErrors(updateKeyErrors(store.getKeyErrors(), k, isError));
  }, []);

  useEffect(() => {
    if (phase === 'done' && totalKeystrokes > 0) {
      store.addSession({ id: generateId(), mode: 'time-attack', language, wpm: bestWpm, accuracy: Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100), errors: totalErrors, duration: TIME_LIMIT, keystrokes: totalKeystrokes, createdAt: new Date().toISOString() });
    }
  }, [phase]);

  const secs = Math.ceil(timeLeft / 1000);
  const progress = timeLeft / TIME_LIMIT;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar language={language} onLanguageChange={setLanguage} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">タイムアタック</h1>

        {/* Timer */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">残り時間</span>
            <span className={`text-3xl font-bold tabular-nums ${secs <= 10 ? 'text-red-400' : 'text-white'}`}>
              {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-100 ${secs <= 10 ? 'bg-red-500' : 'bg-gradient-to-r from-violet-500 to-cyan-400'}`} style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        {/* Score */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="text-3xl font-bold text-amber-400">{score}</div><div className="text-xs text-gray-500 mt-1">得点</div>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="text-3xl font-bold text-violet-400">{liveWpm}</div><div className="text-xs text-gray-500 mt-1">WPM</div>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="text-3xl font-bold text-emerald-400">{liveAcc}%</div><div className="text-xs text-gray-500 mt-1">正確性</div>
          </div>
        </div>

        {/* Typing area */}
        {phase === 'idle' ? (
          <div className="p-8 rounded-2xl border text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-gray-400 mb-4">60秒間でできるだけ多くの文字を打とう</p>
            <button onClick={startGame} className="px-8 py-3 rounded-lg font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors">スタート</button>
          </div>
        ) : phase === 'playing' ? (
          <div className="p-6 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <TypingArea key={textKey} language={language} jaEntry={language === 'ja' ? jaEntry : undefined} text={language === 'en' ? enText : undefined} onComplete={handleComplete} onProgress={handleProgress} onKeyStroke={handleKeyStroke} />
          </div>
        ) : null}

        {phase === 'done' && (
          <div className="mt-6 p-6 rounded-2xl border fade-up" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-bold text-white mb-4 text-center">🎉 結果発表</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center"><div className="text-4xl font-bold text-amber-400">{score}</div><div className="text-sm text-gray-500 mt-1">得点</div></div>
              <div className="text-center"><div className="text-4xl font-bold text-violet-400">{bestWpm}</div><div className="text-sm text-gray-500 mt-1">最高 WPM</div></div>
              <div className="text-center"><div className="text-4xl font-bold text-emerald-400">{totalKeystrokes > 0 ? Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100) : 0}%</div><div className="text-sm text-gray-500 mt-1">正確性</div></div>
            </div>
            <button onClick={startGame} className="w-full py-3 rounded-lg font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors">もう一度挑戦</button>
          </div>
        )}
      </main>
    </div>
  );
}
