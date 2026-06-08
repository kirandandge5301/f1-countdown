import { useData } from '@/context/DataContext';

export default function Footer() {
  const { seasonYear } = useData();

  return (
    <footer className="px-[clamp(20px,5vw,64px)] py-12 border-t border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-[var(--text-tertiary)] text-center sm:text-left">
          &copy; {seasonYear} GPCountdown. Not affiliated with Formula 1.
        </span>
        <div className="text-center sm:text-right">
          <div className="text-sm font-medium tracking-[-0.02em] text-[var(--text-primary)]">GPCountdown</div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-tertiary)] mt-1">Every Second Matters.</div>
        </div>
      </div>
    </footer>
  );
}
