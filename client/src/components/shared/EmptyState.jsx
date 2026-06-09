import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="w-16 h-16 text-gray-300 mb-4">{icon}</div>}
      <h3 className="font-display text-xl text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  );
}
