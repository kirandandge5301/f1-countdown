import { useTimezone } from '@/context/TimezoneContext';
import { useData } from '@/context/DataContext';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import CountdownDisplay from '@/components/CountdownDisplay';
import SessionCard from '@/components/SessionCard';
import RaceInsight from '@/components/RaceInsight';
import CalendarErrorCard from '@/components/CalendarErrorCard';
import { getSessionDisplayName } from '@/services/openf1';
import type { Session } from '@/services/openf1';
import { CIRCUIT_INFO } from '@/data/circuitInfo';

export default function NextRaceSection() {
  const { timezoneLabel } = useTimezone();
  const {
    nextRace,
    heroState,
    totalRounds,
    calendarError,
    calendarLoading,
    refreshCalendar,
    loading: initialLoading
  } = useData();
  const loading = initialLoading || calendarLoading;
  const [sectionRef, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });

  const race = nextRace?.race;
  const nextSession = nextRace?.nextSession;
  const allSessions = nextRace?.allSessions || [];
  const nextSessionTime = nextSession ? new Date(nextSession.date_start) : null;

  // Times taken from Jolpica's schedule because OpenF1 has no sessions for this weekend yet
  const isProvisional = heroState?.kind === 'race' && heroState.provisional;
  // With no time at all, show the race day (meeting.date_end is the race day then)
  const provisionalDate = isProvisional && race
    ? new Date(race.meeting.date_end).toLocaleDateString(undefined, {
        timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric'
      })
    : null;
  const provisionalLabel = nextSession
    ? `${nextSession.session_name === 'Race' ? 'Race start' : getSessionDisplayName(nextSession)} · times confirmed closer to the date`
    : '';

  const circuitInfo = race ? CIRCUIT_INFO[race.meeting.meeting_name] : null;

  const shareOnX = () => {
    if (!race || !nextSessionTime) return;
    const diff = nextSessionTime.getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const raceName = race.meeting.meeting_name;

    const tweet = `🏁 ${raceName} in ${days}d ${hours}h!\nTrack every session live at gpcountdown.com\n#F1`;

    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, '_blank');
  };

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
        {loading ? (
          <div className="animate-pulse space-y-8 text-center">
            <div className="h-12 w-64 mx-auto bg-[var(--bg-surface)] rounded-xl" />
            <div className="h-32 bg-[var(--bg-surface)] rounded-2xl" />
          </div>
        ) : calendarError ? (
          <div className="py-20">
            <CalendarErrorCard message={calendarError} onRetry={() => refreshCalendar()} />
          </div>
        ) : heroState?.kind === 'complete' ? (
          <div className="text-center py-20">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
              <span className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
                OFF-SEASON
              </span>
            </div>
            <h1 className="text-[clamp(28px,6vw,48px)] font-semibold text-[var(--text-primary)] tracking-[-0.02em] leading-tight">
              {heroState.completedYear} season complete · {heroState.nextYear} calendar coming soon
            </h1>
          </div>
        ) : race ? (
          <>
            {/* Top label */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                <span className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
                  NEXT RACE WEEKEND
                </span>
              </div>
              <span className="font-mono text-xs text-[var(--text-tertiary)]">
                ROUND {String(race.round).padStart(2, '0')}{totalRounds ? ` / ${totalRounds}` : ''}
              </span>
            </div>

            {/* Race Name - Smaller on mobile */}
            <h1 className="text-[clamp(28px,8vw,52px)] font-semibold text-[var(--text-primary)] tracking-[-0.02em] leading-tight mb-3 md:mb-4 text-center md:text-left">
              {race.meeting.meeting_name}
            </h1>

            <p className="text-[17px] md:text-xl font-medium text-[var(--text-secondary)] mb-10 md:mb-12 text-center md:text-left">
              The roar is coming.
            </p>

            {/* Countdown - Smaller & Better Balanced */}
            {isProvisional && !nextSessionTime ? (
              // Jolpica has a date but no start time yet: no countdown, never an invented time
              <p className="mb-12 md:mb-16 text-center text-sm text-[var(--text-secondary)]">
                {provisionalDate} · times confirmed closer to the date
              </p>
            ) : (
              <div className="mb-12 md:mb-16 flex flex-col items-center">
                <CountdownDisplay targetTime={nextSessionTime} size="hero" />
                {isProvisional && (
                  <p className="mt-6 text-sm text-[var(--text-secondary)]">
                    {provisionalLabel}
                  </p>
                )}
              </div>
            )}

            {/* Share Button */}
            <div className="flex justify-center mb-12 md:mb-16">
              <button
                onClick={shareOnX}
                className="px-8 py-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-sm font-medium flex items-center gap-2 transition-all active:scale-95"
              >
                🏁 Share Countdown on X
              </button>
            </div>

            {/* Circuit Info */}
            {circuitInfo && (
              <div className="max-w-3xl mx-auto mb-12 text-center px-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {race.meeting.circuit_short_name}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  {circuitInfo.fact}
                </p>
              </div>
            )}

            {/* Race Insights */}
            <div className="max-w-4xl mx-auto mb-12 px-2">
              <RaceInsight race={race} isVisible={isVisible} />
            </div>

            {/* Session Cards */}
            <div className="max-w-[800px] mx-auto space-y-3 px-2">
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
          <div className="text-center py-20">
            <p className="text-[var(--text-secondary)]">No upcoming races found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
