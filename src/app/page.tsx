'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AbilityRadar from '@/components/AbilityRadar';
import ModeCard from '@/components/ModeCard';
import { store } from '@/lib/store';
import { calcAbilityStats } from '@/lib/typing-utils';
import { AbilityStats, Language } from '@/types';

const DEFAULT_STATS: AbilityStats = {
  speed: 0,
  accuracy: 0,
  stability: 0,
  endurance: 0,
  reaction: 0,
};

export default function HomePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('ja');
  const [stats, setStats] = useState<AbilityStats>(DEFAULT_STATS);
  const [userName, setUserName] = useState<string | null>(null);
  const [todayWpm, setTodayWpm] = useState(0);
  const [todayAcc, setTodayAcc] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const user = store.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserName(user.name);

    const lang = store.getLanguage();
    setLanguage(lang);

    const sessions = store.getSessions();
    const keyErrors = store.getKeyErrors();
    setStats(calcAbilityStats(sessions, keyErrors));

    const today = new Date().toDateString();
    const todaySessions = sessions.filter(
      (s) => new Date(s.createdAt).toDateString() === today
    );
    if (todaySessions.length > 0) {
      setTodayWpm(Math.max(...todaySessions.map((s) => s.wpm)));
      setTodayAcc(
        Math.round(todaySessions.reduce((a, s) => a + s.accuracy, 0) / todaySessions.length)
      );
    }

    const dates = [...new Set(sessions.map((s) => new Date(s.createdAt).toDateString()))];
    setStreak(dates.length);
  }, [router]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="max-w-6xl mx-auto px-4 py-8 fade-up">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            おかえり、<span className="text-violet-400">{userName}</span> 👋
          </h1>
          <p className="text-gray-400 mt-1">今日も世界一に向けてトレーニングしよう</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <h2 className="font-semibold text-gray-300 mb-4">能力レーダー</h2>
            <AbilityRadar stats={stats} />
          </div>

          <div className="flex flex-col gap-4">
            <div
              className="p-6 rounded-2xl border flex-1"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <h2 className="font-semibold text-gray-300 mb-4">今日の記録</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-violet-400">{todayWpm}</div>
                  <div className="text-xs text-gray-500 mt-1">最高 WPM</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {todayAcc > 0 ? `${todayAcc}%` : '—'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">正確性</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-400">
                    🔥 {streak}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">連続日数</div>
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-2xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <h2 className="font-semibold text-gray-300 mb-2">世界記録まであと</h2>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-cyan-400">
                  {Math.max(0, 320 - todayWpm)}
                </span>
                <span className="text-gray-400 mb-1">WPM</span>
              </div>
              <div className="mt-2 bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-violet-500 to-cyan-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (todayWpm / 320) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>0</span>
                <span>世界記録 320 WPM</span>
              </div>
            </div>
          </div>
        </div>

        <h2 className="font-semibold text-gray-300 mb-4">モードを選択</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ModeCard
            href="/practice"
            icon="⌨️"
            title="基礎練習"
            description="指の強化・ホームポジション"
            accent="emerald"
          />
          <ModeCard
            href="/time-attack"
            icon="⏱️"
            title="タイムアタック"
            description="制限時間内に高得点を狙え"
            accent="amber"
          />
          <ModeCard
            href="/ghost-race"
            icon="👻"
            title="ゴーストレース"
            description="世界最速と対戦しよう"
            accent="violet"
          />
          <ModeCard
            href="/stats"
            icon="📊"
            title="統計分析"
            description="弱点キーと成長を確認"
            accent="cyan"
          />
        </div>
      </main>
    </div>
  );
}
