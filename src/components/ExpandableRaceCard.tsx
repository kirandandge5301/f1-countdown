import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { formatDateInZone, formatTimeInZone } from '@/data/timezones';
import { getSessionDisplayName, type RaceWeekend, type Session } from '@/services/openf1';

interface ExpandableRaceCardProps {
  race: RaceWeekend;
  isNext: boolean;
  isVisible: boolean;
  delay: number;
  timezone: string;
  timezoneLabel: string;
}

export default function ExpandableRaceCard({
  race,
  isNext,
  isVisible,
  delay,
  timezone,
  timezoneLabel,
}: ExpandableRaceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const now = new Date();
  const raceSession = race.sessions.find((s: Session) => getSessionDisplayName(s) === 'Race');
  const raceTime = raceSession
    ? formatTimeInZone(raceSession.date_start, timezone)
    : formatTimeInZone(race.meeting.date_start, timezone);

  const getSessionStatus = (session: Session) => {
    const sessionStart = new Date(session.date_start);
    const sessionEnd = session.date_end ? new Date(session.date_end) : new Date(sessionStart.getTime() + 3 * 60 * 60 * 1000);
    
    if (sessionEnd < now) return 'completed';
    if (sessionStart > now) return 'upcoming';
    return 'live';
  };

  const SessionRow = ({ session }: { session: Session }) => {
    const status = getSessionStatus(session);
    const { days, hours } = useCountdown(session.date_start);
    
    const statusBadges = {
      upcoming: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Upcoming' },
      live: { bg: 'bg-red-500/10', text: 'text-red-600', label: '🔴 LIVE' },
      completed: { bg: 'bg-green-500/10', text: 'text-green-600', label: '✓ Completed' },
    };

    const badge = statusBadges[status];

    return (
      <div className="py-3 px-4 border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-surface-hover)] transition-colors">
        <div className="flex items-start justify-between gap-3 flex-col sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${badge.bg} ${badge.text} whitespace-nowrap`}>
              {badge.label}
            </span>
            <span className="font-medium text-[var(--text-primary)] truncate">
              {session.session_name || session.session_type}
            </span>
          </div>

          <div className="flex flex-col items-start gap-1 text-sm sm:items-end w-full sm:w-auto">
            <span className="text-[var(--text-secondary)] whitespace-nowrap">
              {formatDateInZone(session.date_start, timezone)} · {formatTimeInZone(session.date_start, timezone)}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">{timezoneLabel}</span>
            {status === 'upcoming' && (
              <span className="font-mono text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                {String(days).padStart(2, '0')}d {String(hours).padStart(2, '0')}h
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      data-testid={`schedule-race-card-${race.round}`}
      className={`rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-[transform,border-color,background-color,box-shadow] overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.12)] ${
        isNext ? 'ring-1 ring-[#E10600]/30 bg-[rgba(225,6,0,0.03)]' : ''
      } ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header - Always visible */}
      <button
        data-testid={`schedule-race-toggle-${race.round}`}
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 sm:p-6 flex flex-col sm:flex-row items-start justify-between gap-4 hover:bg-[var(--bg-surface-hover)] transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-mono text-sm text-[var(--text-tertiary)]">
              ROUND {String(race.round).padStart(2, '0')}
            </span>
            {isNext && (
              <span className="text-[10px] font-medium tracking-widest bg-[#E10600] text-white px-3 py-1 rounded-full whitespace-nowrap">
                NEXT
              </span>
            )}
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] break-words">
            {race.meeting.meeting_name}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {race.meeting.circuit_short_name}
          </p>
        </div>

        <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
          <span className="font-mono text-base md:text-lg font-bold text-[var(--text-primary)]">
            {raceTime}
          </span>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{timezoneLabel}</p>
          {race.isSprint && (
            <span className="inline-block bg-[#E10600] text-white text-xs font-medium px-2 py-1 rounded mt-2 whitespace-nowrap">
              SPRINT
            </span>
          )}
        </div>

        <ChevronDown
          className={`self-end sm:self-auto ml-0 sm:ml-2 mt-1 transition-transform duration-300 flex-shrink-0 ${
            expanded ? 'rotate-180' : ''
          }`}
          size={20}
        />
      </button>

      {/* Sessions - Expandable */}
      {expanded && (
        <div className="bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] animate-in fade-in duration-300">
          <div className="divide-y divide-[var(--border-subtle)]">
            {race.sessions.map((session: Session, i: number) => (
              <SessionRow key={session.session_key || i} session={session} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
