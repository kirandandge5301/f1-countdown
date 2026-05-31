import { useMemo } from 'react';
import { findNextRaceAndSession } from '@/data/raceLogic';
import { useTimezone } from '@/context/TimezoneContext';
import CountdownDisplay from '@/components/CountdownDisplay';
import SessionCard from '@/components/SessionCard';

export default function NextRaceSection() {
  const { timezoneLabel } = useTimezone();
  const { race, nextSession, allSessions } = useMemo(() => findNextRaceAndSession(), []);

  const nextSessionTime = nextSession ? new Date(nextSession.sessionTime) : null;

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
        className="absolute inset-0 pointer-events-none opacity-100"
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
        {/* Top row: label + round badge */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
            <span className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
              {nextSession ? `NEXT \u00b7 ${nextSession.sessionLabel.toUpperCase()}` : 'NEXT RACE'}
            </span>
          </div>
          <span className="font-mono text-xs text-[var(--text-tertiary)] tracking-[0.05em]">
            ROUND {String(race.round).padStart(2, '0')} / 24
          </span>
        </div>

        {/* Race name */}
        <h1 className="text-[clamp(36px,5vw,64px)] font-semibold text-[var(--text-primary)] tracking-[-0.02em] leading-tight mb-2">
          {race.gp}
        </h1>

        {/* Circuit + Location */}
        <p className="text-base text-[var(--text-secondary)] mb-12">
          {race.circuit} &middot; {race.city}, {race.country}
        </p>

        {/* Main Countdown */}
        <div className="mb-16">
          <CountdownDisplay targetTime={nextSessionTime} size="hero" />
        </div>

        {/* Session Cards */}
        <div className="max-w-[800px] mx-auto space-y-3">
          {allSessions.map((session, i) => (
            <SessionCard
              key={session.sessionKey}
              sessionLabel={session.sessionLabel}
              sessionTime={session.sessionTime}
              isActive={session.isNextSession}
              hasSprint={race.sprint}
              delay={100 * i}
            />
          ))}
        </div>

        {/* Timezone note */}
        <p className="text-center text-sm text-[var(--text-tertiary)] mt-8">
          All times shown in {timezoneLabel}
        </p>
      </div>
    </section>
  );
}
