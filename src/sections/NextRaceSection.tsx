import { useTimezone } from '@/context/TimezoneContext';
import { useData } from '@/context/DataContext';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import CountdownDisplay from '@/components/CountdownDisplay';
import CircuitDetailsCard from '@/components/CircuitDetailsCard';
import SessionCard from '@/components/SessionCard';
import RaceInsight from '@/components/RaceInsight';
import { getSessionDisplayName } from '@/services/openf1';
import type { Session } from '@/services/openf1';
import { CIRCUIT_INFO } from '@/data/circuitInfo';
import { Flag, Flame } from 'lucide-react';

export default function NextRaceSection() {
  const { timezoneLabel } = useTimezone();
  const { nextRace, raceWeekExperience, raceLoading, hasLiveRaceData, totalRounds } = useData();
  const [sectionRef, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });

  const race = nextRace?.race;
  const nextSession = nextRace?.nextSession;
  const allSessions = nextRace?.allSessions || [];
  const nextSessionTime = nextSession ? new Date(nextSession.date_start) : null;

  const circuitInfo = race ? CIRCUIT_INFO[race.meeting.meeting_name] : null;

  return (
    <section
      ref={sectionRef}
      id="next-race"
      className="relative min-h-screen flex flex-col justify-center px-[clamp(20px,5vw,64px)] py-[clamp(60px,10vh,120px)] overflow-hidden"
    >
      {/* Ambient red glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(225,6,0,0.08) 0%, transparent 70%)' }}
      />

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, var(--hero-grid-lines) 1px, transparent 1px), linear-gradient(to bottom, var(--hero-grid-lines) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {raceLoading ? (
          <div className="animate-pulse space-y-8 text-center">
            <div className="h-12 w-64 mx-auto bg-[var(--bg-surface)] rounded-xl" />
            <div className="h-32 bg-[var(--bg-surface)] rounded-2xl" />
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-24 rounded-2xl bg-[var(--bg-surface)]" />
              ))}
            </div>
          </div>
        ) : race ? (
          <>
            {/* Top label */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                <span className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
                  NEXT RACE WEEKEND
                </span>
              </div>
              <span className="font-mono text-xs text-[var(--text-tertiary)]">
                ROUND {String(race.round).padStart(2, '0')} / {String(totalRounds).padStart(2, '0')}
              </span>
            </div>

            {raceWeekExperience && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] mb-8 md:mb-10">
                <div
                  data-testid="race-week-experience-card"
                  className="rounded-[30px] border border-[var(--border-subtle)] bg-[linear-gradient(140deg,rgba(225,6,0,0.12),transparent_48%),var(--bg-surface)] p-5 sm:p-7 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-[#E10600]/25 hover:shadow-[0_24px_80px_rgba(0,0,0,0.14)]"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#E10600]/20 bg-[#E10600]/10 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[#E10600] uppercase">
                      <Flag size={12} />
                      {raceWeekExperience.label}
                    </span>
                    {!hasLiveRaceData && (
                      <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                        Verified archive season
                      </span>
                    )}
                  </div>

                  <h1 data-testid="next-race-title" className="text-[clamp(30px,8vw,54px)] font-semibold text-[var(--text-primary)] tracking-[-0.03em] leading-tight text-left">
                    {race.meeting.meeting_name}
                  </h1>

                  <p data-testid="race-week-primary-copy" className="mt-4 text-lg md:text-xl font-medium text-[var(--text-secondary)] text-left">
                    {raceWeekExperience.primaryCopy}
                  </p>

                  <p data-testid="race-week-secondary-copy" className="mt-3 max-w-2xl text-sm sm:text-base text-[var(--text-tertiary)] leading-relaxed text-left">
                    {raceWeekExperience.secondaryCopy}
                  </p>
                </div>

                <div className="rounded-[30px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 flex flex-col justify-between gap-5">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)] uppercase">
                      <Flame size={12} />
                      Weekend Context
                    </div>
                    <p data-testid="race-week-next-moment" className="mt-5 text-[var(--text-primary)] text-lg font-semibold leading-snug">
                      {raceWeekExperience.nextMoment}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Circuit</div>
                      <div className="mt-2 text-base font-medium text-[var(--text-primary)]">{race.meeting.circuit_short_name}</div>
                    </div>
                    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Timezone</div>
                      <div className="mt-2 text-sm font-medium text-[var(--text-primary)]">{timezoneLabel}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Countdown - Smaller & Better Balanced */}
            <div className="mb-12 md:mb-16 flex justify-center">
              <CountdownDisplay targetTime={nextSessionTime} size="hero" />
            </div>

            <div className="mb-12 text-center">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[var(--text-tertiary)]">
                Every Second Matters.
              </p>
            </div>

            <div className="max-w-5xl mx-auto mb-12 px-2">
              <CircuitDetailsCard
                meetingName={race.meeting.meeting_name}
                circuitName={race.meeting.circuit_short_name}
                city={race.meeting.location}
                country={race.meeting.country_name}
                circuitInfo={circuitInfo}
                isVisible={isVisible}
              />
            </div>

            {/* Race Insights */}
            <div className="max-w-4xl mx-auto mb-12 px-2">
              <RaceInsight race={race} isVisible={isVisible} />
            </div>

            {/* Session Cards */}
            <div className="max-w-[820px] mx-auto space-y-3 px-2">
              {allSessions.map((session: Session, i: number) => (
                <SessionCard
                  key={session.session_key || i}
                  sessionLabel={getSessionDisplayName(session)}
                  sessionTime={session.date_start}
                  isActive={nextSession?.session_key === session.session_key}
                  hasSprint={race.isSprint}
                  delay={100 * i}
                />
              ))}
            </div>

            <p className="text-center text-sm text-[var(--text-tertiary)] mt-10">
              All times shown in {timezoneLabel}
            </p>
          </>
        ) : (
          <div className="text-center py-20 rounded-[30px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] max-w-3xl mx-auto px-6">
            <p className="text-[var(--text-primary)] text-lg font-medium">The calendar is between chapters right now.</p>
            <p className="text-[var(--text-secondary)] mt-3">Once the next weekend is confirmed, the countdown and session board will light back up automatically.</p>
          </div>
        )}
      </div>
    </section>
  );
}
