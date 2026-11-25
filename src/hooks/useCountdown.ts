import { useState, useEffect } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalMs: number;
}

const EXPIRED: CountdownResult = { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, totalMs: 0 };

function getTimeParts(targetMs: number): CountdownResult {
  const now = Date.now();
  const diff = targetMs - now;

  if (diff <= 0) return EXPIRED;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false, totalMs: diff };
}

export function useCountdown(targetTime: Date | string | null): CountdownResult {
  // A number, so the effect below only restarts when the target really changes
  // (a fresh Date object on every redraw used to restart the timer each time).
  const targetMs = targetTime ? new Date(targetTime).getTime() : NaN;
  const hasTarget = Number.isFinite(targetMs);

  const [result, setResult] = useState<CountdownResult>(() => (hasTarget ? getTimeParts(targetMs) : EXPIRED));

  useEffect(() => {
    const update = () => setResult(hasTarget ? getTimeParts(targetMs) : EXPIRED);
    // The first value comes from useState above; this refreshes it right after the target
    // changes, then once a second while there is a target.
    const first = setTimeout(update, 0);
    const interval = hasTarget ? setInterval(update, 1000) : undefined;
    return () => {
      clearTimeout(first);
      if (interval) clearInterval(interval);
    };
  }, [targetMs, hasTarget]);

  return result;
}
