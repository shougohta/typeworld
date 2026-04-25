import { GhostCharacter } from '@/types';

export const GHOST_CHARACTERS: GhostCharacter[] = [
  {
    id: 'tarou',
    name: 'たろう',
    emoji: '🐢',
    wpm: 25,
    level: '超初心者',
    description: 'のんびり屋さん。絶対に勝てる！',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20 border-sky-500/40',
  },
  {
    id: 'hanako',
    name: 'はなこ',
    emoji: '🌸',
    wpm: 55,
    level: '初心者',
    description: 'まだ練習中。少しだけ手強いかも。',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20 border-pink-500/40',
  },
  {
    id: 'alex',
    name: 'アレックス',
    emoji: '👦',
    wpm: 80,
    level: '初中級',
    description: 'そこそこ速い。油断禁物。',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20 border-emerald-500/40',
  },
  {
    id: 'sam',
    name: 'サム',
    emoji: '🧑',
    wpm: 180,
    level: '中級',
    description: 'かなり速い。本格的な挑戦者。',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20 border-amber-500/40',
  },
  {
    id: 'watson',
    name: 'ワトソン',
    emoji: '🤖',
    wpm: 320,
    level: '世界級',
    description: '世界最速クラス。倒せるか？',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20 border-red-500/40',
  },
];

export function getGhost(id: string): GhostCharacter | undefined {
  return GHOST_CHARACTERS.find((g) => g.id === id);
}
