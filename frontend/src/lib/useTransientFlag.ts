import { useCallback, useEffect, useRef, useState } from 'react';

export function useTransientFlag(duration = 420) {
  const [active, setActive] = useState(false);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearPending = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const trigger = useCallback(() => {
    clearPending();
    setActive(false);

    frameRef.current = window.requestAnimationFrame(() => {
      setActive(true);
      timeoutRef.current = window.setTimeout(() => {
        setActive(false);
        timeoutRef.current = null;
      }, duration);
    });
  }, [clearPending, duration]);

  useEffect(() => () => clearPending(), [clearPending]);

  return { active, trigger };
}
