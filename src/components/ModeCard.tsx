import Link from 'next/link';

interface Props {
  href: string;
  icon: string;
  title: string;
  description: string;
  accent?: string;
}

export default function ModeCard({ href, icon, title, description, accent = 'violet' }: Props) {
  const accentMap: Record<string, string> = {
    violet: 'hover:border-violet-500/60 group-hover:text-violet-400',
    emerald: 'hover:border-emerald-500/60 group-hover:text-emerald-400',
    amber: 'hover:border-amber-500/60 group-hover:text-amber-400',
    cyan: 'hover:border-cyan-500/60 group-hover:text-cyan-400',
  };

  return (
    <Link href={href} className="group block">
      <div
        className={`p-6 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${accentMap[accent] ?? accentMap.violet}`}
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="font-bold text-white text-lg mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </Link>
  );
}
