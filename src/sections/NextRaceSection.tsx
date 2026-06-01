import { useTimezone } from '@/context/TimezoneContext';
import { useData } from '@/context/DataContext';
import CountdownDisplay from '@/components/CountdownDisplay';
import SessionCard from '@/components/SessionCard';
import { getSessionDisplayName } from '@/services/openf1';
import type { Session } from '@/services/openf1';
import { CIRCUIT_INFO } from '@/data/circuitInfo';
export default function NextRaceSection() {
  const { timezoneLabel } = useTimezone();
  const { nextRace, loading } = useData();
  
  const race = nextRace?.race;
  const nextSession = nextRace?.nextSession;
  const allSessions = nextRace?.allSessions || [];

  const nextSessionTime = nextSession ? new Date(nextSession.date_start) : null;
  const circuitInfo = race
  ? CIRCUIT_INFO[race.meeting.meeting_name]
  : null;
  return (
    <section
      id="next-race"
      className="relative min-h-screen flex flex-col justify-center px-[clamp(20px,5vw,64px)] py-[clamp(60px,10vh,120px)] overflow-hidden"
    >
      {/* Ambient red glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(225,6,0,0.08) 0%, transparent 70%)'
        }}
      />

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--hero-grid-lines) 1px, transparent 1px),
            linear-gradient(to bottom, var(--hero-grid-lines) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {loading ? (
  <div className="animate-pulse space-y-8">
    <div className="h-12 w-64 bg-[var(--bg-surface)] rounded-xl" />
    <div className="h-6 w-40 bg-[var(--bg-surface)] rounded-lg" />
    <div className="h-32 bg-[var(--bg-surface)] rounded-2xl" />
    <div className="space-y-3">
      <div className="h-14 bg-[var(--bg-surface)] rounded-xl" />
      <div className="h-14 bg-[var(--bg-surface)] rounded-xl" />
      <div className="h-14 bg-[var(--bg-surface)] rounded-xl" />
    </div>
  </div>
) : race ? (
          <>
            {/* Top row: label + round badge */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                <span className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
                  {nextSession ? `NEXT \u00b7 ${getSessionDisplayName(nextSession).toUpperCase()}` : 'NEXT RACE'}
                </span>
              </div>
              <span className="font-mono text-xs text-[var(--text-tertiary)] tracking-[0.05em]">
                ROUND {String(race.round).padStart(2, '0')} / 24
              </span>
            </div>

            {/* Race name */}
            <h1 className="text-[clamp(36px,5vw,64px)] font-semibold text-[var(--text-primary)] tracking-[-0.02em] leading-tight mb-2">
              {race.meeting.meeting_name}
            </h1>

            {/* Circuit + Location */}
            <p className="text-base text-[var(--text-secondary)] mb-12">
              {race.meeting.circuit_short_name} &middot; {race.meeting.location}, {race.meeting.country_code}
            </p>

            {/* Main Countdown */}
           {/* Main Countdown */}
<div className="mb-12">
  <CountdownDisplay targetTime={nextSessionTime} size="hero" />
</div>

{/* Circuit Information */}
{circuitInfo && (
  <div className="max-w-3xl mx-auto mb-16">
    <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
        <span className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
          Circuit Information
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6 text-center">
        <div>
          <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--text-tertiary)] mb-2">
            Laps
          </p>
          <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">
            {circuitInfo.laps}
          </p>
        </div>

        <div>
          <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--text-tertiary)] mb-2">
            Length
          </p>
          <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">
            {circuitInfo.length}
          </p>
        </div>

        <div>
          <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--text-tertiary)] mb-2">
            Distance
          </p>
          <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">
            {circuitInfo.distance}
          </p>
        </div>
      </div>
    </div>
  </div>
)}

            {/* Session Cards */}
            <div className="max-w-[800px] mx-auto space-y-3">
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

            {/* Timezone note */}
            <p className="text-center text-sm text-[var(--text-tertiary)] mt-8">
              All times shown in {timezoneLabel}
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-[var(--text-secondary)]">No upcoming races found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
