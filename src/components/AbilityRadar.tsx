'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { AbilityStats } from '@/types';

interface Props {
  stats: AbilityStats;
  size?: number;
}

const LABELS: Record<keyof AbilityStats, string> = {
  speed: '速度',
  accuracy: '正確性',
  stability: '安定性',
  endurance: '持久力',
  reaction: '反応速度',
};

export default function AbilityRadar({ stats, size = 260 }: Props) {
  const data = (Object.keys(stats) as (keyof AbilityStats)[]).map((key) => ({
    subject: LABELS[key],
    value: stats[key],
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#2a2a50" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
        />
        <Radar
          name="ability"
          dataKey="value"
          stroke="#7c3aed"
          fill="#7c3aed"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
