import React from 'react';

export default function Pagination({ page, pages, total, onPage }) {
  if (pages <= 1) return null;

  const pageNumbers = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500">
        Page {page} of {pages} ({total} total)
      </p>
      <div className="flex gap-1">
        <button
          className="px-3 py-1.5 text-sm rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        {pageNumbers.map((n) => (
          <button
            key={n}
            className={`px-3 py-1.5 text-sm rounded border ${
              n === page
                ? 'bg-brand text-white border-brand'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => onPage(n)}
          >
            {n}
          </button>
        ))}
        <button
          className="px-3 py-1.5 text-sm rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          onClick={() => onPage(page + 1)}
          disabled={page === pages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
