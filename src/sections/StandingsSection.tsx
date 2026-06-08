import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { getConstructorBranding } from '@/data/constructorBranding';
import type { EnrichedConstructorStanding, EnrichedDriverStanding } from '@/services/openf1';

type Tab = 'drivers' | 'constructors';

const POSITION_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32'
};

export default function StandingsSection() {
  const [activeTab, setActiveTab] = useState<Tab>('drivers');
  const [sectionRef, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const { driverStandings, constructorStandings, standingsLoading, hasLiveStandings } = useData();

  return (
    <section
      ref={sectionRef}
      id="standings"
      className="px-[clamp(20px,5vw,64px)] py-[clamp(60px,10vh,120px)]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
          <span className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
            STANDINGS
          </span>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h2 className="text-[clamp(32px,5vw,52px)] font-semibold text-[var(--text-primary)] tracking-[-0.02em] leading-tight">
          Championship Standings.
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-xl">
              The front of the field, updated with the current championship picture and sharpened team identity.
            </p>
          </div>

          <div className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {hasLiveStandings ? 'OpenF1 standings active' : 'Standings feed unavailable'}
          </div>
        </div>

        {/* Tab Control - Better on mobile */}
        <div className="inline-flex w-full sm:w-auto gap-1 bg-[var(--bg-surface)] rounded-xl p-1 mb-8">
          <button
            data-testid="standings-tab-drivers"
            onClick={() => setActiveTab('drivers')}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'drivers'
                ? 'bg-[#E10600] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Drivers
          </button>
          <button
            data-testid="standings-tab-constructors"
            onClick={() => setActiveTab('constructors')}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'constructors'
                ? 'bg-[#E10600] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Constructors
          </button>
        </div>

        {standingsLoading ? (
          <div className="space-y-4 py-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-[var(--bg-surface)] animate-pulse" />
            ))}
          </div>
        ) : !hasLiveStandings || (driverStandings.length === 0 && constructorStandings.length === 0) ? (
          <div className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
            <p className="text-lg font-medium text-[var(--text-primary)]">Standings currently unavailable.</p>
            <p className="mt-3 text-[var(--text-secondary)]">GPCountdown will publish the championship tables again as soon as OpenF1 returns a verified update.</p>
          </div>
        ) : (
          <>
            {/* DRIVERS TAB */}
            {activeTab === 'drivers' && (
  <div className="space-y-4">
    {driverStandings.map((driver: EnrichedDriverStanding, i: number) => (
                  <div
                    key={`${driver.driverNumber}-${driver.position}`}
                    data-testid={`driver-standing-card-${driver.position}`}
                    className={`bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-4 sm:p-6 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-[#E10600]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)] ${
                      isVisible ? 'animate-fade-in-up' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <span
                          className="font-mono text-4xl font-bold tabular-nums w-12"
                          style={{ color: POSITION_COLORS[driver.position] || 'var(--text-primary)' }}
                        >
                          {driver.position}
                        </span>

                        {driver.headshotUrl ? (
                          <img
                            src={driver.headshotUrl}
                            alt={driver.firstName}
                            className="w-14 h-14 rounded-full object-cover border-2 border-[var(--border-subtle)]"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-zinc-800" />
                        )}

                        <div className="min-w-0">
                          <div className="font-semibold text-[17px] text-[var(--text-primary)]">
                            {driver.firstName} {driver.lastName}
                          </div>
                          <div className="text-sm text-[var(--text-secondary)]">{driver.team}</div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right pl-[72px] sm:pl-0">
                        <div className="font-mono text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                          {driver.points}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">PTS</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CONSTRUCTORS TAB */}
            {activeTab === 'constructors' && (
  <div className="space-y-4">
    {constructorStandings.map((constructor: EnrichedConstructorStanding, i: number) => {
                  const branding = getConstructorBranding(constructor.name);

                  return <div
                    key={`${constructor.name}-${constructor.position}`}
                    data-testid={`constructor-standing-card-${constructor.position}`}
                    className={`rounded-[30px] border p-4 sm:p-6 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(0,0,0,0.14)] ${
                      isVisible ? 'animate-fade-in-up' : 'opacity-0'
                    }`}
                    style={{
                      animationDelay: `${i * 40}ms`,
                      borderColor: `${constructor.teamColor}33`,
                      background: `linear-gradient(135deg, ${constructor.teamSecondaryColor} 0%, rgba(0,0,0,0.15) 45%, var(--bg-surface) 100%)`,
                    }}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4 min-w-0">
                        <span
                          className="font-mono text-4xl font-bold tabular-nums w-12"
                          style={{ color: POSITION_COLORS[constructor.position] || 'var(--text-primary)' }}
                        >
                          {constructor.position}
                        </span>

                        <div
                          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold tracking-[0.14em]"
                          style={{
                            backgroundColor: constructor.teamColor,
                            borderColor: `${constructor.teamColor}55`,
                            color: branding.accentText,
                          }}
                        >
                          {constructor.logoText}
                        </div>

                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/52">
                            {constructor.base}
                          </div>
                          <div className="mt-1 font-semibold text-[18px] text-white">
                            {constructor.name}
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: constructor.teamColor }} />
                            <span className="text-sm text-white/70">Constructor campaign</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
                        <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">Points</div>
                          <div className="mt-1 font-mono text-3xl font-bold text-white tabular-nums">
                          {constructor.points}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">Brand</div>
                          <div className="mt-1 text-base font-semibold text-white">{constructor.logoText}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
