'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TypingArea, { TypingResult } from '@/components/TypingArea';
import { store } from '@/lib/store';
import { getGhost } from '@/lib/ghost-characters';
import { getRandomJaText, getRandomEnText, JaTextEntry } from '@/lib/texts';
import { generateId, updateKeyErrors } from '@/lib/typing-utils';
import { Language } from '@/types';

const TOTAL_ROUNDS = 11;
const WIN_TARGET = 5;

type Phase = 'idle' | 'racing' | 'round_end' | 'match_end';
type RoundOwner = 'player' | 'ghost';

function loadText(lang: Language): { jaEntry?: JaTextEntry; enText?: string } {
  return lang === 'ja' ? { jaEntry: getRandomJaText() } : { enText: getRandomEnText().text };
}

export default function GhostRacePage() {
  const params = useParams();
  const router = useRouter();
  const ghost = getGhost(params.character as string);
  const [language] = useState<Language>(() => store.getLanguage());

  const [phase, setPhase] = useState<Phase>('idle');
  const [playerScore, setPlayerScore] = useState(0);
  const [ghostScore, setGhostScore] = useState(0);
  const [round, setRound] = useState(1);
  const [roundHistory, setRoundHistory] = useState<RoundOwner[]>([]);
  const [roundWinner, setRoundWinner] = useState<RoundOwner | null>(null);
  const [matchWinner, setMatchWinner] = useState<RoundOwner | null>(null);

  const [ghostProgress, setGhostProgress] = useState(0);
  const [userProgress, setUserProgress] = useState(0);
  const [userWpm, setUserWpm] = useState(0);
  const [textData, setTextData] = useState(() => loadText(language));
  const [typingKey, setTypingKey] = useState(0);

  const ghostIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const raceStartedRef = useRef(false);
  const roundEndedRef = useRef(false);
  const playerScoreRef = useRef(0);
  const ghostScoreRef = useRef(0);
  const roundRef = useRef(1);

  useEffect(() => { if (!ghost) router.push('/ghost-race'); }, [ghost, router]);

  const endRound = useCallback((winner: RoundOwner) => {
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current);

    const newPS = playerScoreRef.current + (winner === 'player' ? 1 : 0);
    const newGS = ghostScoreRef.current + (winner === 'ghost' ? 1 : 0);
    const newRound = roundRef.current;

    playerScoreRef.current = newPS;
    ghostScoreRef.current = newGS;
    setPlayerScore(newPS);
    setGhostScore(newGS);
    setRoundHistory((h) => [...h, winner]);
    setRoundWinner(winner);

    const isMatchOver = newPS >= WIN_TARGET || newGS >= WIN_TARGET || newRound >= TOTAL_ROUNDS;

    if (isMatchOver) {
      const mw: RoundOwner = newPS > newGS ? 'player' : 'ghost';
      setMatchWinner(mw);
      setPhase('match_end');
      store.addSession({
        id: generateId(), mode: 'ghost-race', language,
        wpm: userWpm, accuracy: 0, errors: 0, duration: 0, keystrokes: 0,
        createdAt: new Date().toISOString(),
        ghostId: ghost?.id, won: mw === 'player',
      });
    } else {
      setPhase('round_end');
      setTimeout(() => startNextRound(), 2000);
    }
  }, [ghost, language, userWpm]);

  const startGhostTimer = useCallback((textLen: number) => {
    const ghostMs = (textLen * 12000) / (ghost?.wpm ?? 100);
    const startTime = Date.now();
    ghostIntervalRef.current = setInterval(() => {
      const pct = Math.min(1, (Date.now() - startTime) / ghostMs);
      setGhostProgress(pct);
      if (pct >= 1) {
        clearInterval(ghostIntervalRef.current!);
        endRound('ghost');
      }
    }, 100);
  }, [ghost, endRound]);

  const startNextRound = useCallback(() => {
    const next = roundRef.current + 1;
    roundRef.current = next;
    setRound(next);
    setGhostProgress(0);
    setUserProgress(0);
    setRoundWinner(null);
    roundEndedRef.current = false;
    raceStartedRef.current = false;
    const td = loadText(language);
    setTextData(td);
    setTypingKey((k) => k + 1);
    setPhase('racing');
  }, [language]);

  const startFirstRound = useCallback(() => {
    roundRef.current = 1;
    playerScoreRef.current = 0;
    ghostScoreRef.current = 0;
    setRound(1);
    setPlayerScore(0);
    setGhostScore(0);
    setRoundHistory([]);
    setGhostProgress(0);
    setUserProgress(0);
    setRoundWinner(null);
    setMatchWinner(null);
    roundEndedRef.current = false;
    raceStartedRef.current = false;
    const td = loadText(language);
    setTextData(td);
    setTypingKey((k) => k + 1);
    setPhase('racing');
  }, [language]);

  const handleKeyStroke = useCallback((k: string, isError: boolean) => {
    store.setKeyErrors(updateKeyErrors(store.getKeyErrors(), k, isError));
    if (!raceStartedRef.current && !isError) {
      raceStartedRef.current = true;
      const len = textData.jaEntry?.kana.length ?? textData.enText?.length ?? 50;
      startGhostTimer(len);
    }
  }, [textData, startGhostTimer]);

  const handleProgress = useCallback((wpm: number, _acc: number, progress: number) => {
    setUserWpm(wpm);
    setUserProgress(progress);
  }, []);

  const handleComplete = useCallback((result: TypingResult) => {
    setUserWpm(result.wpm);
    endRound('player');
  }, [endRound]);

  useEffect(() => () => { if (ghostIntervalRef.current) clearInterval(ghostIntervalRef.current); }, []);

  if (!ghost) return null;

  const ghostAccentBg = ghost.id === 'tarou' ? 'bg-sky-500' : ghost.id === 'hanako' ? 'bg-pink-500' : ghost.id === 'alex' ? 'bg-emerald-500' : ghost.id === 'sam' ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar language={language} />
      <main className="max-w-3xl mx-auto px-4 py-8 fade-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">{ghost.emoji}</span>
            <span className="font-bold text-white">{ghost.name}</span>
            <span className={`text-xs ${ghost.color}`}>{ghost.wpm} WPM</span>
          </div>
          {phase !== 'idle' && (
            <div className="text-sm text-gray-400">
              Round <span className="text-white font-bold">{Math.min(round, TOTAL_ROUNDS)}</span>/{TOTAL_ROUNDS}
            </div>
          )}
        </div>

        {/* Score */}
        {phase !== 'idle' && (
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-violet-400">{playerScore}</div>
              <div className="text-xs text-gray-500 mt-0.5">あなた</div>
            </div>
            <div className="text-gray-600 text-2xl font-bold">–</div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${ghost.color}`}>{ghostScore}</div>
              <div className="text-xs text-gray-500 mt-0.5">{ghost.name}</div>
            </div>
          </div>
        )}

        {/* Round history dots */}
        {roundHistory.length > 0 && (
          <div className="flex gap-1.5 justify-center mb-6 flex-wrap">
            {roundHistory.map((owner, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${owner === 'player' ? 'bg-violet-500' : ghostAccentBg}`}
                title={`Round ${i + 1}: ${owner === 'player' ? 'あなた' : ghost.name}の勝ち`}
              >
                {owner === 'player' ? '✓' : '✗'}
              </div>
            ))}
            {Array.from({ length: TOTAL_ROUNDS - roundHistory.length }).map((_, i) => (
              <div key={`empty-${i}`} className="w-5 h-5 rounded-full bg-gray-800" />
            ))}
          </div>
        )}

        {/* Idle */}
        {phase === 'idle' && (
          <div className="p-10 rounded-2xl border text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="text-5xl mb-4">{ghost.emoji}</div>
            <h2 className="text-xl font-bold text-white mb-2">{ghost.name} に挑戦</h2>
            <p className="text-gray-400 text-sm mb-6">11問マッチ・先に5問取った方の勝ち</p>
            <button onClick={startFirstRound} className="px-8 py-3 rounded-lg font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors">
              スタート
            </button>
          </div>
        )}

        {/* Racing */}
        {(phase === 'racing' || phase === 'round_end') && (
          <>
            {/* Progress bars */}
            <div className="space-y-3 mb-6">
              {[
                { label: 'あなた', pct: Math.round(userProgress * 100), wpm: userWpm, bar: 'bg-gradient-to-r from-violet-500 to-cyan-400', wpmCls: 'text-violet-400' },
                { label: ghost.name, pct: Math.round(ghostProgress * 100), wpm: ghost.wpm, bar: ghostAccentBg, wpmCls: ghost.color },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-20 shrink-0">{row.label}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-5 overflow-hidden relative">
                    <div className={`h-full rounded-full transition-all duration-100 ${row.bar}`} style={{ width: `${row.pct}%` }} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/60">{row.pct}%</span>
                  </div>
                  <span className={`text-sm font-bold w-16 text-right tabular-nums ${row.wpmCls}`}>{row.wpm} WPM</span>
                </div>
              ))}
            </div>

            {/* Round result flash */}
            {phase === 'round_end' && roundWinner && (
              <div className={`mb-4 py-3 rounded-xl text-center font-bold text-lg ${roundWinner === 'player' ? 'bg-violet-600/30 text-violet-300' : `${ghostAccentBg}/30 ${ghost.color}`}`}
                style={{ background: roundWinner === 'player' ? 'rgba(124,58,237,0.2)' : 'rgba(0,0,0,0.2)' }}>
                {roundWinner === 'player' ? '✅ あなたの勝ち！' : `❌ ${ghost.name}の勝ち`}
                <span className="text-sm text-gray-400 ml-2">次のラウンドへ…</span>
              </div>
            )}

            <div className="p-6 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <TypingArea
                key={typingKey}
                language={language}
                jaEntry={textData.jaEntry}
                text={textData.enText}
                onComplete={handleComplete}
                onProgress={handleProgress}
                onKeyStroke={handleKeyStroke}
              />
            </div>
          </>
        )}

        {/* Match end */}
        {phase === 'match_end' && matchWinner && (
          <div className="p-8 rounded-2xl border text-center fade-up" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="text-6xl mb-4">{matchWinner === 'player' ? '🏆' : '😤'}</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {matchWinner === 'player' ? 'マッチ勝利！' : 'マッチ敗北…'}
            </h2>
            <div className="flex items-center justify-center gap-8 my-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-violet-400">{playerScore}</div>
                <div className="text-sm text-gray-500 mt-1">あなた</div>
              </div>
              <div className="text-gray-600 text-3xl">–</div>
              <div className="text-center">
                <div className={`text-5xl font-bold ${ghost.color}`}>{ghostScore}</div>
                <div className="text-sm text-gray-500 mt-1">{ghost.name}</div>
              </div>
            </div>
            {/* Round history summary */}
            <div className="flex gap-1.5 justify-center mb-6 flex-wrap">
              {roundHistory.map((owner, i) => (
                <div key={i} className={`w-5 h-5 rounded-full ${owner === 'player' ? 'bg-violet-500' : ghostAccentBg}`} />
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={startFirstRound} className="flex-1 py-2.5 rounded-lg font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors">
                リマッチ
              </button>
              <button onClick={() => router.push('/ghost-race')} className="flex-1 py-2.5 rounded-lg font-medium border text-gray-300 hover:text-white hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                相手を変える
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
