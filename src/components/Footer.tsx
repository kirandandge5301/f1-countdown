export default function Footer() {
  return (
    <footer className="px-[clamp(20px,5vw,64px)] py-12 border-t border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-xs text-[var(--text-tertiary)]">
          &copy; 2026 GPCountdown. Not affiliated with Formula 1.
        </span>
        <span className="text-xs text-[var(--text-tertiary)] italic">
          Every second counts.
        </span>
      </div>
    </footer>
  );
}
