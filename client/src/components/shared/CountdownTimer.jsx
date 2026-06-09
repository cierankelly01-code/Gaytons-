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
      <div className="flex items-center gap-2 px-4 py-2 rounded-btn border bg-gray-50 border-gray-200">
        <ClockIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-500">Orders reopen at midnight</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-btn border ${colorClass}`}>
      <ClockIcon className="w-4 h-4" />
      <span className="text-sm font-semibold">
        Order closes in{' '}
        <span className="font-mono text-base">
          {hours}h {pad(mins)}m {pad(secs)}s
        </span>
      </span>
    </div>
  );
}
