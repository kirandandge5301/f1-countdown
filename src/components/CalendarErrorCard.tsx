interface CalendarErrorCardProps {
  message: string;
  onRetry: () => void;
}

// Shown when the race calendar can't be loaded. Same look as the standings error card.
export default function CalendarErrorCard({ message, onRetry }: CalendarErrorCardProps) {
  return (
    <div
      role="alert"
      className="max-w-xl mx-auto bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-8 text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
        <span className="font-semibold text-[17px] text-[var(--text-primary)]">{message}</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        The schedule service didn't respond. Please try again in a moment.
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-3 rounded-lg text-sm font-medium bg-[#E10600] text-white transition-all duration-200 hover:opacity-90"
      >
        Retry
      </button>
    </div>
  );
}
