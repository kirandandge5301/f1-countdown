import { RACE_INSIGHTS } from '@/data/gp-insights';
import type { RaceWeekend } from '@/services/openf1';

interface RaceInsightProps {
  race: RaceWeekend | null;
  isVisible: boolean;
}

export default function RaceInsight({ race, isVisible }: RaceInsightProps) {
  if (!race) return null;

  const insights = RACE_INSIGHTS[race.meeting.meeting_name];
  if (!insights) return null;

  const insightCards = [
    { label: 'Circuit', value: insights.circuit },
    { label: 'Historical', value: insights.historical },
    { label: 'Record', value: insights.record },
    { label: 'Trivia', value: insights.trivia },
  ];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{ animationDelay: '100ms' }}
    >
      {insightCards.map((card, i) => (
        <div
          key={i}
          className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 hover:border-[#E10600]/30 transition-all ${
            isVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
          style={{ animationDelay: `${150 + i * 50}ms` }}
        >
          <p className="text-[10px] font-semibold tracking-widest text-[#E10600] uppercase mb-2">
            {card.label}
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
