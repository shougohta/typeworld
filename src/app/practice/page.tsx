'use client';

import { useCallback, useState } from 'react';
import Navbar from '@/components/Navbar';
import TypingArea, { TypingResult } from '@/components/TypingArea';
import { store } from '@/lib/store';
import { Language } from '@/types';
import { getRandomJaText, getRandomEnText, PRACTICE_TEXTS, JaTextEntry, EnTextEntry } from '@/lib/texts';
import { generateId, updateKeyErrors } from '@/lib/typing-utils';

type PracticeType = 'home' | 'top' | 'bottom' | 'random';

const MENU: { id: PracticeType; label: string; desc: string }[] = [
  { id: 'home', label: 'ホームポジション', desc: 'asdf jkl; の基礎' },
  { id: 'top', label: '上段キー', desc: 'qwer tyui op' },
  { id: 'bottom', label: '下段キー', desc: 'zxcv bnm,' },
  { id: 'random', label: 'ランダム文章', desc: '総合練習' },
];

function getPracticeEntry(type: PracticeType, lang: Language): { jaEntry?: JaTextEntry; text?: string } {
  if (lang === 'ja') {
    if (type === 'random') return { jaEntry: getRandomJaText() };
    return { text: PRACTICE_TEXTS[type === 'home' ? 'home_en' : type === 'top' ? 'top_en' : 'bottom_en'] };
  }
  if (type === 'random') return { text: getRandomEnText().text };
  return { text: PRACTICE_TEXTS[type === 'home' ? 'home_en' : type === 'top' ? 'top_en' : 'bottom_en'] };
}

export default function PracticePage() {
  const [language, setLanguage] = useState<Language>(() => store.getLanguage());
  const [practiceType, setPracticeType] = useState<PracticeType>('home');
  const [entry, setEntry] = useState(() => getPracticeEntry('home', store.getLanguage()));
  const [result, setResult] = useState<TypingResult | null>(null);
  const [key, setKey] = useState(0);

  const selectType = (type: PracticeType) => {
    setPracticeType(type);
    setEntry(getPracticeEntry(type, language));
    setResult(null);
    setKey((k) => k + 1);
  };

  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    setEntry(getPracticeEntry(practiceType, lang));
    setResult(null);
    setKey((k) => k + 1);
  };

  const handleKeyStroke = useCallback((k: string, isError: boolean) => {
    store.setKeyErrors(updateKeyErrors(store.getKeyErrors(), k, isError));
  }, []);

  const handleComplete = (r: TypingResult) => {
    setResult(r);
    store.addSession({ id: generateId(), mode: 'practice', language, wpm: r.wpm, accuracy: r.accuracy, errors: r.errors, duration: r.duration, keystrokes: r.keystrokes, createdAt: new Date().toISOString() });
  };

  const retry = () => { setResult(null); setKey((k) => k + 1); };
  const next = () => {
    setEntry(practiceType === 'random' ? getPracticeEntry('random', language) : getPracticeEntry(practiceType, language));
    setResult(null);
    setKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar language={language} onLanguageChange={handleLangChange} />
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">
        <aside className="w-52 shrink-0">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">練習メニュー</h2>
          <div className="flex flex-col gap-1">
            {MENU.map((item) => (
              <button key={item.id} onClick={() => selectType(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${practiceType === item.id ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-600 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 fade-up">
          <h1 className="text-2xl font-bold text-white mb-6">基礎練習</h1>
          <TypingArea key={key} language={language} jaEntry={entry.jaEntry} text={entry.text} onComplete={handleComplete} onKeyStroke={handleKeyStroke} />

          {result && (
            <div className="mt-6 p-6 rounded-2xl border fade-up" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-bold text-white mb-4">結果</h2>
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center"><div className="text-4xl font-bold text-violet-400">{result.wpm}</div><div className="text-sm text-gray-500 mt-1">WPM</div></div>
                <div className="text-center"><div className="text-4xl font-bold text-emerald-400">{result.accuracy}%</div><div className="text-sm text-gray-500 mt-1">正確性</div></div>
                <div className="text-center"><div className="text-4xl font-bold text-red-400">{result.errors}</div><div className="text-sm text-gray-500 mt-1">ミス</div></div>
              </div>
              <div className="flex gap-3">
                <button onClick={retry} className="flex-1 py-2.5 rounded-lg font-medium border text-gray-300 hover:text-white hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>もう一度</button>
                <button onClick={next} className="flex-1 py-2.5 rounded-lg font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors">次の問題</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
