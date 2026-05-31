import { useState } from 'react';
import { DRIVERS_STANDINGS, CONSTRUCTORS_STANDINGS } from '@/data/standings';
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
        <h2 className="text-[clamp(36px,5vw,56px)] font-semibold text-[var(--text-primary)] tracking-[-0.02em] leading-tight mb-8">
          Championship Standings.
        </h2>

        {/* Tab Control */}
        <div className="inline-flex gap-1 bg-[var(--bg-surface)] rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'drivers'
                ? 'bg-[#E10600] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Drivers Championship
          </button>
          <button
            onClick={() => setActiveTab('constructors')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'constructors'
                ? 'bg-[#E10600] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Constructors Championship
          </button>
        </div>

        {/* Drivers Table */}
        {activeTab === 'drivers' && (
          <div key="drivers" className="animate-fade-in">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-[50px_1fr_80px_60px] gap-4 py-3 border-b border-[var(--border-subtle)]">
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase">POS</span>
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase">DRIVER</span>
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase text-right">PTS</span>
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase text-right">WINS</span>
            </div>

            {/* Driver Rows */}
            {DRIVERS_STANDINGS.map((driver, i) => (
              <div
                key={driver.position}
                className={`grid grid-cols-[auto_1fr_auto] sm:grid-cols-[50px_1fr_80px_60px] gap-2 sm:gap-4 py-4 border-b border-[var(--border-subtle)] items-center transition-colors hover:bg-[var(--row-hover)] ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Position */}
                <span
                  className="font-mono text-xl font-bold tabular-nums"
                  style={{ color: POSITION_COLORS[driver.position] || 'var(--text-primary)' }}
                >
                  {driver.position}
                </span>

                {/* Driver Name + Team */}
                <div className="flex items-center gap-3">
                  <span
                    className="w-1 h-4 rounded-full shrink-0 hidden sm:block"
                    style={{ backgroundColor: driver.teamColor }}
                  />
                  <div>
                    <span className="text-base font-semibold text-[var(--text-primary)] block">
                      {driver.firstName} {driver.lastName}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {driver.team}
                    </span>
                  </div>
                </div>

                {/* Points */}
                <span className="font-mono text-xl font-bold text-[var(--text-primary) text-right tabular-nums">
                  {driver.points}
                </span>

                {/* Wins */}
                <span className="text-sm text-[var(--text-secondary)] text-right hidden sm:block">
                  {driver.wins}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Constructors Table */}
        {activeTab === 'constructors' && (
          <div key="constructors" className="animate-fade-in">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-[50px_1fr_80px_60px] gap-4 py-3 border-b border-[var(--border-subtle)]">
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase">POS</span>
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase">CONSTRUCTOR</span>
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase text-right">PTS</span>
              <span className="text-[11px] tracking-[0.1em] text-[var(--text-tertiary)] uppercase text-right">WINS</span>
            </div>

            {/* Constructor Rows */}
            {CONSTRUCTORS_STANDINGS.map((constructor, i) => (
              <div
                key={constructor.position}
                className={`grid grid-cols-[auto_1fr_auto] sm:grid-cols-[50px_1fr_80px_60px] gap-2 sm:gap-4 py-4 border-b border-[var(--border-subtle)] items-center transition-colors hover:bg-[var(--row-hover)] ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Position */}
                <span
                  className="font-mono text-xl font-bold tabular-nums"
                  style={{ color: POSITION_COLORS[constructor.position] || 'var(--text-primary)' }}
                >
                  {constructor.position}
                </span>

                {/* Constructor Name + Color */}
                <div className="flex items-center gap-3">
                  <span
                    className="w-1 h-6 rounded-full shrink-0 hidden sm:block"
                    style={{ backgroundColor: constructor.teamColor }}
                  />
                  <span className="text-base font-semibold text-[var(--text-primary)]">
                    {constructor.name}
                  </span>
                </div>

                {/* Points */}
                <span className="font-mono text-xl font-bold text-[var(--text-primary)] text-right tabular-nums">
                  {constructor.points}
                </span>

                {/* Wins */}
                <span className="text-sm text-[var(--text-secondary)] text-right hidden sm:block">
                  {constructor.wins}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
