import { useState, useEffect, useRef } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalMs: number;
}

function getTimeParts(targetMs: number): CountdownResult {
  const now = Date.now();
  const diff = targetMs - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, totalMs: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false, totalMs: diff };
}

export function useCountdown(targetTime: Date | string | null): CountdownResult {
  const targetMsRef = useRef<number>(0);

  if (targetTime) {
    targetMsRef.current = new Date(targetTime).getTime();
  }

  const [result, setResult] = useState<CountdownResult>(() =>
    targetMsRef.current > 0 ? getTimeParts(targetMsRef.current) : {
      days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, totalMs: 0
    }
  );

  useEffect(() => {
    if (!targetTime) return;
    const targetMs = new Date(targetTime).getTime();
    targetMsRef.current = targetMs;

    setResult(getTimeParts(targetMs));

    const interval = setInterval(() => {
      setResult(getTimeParts(targetMsRef.current));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return result;
}
