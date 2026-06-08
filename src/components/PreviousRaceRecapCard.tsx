import { getConstructorBranding } from '@/data/constructorBranding';
import type { PreviousRaceRecap } from '@/data/raceRecaps';

interface PreviousRaceRecapCardProps {
  recap: PreviousRaceRecap;
  isVisible: boolean;
}

const RECAP_ITEMS = [
  { key: 'winner', label: 'Winner' },
  { key: 'p2', label: 'P2' },
  { key: 'p3', label: 'P3' },
  { key: 'polePosition', label: 'Pole Position' },
  { key: 'fastestLap', label: 'Fastest Lap' },
] as const;

export default function PreviousRaceRecapCard({ recap, isVisible }: PreviousRaceRecapCardProps) {
  return (
    <div
      data-testid="previous-race-recap-card"
      className={`rounded-[32px] border border-[var(--border-subtle)] bg-[linear-gradient(135deg,rgba(225,6,0,0.06),transparent_40%),var(--bg-surface)] p-6 sm:p-8 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-[#E10600]/25 hover:shadow-[0_24px_100px_rgba(0,0,0,0.12)] ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="inline-flex items-center rounded-full border border-[#E10600]/20 bg-[#E10600]/10 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[#E10600] uppercase">
              Previous Grand Prix
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">{recap.source === 'live' ? 'Live-backed recap' : 'Launch seed recap'}</span>
          </div>
          <h2 className="text-[clamp(30px,4.5vw,52px)] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
            {recap.raceName}
          </h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-[var(--text-secondary)]">
            The podium is set, the pole sitter has been found, and the fastest lap still tells its own story.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Race Date</div>
          <div data-testid="previous-race-date" className="mt-1 text-base font-medium text-[var(--text-primary)]">
            {new Date(recap.raceDate).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {RECAP_ITEMS.map(({ key, label }, index) => {
          const driver = recap[key];
          const branding = getConstructorBranding(driver.team);

          return (
            <div
              key={key}
              className={`rounded-3xl border border-[var(--border-subtle)] p-5 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[#E10600]/20 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{
                animationDelay: `${120 + index * 60}ms`,
                background: `linear-gradient(150deg, ${branding.secondary} 0%, rgba(0,0,0,0.12) 100%)`,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/60">{label}</span>
                <span
                  className="inline-flex min-w-[48px] justify-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.14em]"
                  style={{ backgroundColor: branding.primary, color: branding.accentText }}
                >
                  {driver.code}
                </span>
              </div>

              <div className="mt-6">
                <div data-testid={`recap-${key}-name`} className="text-lg font-semibold text-white">
                  {driver.name}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: branding.primary }} />
                  <span className="text-sm text-white/72">{driver.team}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
