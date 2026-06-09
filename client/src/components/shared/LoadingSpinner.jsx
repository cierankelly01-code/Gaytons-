import React from 'react';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClass = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' }[size];
  return (
    <div className={`${sizeClass} border-brand border-t-transparent rounded-full animate-spin ${className}`} role="status" aria-label="Loading" />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <LoadingSpinner size="lg" />
    </div>
  );
}
