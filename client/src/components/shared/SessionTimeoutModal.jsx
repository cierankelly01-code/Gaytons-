import React from 'react';
import { ExclamationIcon } from './Icons';

export default function SessionTimeoutModal({ remaining, onExtend }) {
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-card shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExclamationIcon className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="font-display text-xl text-gray-900 mb-2">Session expiring soon</h3>
        <p className="text-gray-600 text-sm mb-2">
          Your session will expire in{' '}
          <span className="font-semibold text-amber-600 font-mono">
            {mins}:{String(secs).padStart(2, '0')}
          </span>
        </p>
        <p className="text-gray-500 text-xs mb-6">Click below to stay logged in.</p>
        <button className="btn-primary w-full" onClick={onExtend}>
          Keep me logged in
        </button>
      </div>
    </div>
  );
}
