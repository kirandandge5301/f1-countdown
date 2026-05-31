import { useState } from 'react';
import { BROADCASTERS, COUNTRY_OPTIONS } from '@/data/broadcasters';
import BroadcastCard from '@/components/BroadcastCard';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export default function HowToWatchSection() {
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [sectionRef, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.15 });

  const countryData = BROADCASTERS[selectedCountry];
  const primary = countryData?.primary;
  const secondary = countryData?.secondary;

  return (
    <section
      ref={sectionRef}
      id="how-to-watch"
      className="px-[clamp(20px,5vw,64px)] py-[clamp(60px,10vh,120px)]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
          <span className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
            BROADCAST
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-[clamp(36px,5vw,56px)] font-semibold text-[var(--text-primary)] tracking-[-0.02em] leading-tight mb-4">
          How to watch.
        </h2>

        {/* Description */}
        <p className="text-base text-[var(--text-secondary)] mb-10">
          Every session &mdash; live, official, and uninterrupted.
        </p>

        {/* Default Cards (F1 TV + Sky Sports) */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <BroadcastCard
            variant="red"
            badge="WORLDWIDE \u00b7 OFFICIAL"
            title="F1 TV Pro."
            description="The official Formula 1 streaming service. Every practice, qualifying, sprint and race &mdash; plus team radio, onboard cameras and live timing."
          />
          <BroadcastCard
            variant="dark"
            badge="UNITED KINGDOM \u00b7 IRELAND"
            title="Sky Sports F1."
            description="The home of Formula 1 in the UK with full race weekend coverage."
          />
        </div>

        {/* Country Selector */}
        <div className={`mb-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">Select your region:</p>
          <div className="flex flex-wrap gap-2">
            {COUNTRY_OPTIONS.map(country => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country.code)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium tracking-[0.08em] transition-all duration-150 ${
                  selectedCountry === country.code
                    ? 'border-[#E10600] bg-[rgba(225,6,0,0.05)] text-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                <span>{country.flag}</span>
                <span className="hidden sm:inline">{country.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Country Broadcast Cards */}
        {primary && secondary && (
          <div key={selectedCountry} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <BroadcastCard
              variant={primary.variant}
              badge={primary.region}
              title={primary.name + '.'}
              description={primary.description}
            />
            <BroadcastCard
              variant={secondary.variant}
              badge={secondary.region}
              title={secondary.name + '.'}
              description={secondary.description}
            />
          </div>
        )}
      </div>
    </section>
  );
}
