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
        className="bg-white text-[#111111] rounded-2xl px-6 py-5 flex items-center justify-between animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-center gap-3">
          <span className="bg-[#111] text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            NEXT
          </span>
          <span className="font-semibold text-base">{sessionLabel}</span>
        </div>
        <div className="flex items-center gap-4">
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
      className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl px-6 py-5 flex items-center justify-between transition-colors duration-200 hover:bg-[var(--bg-surface-hover)] animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold text-base text-[var(--text-primary)]">{sessionLabel}</span>
        {hasSprint && sessionLabel === 'Sprint' && (
          <span className="bg-[#E10600] text-white text-[10px] font-medium px-2 py-0.5 rounded">
            SPRINT
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--text-secondary)]">{dateStr} &middot; {timeStr}</span>
        {!isExpired && (
          <span className="font-mono text-sm text-[var(--text-secondary)] tabular-nums hidden sm:inline">
            {String(days).padStart(2, '0')}d : {String(hours).padStart(2, '0')}h : {String(minutes).padStart(2, '0')}m : {String(seconds).padStart(2, '0')}s
          </span>
        )}
      </div>
    </div>
  );
}
