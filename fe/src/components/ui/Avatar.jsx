import React from 'react';

export default function Avatar({ name, hue = 162, size = 40, ring = false }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div
      className={`grid place-items-center select-none font-medium rounded-lg ${
        ring ? 'ring-2 ring-[#7C3AED] ring-offset-2' : ''
      }`}
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        fontSize: `${size * 0.35}px`,
        color: `oklch(0.16 0.04 ${hue})`,
        backgroundColor: `oklch(0.74 0.15 ${hue})`,
        border: `2px solid oklch(0.45 0.08 ${hue})`,
      }}
    >
      {initials}
    </div>
  );
}
