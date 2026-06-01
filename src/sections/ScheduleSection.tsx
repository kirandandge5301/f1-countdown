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
            FULL SEASON • 24 ROUNDS
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-[clamp(32px,4vw,56px)] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-tight mb-4">
          2026 Calendar.
        </h2>

        <p className="text-base text-[var(--text-secondary)] max-w-[480px] mb-10">
          Every round of the FIA Formula One World Championship. Times shown in {timezoneLabel}.
        </p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-[var(--bg-surface)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {raceWeekends.map((race: RaceWeekend, i: number) => {
              const isNext = i === 0; // Simplify for now
              const raceSession = race.sessions.find(s => s.session_type === 'Race');
              const raceTime = raceSession
                ? formatTimeInZone(raceSession.date_start, timezone)
                : formatTimeInZone(race.meeting.date_start, timezone);

              return (
                <div
                  key={race.meeting.meeting_key || i}
                  className={`rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 transition-all hover:border-[#E10600]/30 ${
                    isNext ? 'ring-1 ring-[#E10600]/30 bg-[rgba(225,6,0,0.03)]' : ''
                  } ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-[var(--text-tertiary)]">
                          ROUND {String(race.round).padStart(2, '0')}
                        </span>
                        {isNext && (
                          <span className="text-[10px] font-medium tracking-widest bg-[#E10600] text-white px-3 py-1 rounded-full">
                            NEXT
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-1">
                        {race.meeting.meeting_name}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-lg font-bold text-[var(--text-primary)]">
                        {raceTime}
                      </span>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{timezoneLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-[var(--text-secondary)]">{race.meeting.circuit_short_name}</p>
                      <p className="font-mono text-xs text-[var(--text-tertiary)]">
                        {formatDateDisplay(race.meeting.date_start)}
                      </p>
                    </div>

                    {race.isSprint && (
                      <span className="bg-[#E10600] text-white text-xs font-medium px-4 py-1.5 rounded-xl">
                        SPRINT WEEKEND
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
