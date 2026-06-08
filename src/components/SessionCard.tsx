import { useTimezone } from '@/context/TimezoneContext';
import { useCountdown } from '@/hooks/useCountdown';

interface SessionCardProps {
  sessionLabel: string;
  sessionTime: string;
  isActive: boolean;
  hasSprint?: boolean;
  delay?: number;
}

export default function SessionCard({ sessionLabel, sessionTime, isActive, hasSprint, delay = 0 }: SessionCardProps) {
  const { formatTime, formatDate } = useTimezone();
  const { days, hours, minutes, seconds, isExpired } = useCountdown(sessionTime);

  const dateStr = formatDate(sessionTime);
  const timeStr = formatTime(sessionTime);

  if (isActive) {
    return (
      <div
  data-testid={`session-card-${sessionLabel.toLowerCase().replace(/\s+/g, '-')}`}
  className="bg-white text-[#111111] rounded-2xl px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 animate-fade-in-up shadow-[0_18px_80px_rgba(0,0,0,0.08)]"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span data-testid="next-session-badge" className="bg-[#111] text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            NEXT
          </span>
          <span className="font-semibold text-base leading-tight">
  {sessionLabel}
</span>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <span className="text-sm text-[#666]">{dateStr} &middot; {timeStr}</span>
          {!isExpired && (
            <span className="font-mono text-sm tabular-nums">
              {String(days).padStart(2, '0')}d : {String(hours).padStart(2, '0')}h : {String(minutes).padStart(2, '0')}m : {String(seconds).padStart(2, '0')}s
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
  data-testid={`session-card-${sessionLabel.toLowerCase().replace(/\s+/g, '-')}`}
  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-[background-color,transform,border-color] duration-200 hover:bg-[var(--bg-surface-hover)] hover:-translate-y-0.5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <span className="font-semibold text-base text-[var(--text-primary)]">{sessionLabel}</span>
        {hasSprint && sessionLabel === 'Sprint' && (
          <span className="bg-[#E10600] text-white text-[10px] font-medium px-2 py-0.5 rounded">
            SPRINT
          </span>
        )}
      </div>
      <div className="flex flex-col items-start gap-2 md:items-end">
        <span className="text-sm text-[var(--text-secondary)] break-words">{dateStr} &middot; {timeStr}</span>
        {!isExpired && (
          <span className="font-mono text-sm text-[var(--text-secondary)] tabular-nums hidden sm:inline">
            {String(days).padStart(2, '0')}d : {String(hours).padStart(2, '0')}h : {String(minutes).padStart(2, '0')}m : {String(seconds).padStart(2, '0')}s
          </span>
        )}
      </div>
    </div>
  );
}
