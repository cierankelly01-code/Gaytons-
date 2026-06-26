"use client";

/* eslint-disable @next/next/no-img-element -- intentional: a plain <img> with an
   onError fallback to a coloured block is the whole point of this component;
   next/image can't render the placeholder-on-error behaviour we want here. */

import { useState } from "react";

// Shows the board photo if present, otherwise a warm solid-colour block with
// the board name — so a missing /public/boards/*.jpg never looks broken.
export function BoardImage({
  src,
  alt,
  label,
  className = "",
}: {
  src: string;
  alt: string;
  label: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-olive to-olive-dark p-4 text-center ${className}`}
        aria-label={alt}
        role="img"
      >
        <span className="font-display text-lg font-bold text-white/95">{label}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
