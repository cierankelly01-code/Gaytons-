import React, { useState, useEffect } from 'react';
import { ClockIcon } from './Icons';

function getUKCutoff() {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setHours(15, 0, 0, 0);
  if (now >= cutoff) cutoff.setDate(cutoff.getDate() + 1);
  return cutoff;
}

export default function CountdownTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    function tick() {
      const now = new Date();
      const today3pm = new Date(now);
      today3pm.setHours(15, 0, 0, 0);

      if (now >= today3pm) {
        setIsPast(true);
        setSeconds(0);
      } else {
        setIsPast(false);
        setSeconds(Math.floor((today3pm - now) / 1000));
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n) => String(n).padStart(2, '0');

  let colorClass = 'text-green-600 bg-green-50 border-green-200';
  if (seconds < 1800) colorClass = 'text-red-600 bg-red-50 border-red-200';
  else if (seconds < 3600) colorClass = 'text-amber-600 bg-amber-50 border-amber-200';

  if (isPast) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn border bg-gray-50 border-gray-200 max-w-full">
        <ClockIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          <span className="hidden sm:inline">Orders reopen at </span>midnight
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn border max-w-full ${colorClass}`}>
      <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-xs font-semibold whitespace-nowrap">
        <span className="hidden sm:inline">Order closes in </span>
        <span className="font-mono">{hours}h {pad(mins)}m {pad(secs)}s</span>
      </span>
    </div>
  );
}
