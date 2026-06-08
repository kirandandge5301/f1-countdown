import type { CircuitInfo } from '@/data/circuitInfo';

interface CircuitDetailsCardProps {
  meetingName: string;
  circuitName: string;
  circuitInfo: CircuitInfo | null;
  isVisible: boolean;
}

const detailItems = (circuitInfo: CircuitInfo | null) => [
  { label: 'Circuit Length', value: circuitInfo?.length || 'TBC' },
  { label: 'Laps', value: circuitInfo?.laps ? String(circuitInfo.laps) : 'TBC' },
  { label: 'Race Distance', value: circuitInfo?.distance || 'TBC' },
  { label: 'Lap Record', value: circuitInfo?.lapRecord || 'Still being confirmed' },
  { label: 'First Grand Prix', value: circuitInfo?.firstGrandPrix ? String(circuitInfo.firstGrandPrix) : 'TBC' },
  { label: 'DRS Zones', value: circuitInfo?.drsZones ? String(circuitInfo.drsZones) : 'TBC' },
];

export default function CircuitDetailsCard({ meetingName, circuitName, circuitInfo, isVisible }: CircuitDetailsCardProps) {
  return (
    <div
      data-testid="next-race-circuit-card"
      className={`rounded-[32px] border border-[var(--border-subtle)] bg-[linear-gradient(140deg,rgba(255,255,255,0.02),transparent_45%),var(--bg-surface)] p-5 sm:p-7 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-[#E10600]/20 hover:shadow-[0_24px_90px_rgba(0,0,0,0.12)] ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-[#E10600]/18 bg-[#E10600]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E10600]">
            Premium Circuit Card
          </div>
          <h3 className="mt-4 text-[clamp(26px,4vw,40px)] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
            {circuitName}
          </h3>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-[var(--text-secondary)]">
            Everything you need before lights out at {meetingName.replace(' Grand Prix', '')} — distance, lap count, record pace, and the shape of the circuit story.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Fan Note</div>
          <div className="mt-2 text-sm text-[var(--text-primary)] max-w-[280px]">
            {circuitInfo?.fact || 'Track details will sharpen the picture as the weekend approaches.'}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {detailItems(circuitInfo).map((item, index) => (
          <div
            key={item.label}
            className={`rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-5 ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${100 + index * 50}ms` }}
          >
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{item.label}</div>
            <div className="mt-3 text-lg font-semibold text-[var(--text-primary)] leading-snug">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
