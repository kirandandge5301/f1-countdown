import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

type Tab = 'drivers' | 'constructors';

const POSITION_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32'
};

export default function StandingsSection() {
  const [activeTab, setActiveTab] = useState<Tab>('drivers');
  const [sectionRef, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const { driverStandings, constructorStandings, loading } = useData();

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
        <h2 className="text-[clamp(32px,5vw,52px)] font-semibold text-[var(--text-primary)] tracking-[-0.02em] leading-tight mb-8">
          Championship Standings.
        </h2>

        {/* Tab Control - Better on mobile */}
        <div className="inline-flex w-full sm:w-auto gap-1 bg-[var(--bg-surface)] rounded-xl p-1 mb-8">
          <button
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

        {loading ? (
          <div className="space-y-4 py-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-[var(--bg-surface)] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* DRIVERS TAB */}
            {activeTab === 'drivers' && (
              <div className="space-y-4">
                {driverStandings.map((driver: any, i: number) => (
                  <div
                    key={`${driver.driverNumber}-${driver.position}`}
                    className={`bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 transition-all hover:border-[#E10600]/30 ${
                      isVisible ? 'animate-fade-in-up' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
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

                        <div>
                          <div className="font-semibold text-[17px] text-[var(--text-primary)]">
                            {driver.firstName} {driver.lastName}
                          </div>
                          <div className="text-sm text-[var(--text-secondary)]">{driver.team}</div>
                        </div>
                      </div>

                      <div className="text-right">
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
                {constructorStandings.map((constructor: any, i: number) => (
                  <div
                    key={`${constructor.name}-${constructor.position}`}
                    className={`bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 transition-all hover:border-[#E10600]/30 ${
                      isVisible ? 'animate-fade-in-up' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span
                          className="font-mono text-4xl font-bold tabular-nums w-12"
                          style={{ color: POSITION_COLORS[constructor.position] || 'var(--text-primary)' }}
                        >
                          {constructor.position}
                        </span>

                        <div>
                          <div className="font-semibold text-[17px] text-[var(--text-primary)]">
                            {constructor.name}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                          {constructor.points}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">PTS</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
