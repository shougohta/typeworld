'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { store } from '@/lib/store';
import { Language } from '@/types';
import { useEffect, useRef, useState } from 'react';

interface NavbarProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export default function Navbar({ language, onLanguageChange }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = store.getUser();
    setUserName(user?.name ?? null);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const currentLang = language ?? 'ja';

  const toggleLang = () => {
    const next: Language = currentLang === 'ja' ? 'en' : 'ja';
    store.setLanguage(next);
    onLanguageChange?.(next);
  };

  const handleLogout = () => {
    store.clearUser();
    setMenuOpen(false);
    router.push('/login');
  };

  const navLinks = [
    { href: '/', label: 'ホーム' },
    { href: '/practice', label: '基礎練習' },
    { href: '/time-attack', label: 'タイムアタック' },
    { href: '/ghost-race', label: 'ゴーストレース' },
    { href: '/stats', label: '統計分析' },
  ];

  return (
    <nav
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg text-violet-400 tracking-tight">
            TypeWorld
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  pathname === link.href
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            style={{ borderColor: 'var(--border)', color: '#94a3b8' }}
          >
            {currentLang === 'ja' ? '🇯🇵 日本語' : '🇺🇸 English'}
          </button>
          {userName ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-sm font-bold text-white transition-colors"
              >
                {userName[0].toUpperCase()}
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-40 rounded-xl overflow-hidden shadow-xl z-50 border text-sm"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="px-4 py-2.5 text-gray-400 border-b truncate" style={{ borderColor: 'var(--border)' }}>
                    {userName}
                  </div>
                  <Link
                    href="/stats"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    統計を見る
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-md text-sm bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              ログイン
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
