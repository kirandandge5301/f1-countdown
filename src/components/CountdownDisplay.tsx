import { useCountdown } from '@/hooks/useCountdown';

interface CountdownDisplayProps {
  targetTime: Date | string | null;
  size?: 'hero' | 'mini';
  showLabels?: boolean;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function CountdownDisplay({ targetTime, size = 'hero', showLabels = true }: CountdownDisplayProps) {
  const { days, hours, minutes, seconds } = useCountdown(targetTime);

  if (size === 'mini') {
    return (
      <span className="font-mono text-sm text-inherit tabular-nums">
        {pad(days)}d : {pad(hours)}h : {pad(minutes)}m : {pad(seconds)}s
      </span>
    );
  }

  const digitClass = "font-mono text-[clamp(60px,12vw,160px)] font-light text-[var(--text-hero-countdown)] tracking-[-0.04em] leading-none tabular-nums";
  const separatorClass = "font-mono text-[clamp(40px,8vw,100px)] font-light text-[var(--text-tertiary)] opacity-50 self-start pt-[clamp(8px,1.5vw,16px)]";
  const labelClass = "text-xs tracking-[0.15em] text-[var(--text-tertiary)] uppercase text-center mt-2";

  return (
    <div className="flex flex-wrap justify-center items-start gap-x-[clamp(16px,4vw,64px)] md:flex-nowrap">
      {/* DAYS */}
      <div className="flex flex-col items-center">
        <span className={digitClass}>{pad(days)}</span>
        {showLabels && <span className={labelClass}>DAYS</span>}
      </div>
      <span className={separatorClass}>:</span>
      {/* HOURS */}
      <div className="flex flex-col items-center">
        <span className={digitClass}>{pad(hours)}</span>
        {showLabels && <span className={labelClass}>HOURS</span>}
      </div>
      <span className={separatorClass}>:</span>
      {/* MINS */}
      <div className="flex flex-col items-center">
        <span className={digitClass}>{pad(minutes)}</span>
        {showLabels && <span className={labelClass}>MINS</span>}
      </div>
      <span className={separatorClass}>:</span>
      {/* SECS */}
      <div className="flex flex-col items-center">
        <span className={digitClass}>{pad(seconds)}</span>
        {showLabels && <span className={labelClass}>SECS</span>}
      </div>
    </div>
  );
}
