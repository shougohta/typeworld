// Romaji input engine — handles multiple valid sequences per kana

const SINGLE: Record<string, string[]> = {
  // Hiragana — vowels
  'あ': ['a'], 'い': ['i'], 'う': ['u'], 'え': ['e'], 'お': ['o'],
  // ka-row
  'か': ['ka'], 'き': ['ki'], 'く': ['ku'], 'け': ['ke'], 'こ': ['ko'],
  // sa-row (し has alternatives)
  'さ': ['sa'], 'し': ['shi', 'si'], 'す': ['su'], 'せ': ['se'], 'そ': ['so'],
  // ta-row (ち つ have alternatives)
  'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'],
  // na-row
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
  // ha-row (ふ has alternatives)
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu', 'hu'], 'へ': ['he'], 'ほ': ['ho'],
  // ma-row
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
  // ya-row
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
  // ra-row
  'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
  // wa-row
  'わ': ['wa'], 'ゐ': ['wi'], 'ゑ': ['we'], 'を': ['wo'],
  // voiced — ga
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
  // za (じ has alternatives)
  'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
  // da
  'だ': ['da'], 'ぢ': ['di'], 'づ': ['du'], 'で': ['de'], 'ど': ['do'],
  // ba
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
  // pa
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],
  // Katakana (same logic)
  'ア': ['a'], 'イ': ['i'], 'ウ': ['u'], 'エ': ['e'], 'オ': ['o'],
  'カ': ['ka'], 'キ': ['ki'], 'ク': ['ku'], 'ケ': ['ke'], 'コ': ['ko'],
  'サ': ['sa'], 'シ': ['shi', 'si'], 'ス': ['su'], 'セ': ['se'], 'ソ': ['so'],
  'タ': ['ta'], 'チ': ['chi', 'ti'], 'ツ': ['tsu', 'tu'], 'テ': ['te'], 'ト': ['to'],
  'ナ': ['na'], 'ニ': ['ni'], 'ヌ': ['nu'], 'ネ': ['ne'], 'ノ': ['no'],
  'ハ': ['ha'], 'ヒ': ['hi'], 'フ': ['fu', 'hu'], 'ヘ': ['he'], 'ホ': ['ho'],
  'マ': ['ma'], 'ミ': ['mi'], 'ム': ['mu'], 'メ': ['me'], 'モ': ['mo'],
  'ヤ': ['ya'], 'ユ': ['yu'], 'ヨ': ['yo'],
  'ラ': ['ra'], 'リ': ['ri'], 'ル': ['ru'], 'レ': ['re'], 'ロ': ['ro'],
  'ワ': ['wa'], 'ヲ': ['wo'],
  'ガ': ['ga'], 'ギ': ['gi'], 'グ': ['gu'], 'ゲ': ['ge'], 'ゴ': ['go'],
  'ザ': ['za'], 'ジ': ['ji', 'zi'], 'ズ': ['zu'], 'ゼ': ['ze'], 'ゾ': ['zo'],
  'ダ': ['da'], 'ヂ': ['di'], 'ヅ': ['du'], 'デ': ['de'], 'ド': ['do'],
  'バ': ['ba'], 'ビ': ['bi'], 'ブ': ['bu'], 'ベ': ['be'], 'ボ': ['bo'],
  'パ': ['pa'], 'ピ': ['pi'], 'プ': ['pu'], 'ペ': ['pe'], 'ポ': ['po'],
  'ン': ['n', 'nn'],
  // Long vowel / punctuation
  'ー': ['-'],
  '、': [','], '。': ['.'],
};

const COMPOUND: Record<string, string[]> = {
  // Hiragana compounds
  'きゃ': ['kya'], 'きゅ': ['kyu'], 'きょ': ['kyo'],
  'しゃ': ['sha', 'sya'], 'しゅ': ['shu', 'syu'], 'しょ': ['sho', 'syo'],
  'しぇ': ['she'],
  'ちゃ': ['cha', 'tya', 'cya'], 'ちゅ': ['chu', 'tyu', 'cyu'], 'ちょ': ['cho', 'tyo', 'cyo'],
  'ちぇ': ['che'],
  'にゃ': ['nya'], 'にゅ': ['nyu'], 'にょ': ['nyo'],
  'ひゃ': ['hya'], 'ひゅ': ['hyu'], 'ひょ': ['hyo'],
  'みゃ': ['mya'], 'みゅ': ['myu'], 'みょ': ['myo'],
  'りゃ': ['rya'], 'りゅ': ['ryu'], 'りょ': ['ryo'],
  'ぎゃ': ['gya'], 'ぎゅ': ['gyu'], 'ぎょ': ['gyo'],
  'じゃ': ['ja', 'zya', 'jya'], 'じゅ': ['ju', 'zyu', 'jyu'], 'じょ': ['jo', 'zyo', 'jyo'],
  'じぇ': ['je'],
  'びゃ': ['bya'], 'びゅ': ['byu'], 'びょ': ['byo'],
  'ぴゃ': ['pya'], 'ぴゅ': ['pyu'], 'ぴょ': ['pyo'],
  'ふぁ': ['fa'], 'ふぃ': ['fi'], 'ふぇ': ['fe'], 'ふぉ': ['fo'], 'ふゅ': ['fyu'],
  'てぃ': ['thi'], 'でぃ': ['dhi'], 'でゅ': ['dhu'],
  'ぢゃ': ['dya'], 'ぢゅ': ['dyu'], 'ぢょ': ['dyo'],
  // Katakana compounds
  'キャ': ['kya'], 'キュ': ['kyu'], 'キョ': ['kyo'],
  'シャ': ['sha', 'sya'], 'シュ': ['shu', 'syu'], 'ショ': ['sho', 'syo'],
  'チャ': ['cha', 'tya'], 'チュ': ['chu', 'tyu'], 'チョ': ['cho', 'tyo'],
  'ニャ': ['nya'], 'ニュ': ['nyu'], 'ニョ': ['nyo'],
  'ヒャ': ['hya'], 'ヒュ': ['hyu'], 'ヒョ': ['hyo'],
  'ミャ': ['mya'], 'ミュ': ['myu'], 'ミョ': ['myo'],
  'リャ': ['rya'], 'リュ': ['ryu'], 'リョ': ['ryo'],
  'ギャ': ['gya'], 'ギュ': ['gyu'], 'ギョ': ['gyo'],
  'ジャ': ['ja', 'zya'], 'ジュ': ['ju', 'zyu'], 'ジョ': ['jo', 'zyo'],
  'ビャ': ['bya'], 'ビュ': ['byu'], 'ビョ': ['byo'],
  'ピャ': ['pya'], 'ピュ': ['pyu'], 'ピョ': ['pyo'],
  'ファ': ['fa'], 'フィ': ['fi'], 'フェ': ['fe'], 'フォ': ['fo'],
  'ウィ': ['wi'], 'ウェ': ['we'], 'ウォ': ['wo'],
  'ヴァ': ['va'], 'ヴィ': ['vi'], 'ヴ': ['vu'], 'ヴェ': ['ve'], 'ヴォ': ['vo'],
  'ティ': ['thi'], 'テュ': ['thu'], 'ディ': ['dhi'], 'デュ': ['dhu'],
};

const SMALL_KANA = new Set([
  'ぁ','ぃ','ぅ','ぇ','ぉ','ゃ','ゅ','ょ',
  'ァ','ィ','ゥ','ェ','ォ','ャ','ュ','ョ','ヵ','ヶ',
]);
const SOKUON = new Set(['っ', 'ッ']);
const N_KANA = new Set(['ん', 'ン']);
const VOWELS = new Set(['a','i','u','e','o']);

export interface RomajiAtom {
  kana: string;
  sequences: string[];
  kanaStart: number;
  kanaEnd: number;
  isNAtom: boolean;
}

function nextAtomSeqs(kana: string, from: number): string[] {
  if (from >= kana.length) return [];
  const ch = kana[from];
  const next = kana[from + 1];
  if (next && SMALL_KANA.has(next)) {
    const compound = COMPOUND[ch + next];
    if (compound) return compound;
  }
  return SINGLE[ch] ?? [ch];
}

export function kanaToAtoms(kana: string): RomajiAtom[] {
  const atoms: RomajiAtom[] = [];
  let i = 0;

  while (i < kana.length) {
    const ch = kana[i];

    // っ/ッ — merge with next kana to double first consonant
    if (SOKUON.has(ch)) {
      const nextSeqs = nextAtomSeqs(kana, i + 1);
      if (nextSeqs.length > 0) {
        // Figure out how many chars the next atom covers
        const nextCh = kana[i + 1];
        const nextNext = kana[i + 2];
        const nextLen = (nextNext && SMALL_KANA.has(nextNext) && COMPOUND[nextCh + nextNext]) ? 2 : 1;
        const sokuonSeqs: string[] = [];
        for (const seq of nextSeqs) {
          const first = seq[0];
          if (/[bcdfghjklmnpqrstvwxyz]/.test(first)) {
            sokuonSeqs.push(first + seq);
          }
        }
        if (sokuonSeqs.length > 0) {
          const nextKana = kana.slice(i + 1, i + 1 + nextLen);
          atoms.push({ kana: ch + nextKana, sequences: sokuonSeqs, kanaStart: i, kanaEnd: i + 1 + nextLen, isNAtom: false });
          i += 1 + nextLen;
          continue;
        }
      }
      atoms.push({ kana: ch, sequences: ['xtu', 'xtsu', 'ltsu'], kanaStart: i, kanaEnd: i + 1, isNAtom: false });
      i++;
      continue;
    }

    // ん/ン — sequences depend on what follows
    if (N_KANA.has(ch)) {
      const nextSeqs = nextAtomSeqs(kana, i + 1);
      const nextStart = nextSeqs[0]?.[0] ?? '';
      // Before vowel, y, or n → must use nn
      const mustDouble = VOWELS.has(nextStart) || nextStart === 'y' || nextStart === 'n' || !nextStart;
      const sequences = mustDouble ? ['nn'] : ['n', 'nn'];
      atoms.push({ kana: ch, sequences, kanaStart: i, kanaEnd: i + 1, isNAtom: !mustDouble });
      i++;
      continue;
    }

    // Compound kana (current + small kana)
    if (i + 1 < kana.length && SMALL_KANA.has(kana[i + 1])) {
      const compound = COMPOUND[ch + kana[i + 1]];
      if (compound) {
        atoms.push({ kana: ch + kana[i + 1], sequences: compound, kanaStart: i, kanaEnd: i + 2, isNAtom: false });
        i += 2;
        continue;
      }
    }

    // Single kana
    const seqs = SINGLE[ch];
    if (seqs) {
      atoms.push({ kana: ch, sequences: seqs, kanaStart: i, kanaEnd: i + 1, isNAtom: false });
      i++;
      continue;
    }

    // ASCII / other — type as-is
    atoms.push({ kana: ch, sequences: [ch.toLowerCase()], kanaStart: i, kanaEnd: i + 1, isNAtom: false });
    i++;
  }

  return atoms;
}

export interface InputState {
  atoms: RomajiAtom[];
  atomIndex: number;
  buffer: string;
  pendingN: boolean;
  errors: number;
  attempts: number;
}

export type KeyResult =
  | { ok: true; atomCompleted: boolean; allDone: boolean }
  | { ok: false };

export function createInputState(kana: string): InputState {
  return { atoms: kanaToAtoms(kana), atomIndex: 0, buffer: '', pendingN: false, errors: 0, attempts: 0 };
}

export function processKey(state: InputState, key: string): { state: InputState; result: KeyResult } {
  const { atoms, atomIndex, buffer, pendingN } = state;

  if (atomIndex >= atoms.length) return { state, result: { ok: false } };

  const atom = atoms[atomIndex];
  const newAttempts = state.attempts + 1;

  // Resolve pending ん
  if (pendingN) {
    if (key === 'n') {
      const ns: InputState = { ...state, atomIndex: atomIndex + 1, buffer: '', pendingN: false, attempts: newAttempts };
      return { state: ns, result: { ok: true, atomCompleted: true, allDone: ns.atomIndex >= atoms.length } };
    } else {
      // Complete ん with 'n', then process key for next atom
      const ns: InputState = { ...state, atomIndex: atomIndex + 1, buffer: '', pendingN: false, attempts: newAttempts };
      if (ns.atomIndex >= atoms.length) {
        return { state: ns, result: { ok: true, atomCompleted: true, allDone: true } };
      }
      return processKey(ns, key);
    }
  }

  const newBuffer = buffer + key;
  const prefixMatches = atom.sequences.filter((s) => s.startsWith(newBuffer));
  const exactMatch = prefixMatches.find((s) => s === newBuffer);

  if (prefixMatches.length === 0) {
    return { state: { ...state, errors: state.errors + 1, attempts: newAttempts }, result: { ok: false } };
  }

  if (exactMatch) {
    // Special: ん with ['n','nn'] — set pendingN instead of completing immediately
    if (atom.isNAtom && exactMatch === 'n' && atom.sequences.includes('nn')) {
      return { state: { ...state, buffer: newBuffer, attempts: newAttempts, pendingN: true }, result: { ok: true, atomCompleted: false, allDone: false } };
    }
    const ns: InputState = { ...state, atomIndex: atomIndex + 1, buffer: '', attempts: newAttempts };
    return { state: ns, result: { ok: true, atomCompleted: true, allDone: ns.atomIndex >= atoms.length } };
  }

  // Partial match
  return { state: { ...state, buffer: newBuffer, attempts: newAttempts }, result: { ok: true, atomCompleted: false, allDone: false } };
}

export interface GuideChar {
  char: string;
  status: 'done' | 'active-typed' | 'active-pending' | 'pending';
}

export function buildRomajiGuide(state: InputState): GuideChar[] {
  const { atoms, atomIndex, buffer } = state;
  const guide: GuideChar[] = [];

  for (let i = 0; i < atoms.length; i++) {
    const atom = atoms[i];
    if (i < atomIndex) {
      // Show primary sequence as done
      for (const ch of atom.sequences[0]) guide.push({ char: ch, status: 'done' });
    } else if (i === atomIndex) {
      // Show typed part + remaining from current best-match sequence
      const currentSeq = atom.sequences.find((s) => s.startsWith(buffer)) ?? atom.sequences[0];
      for (let j = 0; j < currentSeq.length; j++) {
        guide.push({ char: currentSeq[j], status: j < buffer.length ? 'active-typed' : 'active-pending' });
      }
    } else {
      for (const ch of atom.sequences[0]) guide.push({ char: ch, status: 'pending' });
    }
  }

  return guide;
}

export function getCompletedKanaEnd(state: InputState): number {
  if (state.atomIndex >= state.atoms.length) return state.atoms[state.atoms.length - 1]?.kanaEnd ?? 0;
  return state.atoms[state.atomIndex].kanaStart;
}
