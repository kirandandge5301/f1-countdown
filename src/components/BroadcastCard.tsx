import { Globe, Tv, ArrowUpRight } from 'lucide-react';

interface BroadcastCardProps {
  variant: 'red' | 'dark';
  badge: string;
  title: string;
  description: string;
}

export default function BroadcastCard({ variant, badge, title, description }: BroadcastCardProps) {
  const isRed = variant === 'red';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-10 min-h-[320px] flex flex-col transition-transform duration-300 cursor-default ${
        isRed
          ? 'bg-[#E10600] text-white'
          : 'bg-[var(--broadcast-dark-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]'
      } hover:-translate-y-0.5`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {/* Badge */}
      <div className={`flex items-center gap-1.5 text-[10px] font-medium tracking-[0.2em] uppercase ${isRed ? 'text-white/70' : 'text-[var(--text-tertiary)]'}`}>
        {isRed ? <Globe size={12} className="text-white/50" /> : <Tv size={12} className="text-[var(--text-tertiary)]" />}
        {badge}
      </div>

      {/* Arrow */}
      <ArrowUpRight
        size={16}
        className={`absolute top-6 right-6 ${isRed ? 'text-white/50' : 'text-[var(--text-tertiary)]'}`}
      />

      {/* Content */}
      <div className="mt-auto">
        <h3 className={`text-[clamp(28px,3vw,48px)] font-bold tracking-[-0.02em] leading-tight ${isRed ? 'text-white' : 'text-[var(--text-primary)]'}`}>
          {title}
        </h3>
        <p className={`text-sm leading-relaxed mt-3 max-w-[320px] ${isRed ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
          {description}
        </p>
      </div>
    </div>
  );
}
