import { lazy, Suspense, useState } from 'react';
import { Share2 } from 'lucide-react';
import type { CardType } from './cardModel';
import type { QualifyingResult } from './useQualifying';

const ShareDialog = lazy(() => import('./ShareDialog'));

interface Props {
  label: string;
  type: CardType;
  qualifying?: QualifyingResult | null;
}

/** Opens the share dialog; its code is only downloaded on the first click. */
export default function ShareButton({ label, type, qualifying = null }: Props) {
  const [open, setOpen] = useState(false);
  // A new key per opening: the dialog always starts from the current moment
  const [opened, setOpened] = useState(0);

  return (
    <>
      <button
        onClick={() => { setOpened(n => n + 1); setOpen(true); }}
        className="px-8 py-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-sm font-medium flex items-center gap-2 transition-all active:scale-95"
      >
        <Share2 size={16} aria-hidden /> {label}
      </button>
      {opened > 0 && (
        <Suspense fallback={null}>
          <ShareDialog key={opened} open={open} onOpenChange={setOpen} initialType={type} qualifying={qualifying} />
        </Suspense>
      )}
    </>
  );
}
