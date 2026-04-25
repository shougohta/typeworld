import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { GHOST_CHARACTERS } from '@/lib/ghost-characters';

export default function GhostSelectPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 fade-up">
        <h1 className="text-2xl font-bold text-white mb-2">ゴーストレース</h1>
        <p className="text-gray-400 mb-2">対戦相手を選んでください</p>
        <p className="text-sm text-gray-500 mb-8">11問マッチ・先に5問取った方の勝ち</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {GHOST_CHARACTERS.map((ghost) => (
            <Link key={ghost.id} href={`/ghost-race/${ghost.id}`} className="group block">
              <div className={`p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.04] cursor-pointer ${ghost.bgColor}`}>
                <div className="text-4xl mb-3 text-center">{ghost.emoji}</div>
                <div className="text-center">
                  <div className="text-base font-bold text-white mb-0.5">{ghost.name}</div>
                  <div className={`text-xs font-medium mb-2 ${ghost.color}`}>{ghost.level}</div>
                  <div className={`text-2xl font-bold mb-0.5 ${ghost.color}`}>{ghost.wpm}</div>
                  <div className="text-gray-500 text-xs mb-3">WPM</div>
                  <p className="text-gray-400 text-xs">{ghost.description}</p>
                </div>
                <div className={`mt-4 py-1.5 rounded-lg text-center text-xs font-medium text-white transition-colors ${
                  ghost.id === 'tarou' ? 'bg-sky-600 group-hover:bg-sky-500'
                  : ghost.id === 'hanako' ? 'bg-pink-600 group-hover:bg-pink-500'
                  : ghost.id === 'alex' ? 'bg-emerald-600 group-hover:bg-emerald-500'
                  : ghost.id === 'sam' ? 'bg-amber-600 group-hover:bg-amber-500'
                  : 'bg-red-600 group-hover:bg-red-500'
                }`}>
                  挑戦する
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
