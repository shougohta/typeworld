'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import AbilityRadar from '@/components/AbilityRadar';
import { store } from '@/lib/store';
import { calcAbilityStats } from '@/lib/typing-utils';
import { AbilityStats, KeyError, TypingSession } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const DEFAULT_STATS: AbilityStats = { speed: 0, accuracy: 0, stability: 0, endurance: 0, reaction: 0 };

const KEYBOARD_ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l',';'],
  ['z','x','c','v','b','n','m',',','.','/'],
];

function getErrorRate(key: string, keyErrors: KeyError[]): number {
  const k = keyErrors.find((e) => e.key === key);
  if (!k || k.total === 0) return 0;
  return k.errors / k.total;
}

function errColor(rate: number): string {
  if (rate === 0) return 'rgba(255,255,255,0.04)';
  if (rate < 0.1) return 'rgba(251,191,36,0.25)';
  if (rate < 0.25) return 'rgba(249,115,22,0.4)';
  return 'rgba(239,68,68,0.6)';
}

export default function StatsPage() {
  const [sessions, setSessions] = useState<TypingSession[]>([]);
  const [keyErrors, setKeyErrors] = useState<KeyError[]>([]);
  const [stats, setStats] = useState<AbilityStats>(DEFAULT_STATS);
  const [language] = useState(() => store.getLanguage());

  useEffect(() => {
    const s = store.getSessions();
    const ke = store.getKeyErrors();
    setSessions(s);
    setKeyErrors(ke);
    setStats(calcAbilityStats(s, ke));
  }, []);

  const chartData = sessions
    .slice(0, 20)
    .reverse()
    .map((s, i) => ({
      i: i + 1,
      wpm: s.wpm,
      acc: s.accuracy,
    }));

  const ghostResults = sessions.filter((s) => s.mode === 'ghost-race');
  const wins = ghostResults.filter((s) => s.won).length;

  const sortedErrors = [...keyErrors]
    .filter((k) => k.errors > 0)
    .sort((a, b) => b.errors / b.total - a.errors / a.total)
    .slice(0, 5);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar language={language} />

      <main className="max-w-6xl mx-auto px-4 py-8 fade-up">
        <h1 className="text-2xl font-bold text-white mb-8">統計分析</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <h2 className="font-semibold text-gray-300 mb-4">能力レーダー</h2>
            <AbilityRadar stats={stats} size={280} />
            <div className="grid grid-cols-5 gap-2 mt-2">
              {(Object.entries(stats) as [keyof AbilityStats, number][]).map(([k, v]) => (
                <div key={k} className="text-center">
                  <div className="text-lg font-bold text-violet-400">{v}</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {k === 'speed' ? '速度' : k === 'accuracy' ? '正確' : k === 'stability' ? '安定' : k === 'endurance' ? '持久' : '反応'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="p-6 rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <h2 className="font-semibold text-gray-300 mb-4">WPM 推移</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#2a2a50" strokeDasharray="3 3" />
                  <XAxis dataKey="i" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1e1e38', border: '1px solid #2a2a50', borderRadius: 8 }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Line type="monotone" dataKey="wpm" stroke="#7c3aed" strokeWidth={2} dot={false} name="WPM" />
                  <Line type="monotone" dataKey="acc" stroke="#22d3ee" strokeWidth={2} dot={false} name="正確性%" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-gray-600">
                データがありません。練習を開始しましょう！
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div
            className="p-6 rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <h2 className="font-semibold text-gray-300 mb-4">苦手キーヒートマップ</h2>
            <div className="flex flex-col gap-1.5">
              {KEYBOARD_ROWS.map((row, ri) => (
                <div key={ri} className="flex gap-1.5" style={{ paddingLeft: ri === 1 ? 16 : ri === 2 ? 32 : 0 }}>
                  {row.map((key) => {
                    const rate = getErrorRate(key, keyErrors);
                    return (
                      <div
                        key={key}
                        title={`${key}: ${Math.round(rate * 100)}% error`}
                        className="w-9 h-9 rounded flex items-center justify-center text-xs font-mono font-bold text-gray-300 border transition-colors"
                        style={{ background: errColor(rate), borderColor: 'var(--border)' }}
                      >
                        {key}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
              <span>低←</span>
              <div className="flex gap-1">
                {['rgba(255,255,255,0.04)', 'rgba(251,191,36,0.25)', 'rgba(249,115,22,0.4)', 'rgba(239,68,68,0.6)'].map((c, i) => (
                  <div key={i} className="w-5 h-3 rounded-sm" style={{ background: c, border: '1px solid rgba(255,255,255,0.1)' }} />
                ))}
              </div>
              <span>→高 ミス率</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div
              className="p-6 rounded-2xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <h2 className="font-semibold text-gray-300 mb-4">苦手キー TOP5</h2>
              {sortedErrors.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {sortedErrors.map((k) => (
                    <div key={k.key} className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white w-6 text-center">{k.key}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${Math.min(100, (k.errors / k.total) * 100)}%` }}
                        />
                      </div>
                      <span className="text-red-400 text-sm w-10 text-right">
                        {Math.round((k.errors / k.total) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">データがありません</p>
              )}
            </div>

            <div
              className="p-6 rounded-2xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <h2 className="font-semibold text-gray-300 mb-4">ゴースト対戦履歴</h2>
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">{wins}</div>
                  <div className="text-xs text-gray-500">勝利</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{ghostResults.length - wins}</div>
                  <div className="text-xs text-gray-500">敗北</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {ghostResults.length > 0 ? Math.round((wins / ghostResults.length) * 100) : 0}%
                  </div>
                  <div className="text-xs text-gray-500">勝率</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                {ghostResults.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span>{s.won ? '✅ 勝' : '❌ 負'}</span>
                    <span className="text-violet-400">{s.wpm} WPM</span>
                    <span className="text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                ))}
                {ghostResults.length === 0 && (
                  <p className="text-gray-600 text-sm">対戦履歴がありません</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '総セッション数', value: sessions.length, color: 'text-violet-400' },
            { label: '最高 WPM', value: sessions.length > 0 ? Math.max(...sessions.map((s) => s.wpm)) : 0, color: 'text-cyan-400' },
            { label: '平均 WPM', value: sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.wpm, 0) / sessions.length) : 0, color: 'text-emerald-400' },
            { label: '平均正確性', value: sessions.length > 0 ? `${Math.round(sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length)}%` : '—', color: 'text-amber-400' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-5 rounded-xl border text-center"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-gray-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
