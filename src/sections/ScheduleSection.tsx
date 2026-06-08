import { useTimezone } from '@/context/TimezoneContext';
import { useData } from '@/context/DataContext';
import ExpandableRaceCard from '@/components/ExpandableRaceCard';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { RaceWeekend, Session } from '@/services/openf1';

export default function ScheduleSection() {
  const { timezone, timezoneLabel } = useTimezone();
  const { raceWeekends, raceLoading, hasLiveRaceData } = useData();
  const [sectionRef, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  const now = new Date();
  const nextRaceIndex = raceWeekends.findIndex((raceWeekend: RaceWeekend) =>
    raceWeekend.sessions.some((session: Session) => new Date(session.date_start) > now)
  );

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

        {!hasLiveRaceData && !raceLoading && (
          <div className="mb-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            Live schedule data is resting for the moment, so GPCountdown is showing the built-in season calendar.
          </div>
        )}

        {raceLoading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-[var(--bg-surface)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {raceWeekends.map((race: RaceWeekend, i: number) => {
              const isNext = i === nextRaceIndex;

              return (
                <ExpandableRaceCard
                  key={race.meeting.meeting_key || i}
                  race={race}
                  isNext={isNext}
                  isVisible={isVisible}
                  delay={i * 50}
                  timezone={timezone}
                  timezoneLabel={timezoneLabel}
                />
              );
            })}
          </div>
        )}

        {!raceLoading && raceWeekends.length === 0 && (
          <div className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
            <p className="text-lg font-medium text-[var(--text-primary)]">The calendar hasn’t fired up yet.</p>
            <p className="mt-3 text-[var(--text-secondary)]">As soon as sessions land, the full season view will repopulate automatically.</p>
          </div>
        )}
      </div>
    </section>
  );
}
