import { useTimezone } from '@/context/TimezoneContext';
import { useData } from '@/context/DataContext';
import { formatTimeInZone } from '@/data/timezones';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { RaceWeekend } from '@/services/openf1';

export default function ScheduleSection() {
  const { timezone, timezoneLabel } = useTimezone();
  const { raceWeekends, loading } = useData();
  const [sectionRef, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }).toUpperCase();
    const dayNum = d.getUTCDate().toString().padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
    return `${dayName} ${dayNum} ${month}`;
  };

  return (
    <section
      ref={sectionRef}
      id="schedule"
      className="px-[clamp(20px,5vw,64px)] py-[clamp(60px,10vh,120px)]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
          <span className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
            FULL SEASON &middot; 24 ROUNDS
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-[clamp(32px,4vw,56px)] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-tight mb-4">
          2026 Calendar.
        </h2>

        {/* Description */}
        <p className="text-base text-[var(--text-secondary)] max-w-[480px] mb-8">
          Every round of the FIA Formula One World Championship. Times shown in {timezoneLabel}.
        </p>

        {/* Loading state */}
        {loading ? (
  <div className="space-y-3">
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="h-16 rounded-xl bg-[var(--bg-surface)] animate-pulse"
      />
    ))}
  </div>
) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[60px_120px_50px_1fr_140px] gap-4 py-3 border-b border-[var(--border-subtle)]">
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase">ROUND</span>
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase">DATE</span>
              <span></span>
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase">RACE</span>
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase text-right">LIGHTS OUT</span>
            </div>

            {/* Race Rows */}
            {raceWeekends.map((race: RaceWeekend, i: number) => {
              const isNext = i === 0 || (raceWeekends[i - 1] && new Date(race.meeting.date_start) > new Date());
              // Find the race session for lights out time
              const raceSession = race.sessions.find(s => s.session_type === 'Race');
              const raceTime = raceSession
                ? formatTimeInZone(raceSession.date_start, timezone)
                : formatTimeInZone(race.meeting.date_start, timezone);

              return (
                <div
                  key={race.meeting.meeting_key || i}
                  className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[60px_120px_50px_1fr_140px] gap-2 md:gap-4 py-4 border-b border-[var(--border-subtle)] items-center transition-colors hover:bg-[var(--row-hover)] ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0'
                  } ${isNext ? 'bg-[rgba(225,6,0,0.03)]' : ''}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Round */}
                  <div className="flex items-center gap-2">
                    {isNext && <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shrink-0" />}
                    <span className="font-mono text-sm text-[var(--text-tertiary)]">
                      {String(race.round).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Date */}
                  <span className="font-mono text-sm text-[var(--text-primary)]">
                    {formatDateDisplay(race.meeting.date_start)}
                  </span>

                  {/* Country Code */}
                  <span className="font-mono text-lg font-bold text-[var(--text-primary)] hidden md:block">
                    {race.meeting.country_code}
                  </span>

                  {/* Race Info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-base font-medium ${isNext ? 'text-[#E10600]' : 'text-[var(--text-primary)]'}`}>
                        {race.meeting.meeting_name}
                      </span>
                      {race.isSprint && (
                        <span className="bg-[#E10600] text-white text-[10px] font-medium px-2 py-0.5 rounded shrink-0">
                          SPRINT
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-[var(--text-tertiary)] block mt-0.5">
                      {race.meeting.circuit_short_name}
                    </span>
                    <span className="font-mono text-xs font-bold text-[var(--text-primary)] mt-1 md:hidden">
                      {race.meeting.country_code}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="text-right">
                    <span className="font-mono text-base text-[var(--text-primary)]">{raceTime}</span>
                    <span className="font-mono text-xs text-[var(--text-tertiary)] block">{timezoneLabel}</span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
}
