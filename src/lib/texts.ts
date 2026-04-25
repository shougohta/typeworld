export interface TextSegment {
  text: string;
  ruby?: string; // furigana for kanji
}

export interface JaTextEntry {
  id: string;
  segments: TextSegment[];
  kana: string; // flat hiragana/katakana for romaji input
  category: string;
}

export interface EnTextEntry {
  id: string;
  text: string;
  category: string;
}

export const JAPANESE_TEXTS: JaTextEntry[] = [
  {
    id: 'ja-1',
    segments: [
      { text: '今日', ruby: 'きょう' }, { text: 'は' },
      { text: '良', ruby: 'よ' }, { text: 'い' },
      { text: '天気', ruby: 'てんき' }, { text: 'ですね' },
    ],
    kana: 'きょうはよいてんきですね',
    category: 'basic',
  },
  {
    id: 'ja-2',
    segments: [
      { text: '私', ruby: 'わたし' }, { text: 'は' },
      { text: '日本語', ruby: 'にほんご' }, { text: 'が' },
      { text: '好', ruby: 'す' }, { text: 'きです' },
    ],
    kana: 'わたしはにほんごがすきです',
    category: 'basic',
  },
  {
    id: 'ja-3',
    segments: [
      { text: '東京', ruby: 'とうきょう' }, { text: 'は' },
      { text: '日本', ruby: 'にほん' }, { text: 'の' },
      { text: '首都', ruby: 'しゅと' }, { text: 'です' },
    ],
    kana: 'とうきょうはにほんのしゅとです',
    category: 'basic',
  },
  {
    id: 'ja-4',
    segments: [
      { text: '毎日', ruby: 'まいにち' },
      { text: '練習', ruby: 'れんしゅう' }, { text: 'すれば' },
      { text: '必', ruby: 'かなら' }, { text: 'ず' },
      { text: '上達', ruby: 'じょうたつ' }, { text: 'します' },
    ],
    kana: 'まいにちれんしゅうすればかならずじょうたつします',
    category: 'intermediate',
  },
  {
    id: 'ja-5',
    segments: [
      { text: '桜', ruby: 'さくら' }, { text: 'の' },
      { text: '花', ruby: 'はな' }, { text: 'が' },
      { text: '満開', ruby: 'まんかい' }, { text: 'です' },
    ],
    kana: 'さくらのはながまんかいです',
    category: 'basic',
  },
  {
    id: 'ja-6',
    segments: [
      { text: '音楽', ruby: 'おんがく' }, { text: 'を' },
      { text: '聴', ruby: 'き' }, { text: 'きながら' },
      { text: '勉強', ruby: 'べんきょう' }, { text: 'するのが' },
      { text: '好', ruby: 'す' }, { text: 'きです' },
    ],
    kana: 'おんがくをききながらべんきょうするのがすきです',
    category: 'intermediate',
  },
  {
    id: 'ja-7',
    segments: [
      { text: '明日', ruby: 'あした' }, { text: 'は' },
      { text: '友達', ruby: 'ともだち' }, { text: 'と' },
      { text: '映画', ruby: 'えいが' }, { text: 'を' },
      { text: '見', ruby: 'み' }, { text: 'に' },
      { text: '行', ruby: 'い' }, { text: 'きます' },
    ],
    kana: 'あしたはともだちとえいがをみにいきます',
    category: 'intermediate',
  },
  {
    id: 'ja-8',
    segments: [
      { text: '速度', ruby: 'そくど' }, { text: 'と' },
      { text: '正確', ruby: 'せいかく' }, { text: 'さを' },
      { text: '同時', ruby: 'どうじ' }, { text: 'に' },
      { text: '磨', ruby: 'みが' }, { text: 'くことが' },
      { text: '重要', ruby: 'じゅうよう' }, { text: 'です' },
    ],
    kana: 'そくどとせいかくさをどうじにみがくことがじゅうようです',
    category: 'advanced',
  },
  {
    id: 'ja-9',
    segments: [
      { text: '世界一', ruby: 'せかいいち' }, { text: 'の' },
      { text: 'タイピングスピードを' },
      { text: '目指', ruby: 'めざ' }, { text: 'して' },
      { text: '毎日', ruby: 'まいにち' },
      { text: '練習', ruby: 'れんしゅう' }, { text: 'しています' },
    ],
    kana: 'せかいいちのたいぴんぐすぴーどをめざしてまいにちれんしゅうしています',
    category: 'advanced',
  },
  {
    id: 'ja-10',
    segments: [
      { text: '日本', ruby: 'にほん' }, { text: 'の' },
      { text: '四季', ruby: 'しき' }, { text: 'はとても' },
      { text: '美', ruby: 'うつく' }, { text: 'しいと' },
      { text: '思', ruby: 'おも' }, { text: 'います' },
    ],
    kana: 'にほんのしきはとてもうつくしいとおもいます',
    category: 'advanced',
  },
];

export const ENGLISH_TEXTS: EnTextEntry[] = [
  { id: 'en-1', text: 'the quick brown fox jumps over the lazy dog', category: 'basic' },
  { id: 'en-2', text: 'practice makes perfect and typing is no exception', category: 'basic' },
  { id: 'en-3', text: 'speed and accuracy are both essential for world class typing', category: 'intermediate' },
  { id: 'en-4', text: 'the art of typing fast requires consistent daily practice and focus', category: 'intermediate' },
  { id: 'en-5', text: 'to become the fastest typist in the world you must train every single day', category: 'advanced' },
  { id: 'en-6', text: 'professional typists develop muscle memory through thousands of hours of deliberate practice', category: 'advanced' },
  { id: 'en-7', text: 'maintaining high accuracy while increasing speed is the fundamental challenge of competitive typing', category: 'advanced' },
  { id: 'en-8', text: 'the world record for typing speed exceeds three hundred words per minute requiring extraordinary precision', category: 'expert' },
];

export const PRACTICE_TEXTS = {
  home_en: 'asdf jkl; asdf jkl; fdsa ;lkj fdsa ;lkj asdf jkl;',
  home_ja_kana: 'あいうえお かきくけこ さしすせそ',
  home_ja: 'aiueo kakikukeko sasisuseso',
  top_en: 'qwer tyui op qwer tyui op qwerty uiop',
  bottom_en: 'zxcv bnm zxcv bnm zxcvbn',
};

export function getRandomJaText(category?: string): JaTextEntry {
  const pool = category ? JAPANESE_TEXTS.filter((t) => t.category === category) : JAPANESE_TEXTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomEnText(category?: string): EnTextEntry {
  const pool = category ? ENGLISH_TEXTS.filter((t) => t.category === category) : ENGLISH_TEXTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
