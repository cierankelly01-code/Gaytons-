import { useState, useEffect, useCallback, useRef } from 'react';

const TIMEOUT_MS = 30 * 60 * 1000;
const WARN_MS = 25 * 60 * 1000;

export function useSessionTimeout(onTimeout) {
  const [showWarning, setShowWarning] = useState(false);
  const [remaining, setRemaining] = useState(TIMEOUT_MS);
  const lastActivity = useRef(Date.now());
  const warnTimer = useRef(null);
  const logoutTimer = useRef(null);
  const intervalRef = useRef(null);

  const reset = useCallback(() => {
    lastActivity.current = Date.now();
    setShowWarning(false);

    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);

    warnTimer.current = setTimeout(() => setShowWarning(true), WARN_MS);
    logoutTimer.current = setTimeout(() => {
      setShowWarning(false);
      onTimeout();
    }, TIMEOUT_MS);
  }, [onTimeout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivity.current;
      setRemaining(Math.max(0, TIMEOUT_MS - elapsed));
    }, 1000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(warnTimer.current);
      clearTimeout(logoutTimer.current);
      clearInterval(intervalRef.current);
    };
  }, [reset]);

  return { showWarning, remaining, extendSession: reset };
}
