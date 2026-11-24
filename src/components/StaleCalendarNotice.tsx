interface StaleCalendarNoticeProps {
  /** When the calendar shown was last loaded successfully */
  since: Date;
  onRetry: () => void;
}

// Shown above a calendar that could not be refreshed: it says so, and how old it is.
export default function StaleCalendarNotice({ since, onRetry }: StaleCalendarNoticeProps) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-tertiary)]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
      <span>
        Couldn't refresh the calendar. Showing the saved version · as of{' '}
        {since.toLocaleString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </span>
      <button
        onClick={onRetry}
        className="underline underline-offset-2 hover:text-[var(--text-primary)] transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
