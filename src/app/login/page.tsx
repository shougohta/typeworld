'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { store } from '@/lib/store';

export default function LoginPage() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    store.setUser({ name: name.trim(), createdAt: new Date().toISOString() });
    router.push('/');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-2xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⌨️</div>
          <h1 className="text-2xl font-bold text-white">TypeWorld</h1>
          <p className="text-gray-400 text-sm mt-1">世界一を目指してトレーニング開始</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">ユーザー名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: Ootashougo"
              className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-2.5 rounded-lg font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            スタート
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          データはブラウザに保存されます
        </p>
      </div>
    </div>
  );
}
