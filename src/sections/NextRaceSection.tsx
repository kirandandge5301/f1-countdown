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
  const shareOnX = () => {
  if (!race || !nextSessionTime) return;

  const diff = nextSessionTime.getTime() - Date.now();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  const raceName = race.meeting.meeting_name;

  const hashtag =
    raceName
      .replace('Grand Prix', 'GP')
      .replace(/\s+/g, '') || 'F1';

  const tweet = `🏁 ${raceName} in ${days} days ${hours} hours.

Track every F1 session live at gpcountdown.com

#F1 #${hashtag}`;

  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`,
    '_blank'
  );
};
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
<p>{race.meeting.circuit_short_name}</p>
<p>{race.meeting.location}</p>
            
            
<p className="text-2xl font-semibold text-[var(--text-primary)] mb-10">
  The roar is coming.
</p>
            {/* Main Countdown */}
           {/* Main Countdown */}
<div className="mb-16">
  <CountdownDisplay targetTime={nextSessionTime} size="hero" />

  <div className="flex justify-center mt-8">
    <button
      onClick={shareOnX}
      className="px-6 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-medium hover:scale-[1.02] transition-all duration-200"
    >
      🏁 Share Countdown on X
    </button>
  </div>
</div>

{/* Circuit Information */}
{circuitInfo && (
  <div className="max-w-3xl mx-auto mb-16 text-center">
   <div className="flex items-center justify-center gap-2 mb-3">
  <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
  <span className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
    Circuit Guide
  </span>
</div>

<h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
      {race.meeting.circuit_short_name}
    </h3>

    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-4">
      {circuitInfo.laps} LAPS • {circuitInfo.length} • {circuitInfo.distance}
    </p>

    <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
      {circuitInfo.fact}
    </p>
  </div>
)}  
